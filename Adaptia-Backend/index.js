import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;

import { createDatabaseSchema } from './src/auth/models.js';
import { getResourceFilter } from './src/auth/permissions.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// --- 1. CONFIGURACIÓN DE POSTGRESQL (Neon Cloud) ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// --- 2. INICIALIZACIÓN ---
pool.query(createDatabaseSchema)
    .then(() => console.log("✨ Tablas sincronizadas en Neon"))
    .catch(err => console.error("❌ Error DB:", err));

// --- 3. ENDPOINTS DE AUTENTICACIÓN ---

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Ajustado a la tabla 'users' y columna 'password_hash' según tu DB de Neon
        const query = 'SELECT id, name, email, password_hash FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);

        if (rows.length > 0) {
            const user = rows[0];

            // Validación directa (texto plano por ahora para tu MVP)
            if (user.password_hash === password) {
                // Eliminamos el hash antes de enviar la respuesta al frontend
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

// --- 4. ENDPOINTS DE RECURSOS ---

app.get('/', (req, res) => res.send('🚀 Adaptia API Operativa'));

// CITAS: Con filtros de permisos y resolución de ambigüedad
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
            SELECT 
                a.id, a.date, a.status, a.owner_member_id, 
                p.name as patient_name 
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

// PACIENTES: Lista general
app.get('/api/patients', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM patients ORDER BY name ASC');
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: "Error en base de pacientes" });
    }
});

// CLÍNICAS: Lista general
app.get('/api/clinics', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM clinics ORDER BY id ASC');
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: "Error en base de clínicas" });
    }
});

// ACCIONES: REGISTRO DE PACIENTE
app.post('/api/patients', async (req, res) => {
    try {
        const { name, ownerMemberId, history } = req.body;

        const query = `
            INSERT INTO patients (name, owner_member_id, history) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;

        const values = [
            name,
            ownerMemberId || 1,
            history ? JSON.stringify(history) : '{}'
        ];

        const { rows } = await req.pool.query(query, values);
        res.status(201).json({ data: rows[0] });
    } catch (err) {
        console.error("❌ Error al crear paciente:", err.message);
        res.status(500).json({ error: "Error al crear el registro en la nube" });
    }
});

// ACCIONES: CONSENTIMIENTO (Toggle)
app.get('/api/toggle-esteban', async (req, res) => {
    try {
        const current = await pool.query("SELECT is_granted FROM consents WHERE member_id = 2 AND resource_type = 'appointments'");
        const newValue = current.rows.length > 0 ? !current.rows[0].is_granted : true;
        await pool.query(`
            INSERT INTO consents (member_id, resource_type, is_granted, clinic_id)
            VALUES (2, 'appointments', $1, 1)
            ON CONFLICT (member_id, resource_type, clinic_id) DO UPDATE SET is_granted = $1
        `, [newValue]);
        res.send(`Estado: ${newValue ? 'Compartiendo' : 'Privado'}`);
    } catch (err) {
        res.status(500).send("Error");
    }
});

app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));