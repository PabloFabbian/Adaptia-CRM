import { Router } from 'express';
import { google } from 'googleapis';
import pool from '../config/db.js';
import { authenticateToken } from '../auth/auth.middleware.js';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const router = Router();

// crypto viene con Node.js, no necesita npm install

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

const getOAuthClient = () => new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Funciones de encriptación (nativas de Node)
const encrypt = (text) => {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
    const [iv, encrypted] = text.split(':');
    const decipher = createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};

/**
 * 1. Iniciar flujo OAuth — redirige al profesional a Google
 */
router.get('/oauth/start', authenticateToken, (req, res) => {
    const oauth2Client = getOAuthClient();
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        state: String(req.user.id)
    });
    res.json({ url });
});

/**
 * 2. Callback de Google — guarda el refresh_token + nueva tabla calendar_connections
 */
router.get('/oauth/callback', async (req, res) => {
    const { code, state: userId } = req.query;
    const client = await pool.connect();
    try {
        const oauth2Client = getOAuthClient();
        const { tokens } = await oauth2Client.getToken(code);

        // Obtener email de Google
        const userInfoClient = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        userInfoClient.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: userInfoClient });
        const userInfo = await oauth2.userinfo.get();
        const googleEmail = userInfo.data.email;

        const userIdInt = parseInt(userId, 10);

        await client.query('BEGIN');

        // Guardar en members (tu tabla existente - mantiene compatibilidad)
        await pool.query(`
            UPDATE members
            SET google_refresh_token = $1
            WHERE user_id = $2
        `, [tokens.refresh_token, userIdInt]);

        // Guardar en calendar_connections (nueva tabla - persistencia mejorada)
        const existingRes = await client.query(
            'SELECT id FROM calendar_connections WHERE user_id = $1',
            [userIdInt]
        );

        if (existingRes.rows.length > 0) {
            // Actualizar
            await client.query(
                `UPDATE calendar_connections 
                 SET refresh_token = $1, access_token = $2, token_expiry = $3, 
                     email = $4, calendar_id = $5, updated_at = CURRENT_TIMESTAMP 
                 WHERE user_id = $6`,
                [
                    encrypt(tokens.refresh_token),
                    encrypt(tokens.access_token),
                    tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                    googleEmail,
                    'primary',
                    userIdInt
                ]
            );
        } else {
            // Crear nuevo
            await client.query(
                `INSERT INTO calendar_connections 
                 (user_id, refresh_token, access_token, token_expiry, email, calendar_id) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    userIdInt,
                    encrypt(tokens.refresh_token),
                    encrypt(tokens.access_token),
                    tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                    googleEmail,
                    'primary'
                ]
            );
        }

        await client.query('COMMIT');

        // Redirigir al frontend con éxito
        res.redirect(`${process.env.FRONTEND_URL}/calendario?connected=true`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error en OAuth callback:', error.message);
        res.redirect(`${process.env.FRONTEND_URL}/calendario?error=true`);
    } finally {
        client.release();
    }
});

/**
 * 3. Obtener eventos del calendario del profesional
 */
router.get('/events', authenticateToken, async (req, res) => {
    try {
        const { date } = req.query;
        const userId = req.user.id;

        // Intenta primero la nueva tabla calendar_connections (con refresh automático)
        const calConnRes = await pool.query(
            `SELECT refresh_token, access_token, token_expiry, calendar_id FROM calendar_connections WHERE user_id = $1 LIMIT 1`,
            [userId]
        );

        let refreshToken;
        let accessToken;

        if (calConnRes.rows.length > 0) {
            const conn = calConnRes.rows[0];

            // Verificar si token expiró
            if (conn.token_expiry && new Date() > new Date(conn.token_expiry)) {
                // Refrescar token
                const oauth2Client = getOAuthClient();
                oauth2Client.setCredentials({ refresh_token: decrypt(conn.refresh_token) });
                const { credentials } = await oauth2Client.refreshAccessToken();

                // Actualizar en BD
                await pool.query(
                    `UPDATE calendar_connections 
                     SET access_token = $1, token_expiry = $2, updated_at = CURRENT_TIMESTAMP 
                     WHERE user_id = $3`,
                    [
                        encrypt(credentials.access_token),
                        credentials.expiry_date ? new Date(credentials.expiry_date) : null,
                        userId
                    ]
                );

                accessToken = credentials.access_token;
            } else {
                accessToken = decrypt(conn.access_token);
            }

            refreshToken = decrypt(conn.refresh_token);
        } else {
            // Fallback: usa tabla members existente (compatibilidad hacia atrás)
            const memberRes = await pool.query(
                `SELECT google_refresh_token FROM members WHERE user_id = $1 LIMIT 1`,
                [userId]
            );
            refreshToken = memberRes.rows[0]?.google_refresh_token;
        }

        if (!refreshToken) {
            return res.json({ connected: false, data: [] });
        }

        const oauth2Client = getOAuthClient();
        if (accessToken) {
            oauth2Client.setCredentials({
                refresh_token: refreshToken,
                access_token: accessToken
            });
        } else {
            oauth2Client.setCredentials({ refresh_token: refreshToken });
        }

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Rango del día o semana según parámetro
        const start = date ? new Date(date) : new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: start.toISOString(),
            timeMax: end.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 50
        });

        const events = (response.data.items || []).map(event => ({
            id: event.id,
            title: event.summary || 'Sin título',
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            description: event.description || '',
            location: event.location || '',
            isAllDay: !event.start?.dateTime,
            htmlLink: event.htmlLink,
        }));

        res.json({ connected: true, data: events });
    } catch (error) {
        console.error('❌ Error obteniendo eventos:', error.message);
        res.status(500).json({ error: 'Error al obtener eventos del calendario' });
    }
});

/**
 * 4. Verificar si el profesional tiene Google Calendar conectado
 */
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Intenta primero calendar_connections (nueva tabla)
        const calConnRes = await pool.query(
            `SELECT user_id FROM calendar_connections WHERE user_id = $1 LIMIT 1`,
            [userId]
        );

        if (calConnRes.rows.length > 0) {
            // Obtener email si existe
            const emailRes = await pool.query(
                `SELECT email FROM calendar_connections WHERE user_id = $1 LIMIT 1`,
                [userId]
            );
            return res.json({
                connected: true,
                email: emailRes.rows[0]?.email || null
            });
        }

        // Fallback: usa members (compatibilidad hacia atrás)
        const { rows } = await pool.query(
            `SELECT google_refresh_token FROM members WHERE user_id = $1 LIMIT 1`,
            [userId]
        );

        res.json({
            connected: !!rows[0]?.google_refresh_token,
            email: null
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al verificar estado' });
    }
});

/**
 * 5. Desconectar Google Calendar (NUEVO)
 */
router.post('/disconnect', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Limpiar ambas tablas (members y calendar_connections)
        await pool.query(
            `UPDATE members SET google_refresh_token = NULL WHERE user_id = $1`,
            [userId]
        );

        await pool.query(
            `DELETE FROM calendar_connections WHERE user_id = $1`,
            [userId]
        );

        res.json({ success: true, message: 'Desvinculado correctamente' });
    } catch (error) {
        console.error('❌ Error desvinculando:', error.message);
        res.status(500).json({ error: 'Error al desvincular' });
    }
});

export default router;