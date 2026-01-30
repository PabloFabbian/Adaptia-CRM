import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;

import { createDatabaseSchema } from './src/auth/models.js';
import { getResourceFilter } from './src/auth/permissions.js';
import patientRouter from './src/patients/patients.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use((req, res, next) => {
    req.pool = pool;
    next();
});

pool.query(createDatabaseSchema)
    .then(() => console.log("✨ Tablas sincronizadas en Neon"))
    .catch(err => console.error("❌ Error DB:", err));

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = 'SELECT id, name, email, password_hash FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        if (rows.length > 0) {
            const user = rows[0];
            if (user.password_hash === password) {
                const { password_hash: _, ...userWithoutPassword } = user;
                return res.json({ user: userWithoutPassword });
            }
        }
        res.status(401).json({ message: "Email o contraseña incorrectos" });
    } catch (err) {
        console.error("❌ Error en Login:", err.message);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

app.use('/api/patients', patientRouter);

// --- ENDPOINTS DE NOTAS Y PDF ---

app.get('/api/patients/:id/notes', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT cn.id, cn.patient_id, cn.member_id, cn.content, cn.title, cn.summary, cn.category, cn.created_at, m.name as author 
            FROM clinical_notes cn
            LEFT JOIN members m ON cn.member_id = m.id
            WHERE cn.patient_id = $1
            ORDER BY cn.created_at DESC
        `;
        const { rows } = await req.pool.query(query, [id]);
        res.json({ data: rows });
    } catch (err) {
        console.error("❌ Error al obtener notas:", err.message);
        res.status(500).json({ error: "Error al obtener el historial" });
    }
});

// NUEVO: ENDPOINT PARA EXPORTAR PDF (Combina paciente y notas)
app.get('/api/patients/:id/export-pdf', async (req, res) => {
    const { id } = req.params;
    try {
        const patientRes = await req.pool.query('SELECT id, name, email, phone, history FROM patients WHERE id = $1', [id]);
        if (patientRes.rows.length === 0) return res.status(404).json({ error: "Paciente no encontrado" });

        const notesRes = await req.pool.query(
            'SELECT title, content, summary, category, created_at FROM clinical_notes WHERE patient_id = $1 ORDER BY created_at DESC',
            [id]
        );

        res.json({
            patient: patientRes.rows[0],
            notes: notesRes.rows
        });
    } catch (err) {
        console.error("❌ Error en export-pdf:", err.message);
        res.status(500).json({ error: "Error al recopilar datos para PDF" });
    }
});

app.post('/api/clinical-notes', async (req, res) => {
    const { patient_id, member_id, content, title, summary, category } = req.body;
    if (!patient_id || !content) return res.status(400).json({ error: "Datos incompletos" });
    try {
        const query = `
            INSERT INTO clinical_notes (patient_id, member_id, content, title, summary, category, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *;
        `;
        const values = [patient_id, member_id || 1, content, title || 'Nota', summary || '', category || 'Evolución'];
        const { rows } = await req.pool.query(query, values);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        console.error("❌ Error SQL:", err.message);
        res.status(500).json({ error: "Error interno" });
    }
});

app.get(['/api/appointments', '/api/appointments/all'], async (req, res) => {
    try {
        const viewerMemberId = 1;
        const clinicId = 1;
        let filter;
        try {
            filter = await getResourceFilter(req.pool, viewerMemberId, clinicId, 'appointments');
        } catch (e) {
            filter = { query: '1=1', params: [] };
        }
        const query = `
            SELECT a.id, a.date, a.status, a.owner_member_id, p.name as patient_name 
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            WHERE a.${filter.query} 
            ORDER BY a.date DESC
        `;
        const { rows } = await req.pool.query(query, filter.params);
        res.json({ data: rows || [] });
    } catch (err) {
        console.error("❌ Error en SQL Appointments:", err.message);
        res.status(200).json({ data: [], message: "Error controlado" });
    }
});

app.get('/', (req, res) => res.send('🚀 Adaptia API Operativa'));

app.listen(PORT, () => console.log(`🚀 Servidor Adaptia corriendo en puerto ${PORT}`));