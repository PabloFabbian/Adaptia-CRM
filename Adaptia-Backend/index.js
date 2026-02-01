import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import nodemailer from 'nodemailer';
const { Pool } = pg;

// Importaciones de lógica de negocio
import { createDatabaseSchema } from './src/auth/models.js';
import { getResourceFilter } from './src/auth/permissions.js';
import patientRouter from './src/patients/patients.js';
import clinicRouter from './src/clinics/clinics.js';
import { getRoles } from './src/clinics/roles.js';

const app = express();

// --- CONFIGURACIÓN DE NODEMAILER ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Configuración de CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const PORT = process.env.PORT || 3001;

// Conexión a Neon (PostgreSQL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Middleware para inyectar el pool en cada request
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// Sincronización automática de esquema
pool.query(createDatabaseSchema)
    .then(() => console.log("✨ Tablas sincronizadas en Neon"))
    .catch(err => console.error("❌ Error DB al sincronizar:", err));

// --- 1. AUTENTICACIÓN (LOGIN & REGISTRO) ---

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = `
            SELECT u.id, u.name, u.email, u.password_hash, r.name as role_name, m.clinic_id 
            FROM users u
            LEFT JOIN members m ON u.id = m.user_id 
            LEFT JOIN roles r ON m.role_id = r.id
            WHERE u.email = $1
        `;
        const { rows } = await pool.query(query, [email]);
        if (rows.length > 0) {
            const user = rows[0];
            if (user.password_hash === password) {
                return res.json({
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role_name || 'Especialista',
                        activeClinicId: user.clinic_id
                    }
                });
            }
        }
        res.status(401).json({ message: "Email o contraseña incorrectos" });
    } catch (err) {
        console.error("❌ Error en Login:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// REGISTRO (Añadido para el flujo de invitaciones)
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        const query = `
            INSERT INTO users (name, email, password_hash, created_at)
            VALUES ($1, $2, $3, NOW()) RETURNING id, name, email;
        `;
        const { rows } = await pool.query(query, [name, email, password]);
        res.status(201).json({ success: true, user: rows[0] });
    } catch (err) {
        console.error("❌ Error en Registro:", err);
        res.status(500).json({ message: "Error al crear la cuenta" });
    }
});

// --- 2. RUTAS DE MÓDULOS (Routers Externos) ---
app.use('/api/patients', patientRouter);
app.use('/api/clinics', clinicRouter);
app.get('/api/roles', getRoles);

// --- 3. GESTIÓN DE INVITACIONES ---
// Este endpoint genera el correo que diseñamos
app.post('/api/clinics/:id/invitations', async (req, res) => {
    const { id: clinic_id } = req.params;
    const { email, role_id, invited_by } = req.body;

    if (!email || !role_id) {
        return res.status(400).json({ message: "Email y Nivel de gobernanza son obligatorios" });
    }

    try {
        const query = `
            INSERT INTO invitations (clinic_id, email, role_id, invited_by, status, created_at)
            VALUES ($1, $2, $3, $4, 'pending', NOW())
            RETURNING *;
        `;

        const values = [
            parseInt(clinic_id),
            email.trim().toLowerCase(),
            parseInt(role_id),
            invited_by ? parseInt(invited_by) : null
        ];

        const { rows } = await req.pool.query(query, values);

        // Envío de Email con link dinámico
        const mailOptions = {
            from: `"Adaptia" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Invitación a colaborar en Adaptia',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 20px; max-width: 400px; margin: auto;">
                    <div style="background: #50e3c2; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                        <span style="font-weight: bold; font-size: 20px;">A</span>
                    </div>
                    <h2 style="color: #101828;">¡Hola!</h2>
                    <p style="color: #374151;">Has sido invitado a unirte a la red profesional de <strong>Adaptia</strong>.</p>
                    <div style="margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?token=${rows[0].id}&email=${email}" 
                           style="background: #101828; color: #50e3c2; padding: 14px 25px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
                           Aceptar Invitación
                        </a>
                    </div>
                    <p style="font-size: 12px; color: #6b7280;">Si no esperabas este correo, puedes ignorarlo.</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions).catch(e => console.error("⚠️ Error mailer:", e.message));
        res.status(201).json({ success: true, data: rows[0] });

    } catch (err) {
        console.error("❌ Error en Invitación:", err.message);
        res.status(400).json({ message: "Error al procesar la invitación" });
    }
});

// --- 4. NOTAS CLÍNICAS ---
app.get('/api/patients/:id/notes', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT cn.*, m.name as author 
            FROM clinical_notes cn
            LEFT JOIN members m ON cn.member_id = m.id
            WHERE cn.patient_id = $1
            ORDER BY cn.created_at DESC
        `;
        const { rows } = await req.pool.query(query, [id]);
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: "Error al obtener historial de notas" });
    }
});

app.post('/api/clinical-notes', async (req, res) => {
    const { patient_id, member_id, content, title, summary, category } = req.body;
    try {
        const query = `
            INSERT INTO clinical_notes (patient_id, member_id, content, title, summary, category, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *;
        `;
        const values = [patient_id, member_id || 1, content, title || 'Nota', summary || '', category || 'Evolución'];
        const { rows } = await req.pool.query(query, values);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al guardar nota clínica" });
    }
});

// --- 5. CITAS CON GOBERNANZA ---
app.get(['/api/appointments', '/api/appointments/all'], async (req, res) => {
    try {
        const viewerMemberId = 1;
        const clinicId = 1;

        const filter = await getResourceFilter(req.pool, viewerMemberId, clinicId, 'appointments');

        const query = `
            SELECT a.*, p.name as patient_name 
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            WHERE a.clinic_id = $1 AND ${filter.query} 
            ORDER BY a.date DESC
        `;

        const { rows } = await pool.query(query, [clinicId, ...filter.params]);
        res.json({ data: rows || [] });
    } catch (err) {
        console.error("❌ Error en Appointments:", err.message);
        res.status(200).json({ data: [] });
    }
});

app.get('/', (req, res) => res.send('🚀 Adaptia API Operativa'));

app.listen(PORT, () => console.log(`🚀 Servidor Adaptia corriendo en puerto ${PORT}`));