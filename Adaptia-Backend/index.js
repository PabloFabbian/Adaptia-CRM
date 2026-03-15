import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './src/config/db.js';
import { createDatabaseSchema } from './src/auth/models.js';

// Importación de Routers
import patientRouter from './src/patients/patients.js';
import clinicRouter from './src/clinics/clinics.routes.js';
import appointmentRouter from './src/appointments/appointments.js';
import categoryRouter from './src/categories/categories.js';
import calendarRouter from './src/calendar/calendar.routes.js';

const app = express();

// --- 1. MIDDLEWARES ---
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// Sincronización automática de tablas en Neon
pool.query(createDatabaseSchema)
    .then(() => console.log("✨ Tablas sincronizadas en la base de datos"))
    .catch(err => console.error("❌ Error DB al sincronizar:", err));

// --- 2. RUTAS DE AUTENTICACIÓN ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = `
            SELECT 
                u.id, u.name, u.email, u.password_hash, 
                m.role_id, 
                r.name as role_name, 
                m.clinic_id,
                c.name as clinic_name
            FROM users u
            LEFT JOIN members m ON u.id = m.user_id 
            LEFT JOIN roles r ON m.role_id = r.id
            LEFT JOIN clinics c ON m.clinic_id = c.id
            WHERE u.email = $1
            ORDER BY m.role_id ASC 
            LIMIT 1; 
        `;
        const { rows } = await pool.query(query, [email]);

        if (rows.length > 0 && rows[0].password_hash === password) {
            const user = rows[0];
            const dummyToken = `session_token_${user.id}_${Date.now()}`;
            return res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    token: dummyToken,
                    activeClinic: user.clinic_id ? {
                        id: user.clinic_id,
                        name: user.clinic_name,
                        role_id: user.role_id,
                        role_name: user.role_name
                    } : null
                }
            });
        }
        res.status(401).json({ message: "Email o contraseña incorrectos" });
    } catch (err) {
        console.error("❌ Error en Login:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const query = `
            INSERT INTO users (name, email, password_hash, created_at)
            VALUES ($1, $2, $3, NOW()) RETURNING id, name, email;
        `;
        const { rows } = await pool.query(query, [name, email, password]);
        res.status(201).json({ success: true, user: rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Error al crear la cuenta" });
    }
});

// --- 3. RUTAS DE MÓDULOS ---
app.use('/api/patients', patientRouter);
app.use('/api/clinics', clinicRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/calendar', calendarRouter);

app.get('/', (req, res) => res.send('🚀 Adaptia API Operativa'));

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error("❌ Error No Manejado:", err.stack);
    res.status(500).json({ message: "Algo salió mal en el servidor" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`
    ====================================
    🚀 Servidor Adaptia Corriendo
    🌐 Puerto: ${PORT}
    🔓 CORS: Habilitado
    ✨ DB: Neon Sincronizada
    ====================================
    `);
});