import express from 'express';
import React from 'react';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import InviteEmail from '../emails/InviteEmail.jsx';
import { getRoles } from './roles.js';

const router = express.Router();

// --- CONFIGURACIÓN DE NODEMAILER ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- 1. CONFIGURACIÓN DE ROLES ---
router.get('/roles', getRoles);

// --- 2. LECTURA Y VALIDACIÓN ---

// Valida si el token de la URL existe y está pendiente
router.get('/invitations/validate/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const query = `
            SELECT i.token, i.email, i.status, c.name as clinic_name, r.name as role_name 
            FROM invitations i
            JOIN clinics c ON i.clinic_id = c.id
            JOIN roles r ON i.role_id = r.id
            WHERE i.token = $1 AND i.status = 'pending'
        `;
        const { rows } = await req.pool.query(query, [token]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Invitación no válida o expirada." });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("❌ Error validando token:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.get('/:clinicId/members-and-invitations', async (req, res) => {
    const { clinicId } = req.params;
    try {
        const membersQuery = `
            SELECT m.id, m.name, u.email, r.name as role_name, m.user_id,
                COALESCE(
                    (SELECT json_agg(json_build_object('type', c.resource_type, 'granted', c.is_granted))
                    FROM consents c WHERE c.member_id = m.id), '[]'
                ) as consents
            FROM members m 
            JOIN roles r ON m.role_id = r.id 
            LEFT JOIN users u ON m.user_id = u.id 
            WHERE m.clinic_id = $1
            ORDER BY m.id DESC
        `;

        const invitationsQuery = `
            SELECT i.id, i.email, r.name as role_name, i.status, i.created_at
            FROM invitations i 
            JOIN roles r ON i.role_id = r.id 
            WHERE i.clinic_id = $1 AND i.status = 'pending'
            ORDER BY i.created_at DESC
        `;

        const [membersRes, invitationsRes] = await Promise.all([
            req.pool.query(membersQuery, [clinicId]),
            req.pool.query(invitationsQuery, [clinicId])
        ]);

        res.json({ members: membersRes.rows, invitations: invitationsRes.rows });
    } catch (err) {
        res.status(500).json({ error: "No se pudo obtener el directorio" });
    }
});

// --- 3. GESTIÓN DE INVITACIONES ---

router.post('/:clinicId/invitations', async (req, res) => {
    const { clinicId } = req.params;
    const { email, role_id, invited_by } = req.body;

    // Generamos un token alfanumérico único
    const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

    try {
        // 1. Guardar en base de datos
        const query = `
            INSERT INTO invitations (clinic_id, email, role_id, token, invited_by, status, created_at)
            VALUES ($1, $2, $3, $4, $5, 'pending', NOW()) RETURNING *;
        `;
        const { rows } = await req.pool.query(query, [clinicId, email.toLowerCase(), role_id, token, invited_by]);

        // 2. Obtener nombres para el correo
        const infoQuery = `
            SELECT 
                (SELECT name FROM clinics WHERE id = $1) as clinic_name,
                (SELECT name FROM users WHERE id = $2) as sender_name
        `;
        const infoRes = await req.pool.query(infoQuery, [clinicId, invited_by]);

        const clinicName = infoRes.rows[0]?.clinic_name || "Adaptia Clinic";
        const senderName = infoRes.rows[0]?.sender_name || "Un colega";
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?token=${token}`;

        // 3. Renderizar y enviar correo
        const emailHtml = await render(
            React.createElement(InviteEmail, {
                clinicName,
                senderName,
                inviteLink
            })
        );

        const mailOptions = {
            from: `"Adaptia" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `${senderName} te ha invitado a unirte a ${clinicName}`,
            html: emailHtml,
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ success: true, invitation: rows[0] });

    } catch (err) {
        console.error("❌ Error en flujo de invitación:", err);
        res.status(500).json({ error: "Error al procesar invitación" });
    }
});

// --- 4. ACEPTACIÓN Y SOBERANÍA ---

router.post('/accept-invitation', async (req, res) => {
    const { token, userId } = req.body;
    try {
        await req.pool.query('BEGIN');

        // 1. Verificar invitación
        const invRes = await req.pool.query(
            'SELECT * FROM invitations WHERE token = $1 AND status = $2',
            [token, 'pending']
        );
        if (invRes.rows.length === 0) throw new Error("Invitación no válida o expirada.");

        const invitation = invRes.rows[0];

        // 2. Crear miembro (Sincronizando el nombre desde la tabla users)
        const memberQuery = `
            INSERT INTO members (name, role_id, clinic_id, user_id) 
            SELECT name, $1, $2, $3 FROM users WHERE id = $3
            RETURNING id, name;
        `;
        const memberRes = await req.pool.query(memberQuery, [invitation.role_id, invitation.clinic_id, userId]);
        const newMemberId = memberRes.rows[0].id;

        // 3. Configurar Soberanía de Datos Inicial (Todo en FALSE por defecto)
        const resources = ['patients', 'appointments', 'clinical_notes'];
        const values = resources.map(r => `(${newMemberId}, '${r}', false)`).join(',');

        await req.pool.query(`INSERT INTO consents (member_id, resource_type, is_granted) VALUES ${values}`);

        // 4. Marcar invitación como aceptada
        await req.pool.query('UPDATE invitations SET status = $1 WHERE token = $2', ['accepted', token]);

        await req.pool.query('COMMIT');
        res.json({ success: true, member: memberRes.rows[0] });
    } catch (err) {
        await req.pool.query('ROLLBACK');
        console.error("❌ Error aceptando invitación:", err.message);
        res.status(400).json({ error: err.message });
    }
});

router.patch('/consent', async (req, res) => {
    const { memberId, resourceType, isGranted } = req.body;
    try {
        const query = `
            INSERT INTO consents (member_id, resource_type, is_granted)
            VALUES ($1, $2, $3)
            ON CONFLICT (member_id, resource_type) 
            DO UPDATE SET is_granted = EXCLUDED.is_granted
            RETURNING *;
        `;
        const { rows } = await req.pool.query(query, [memberId, resourceType, isGranted]);
        res.json({ success: true, consent: rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error de soberanía" });
    }
});

export default router;