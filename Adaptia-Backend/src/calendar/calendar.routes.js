import { Router } from 'express';
import { google } from 'googleapis';
import pool from '../config/db.js';
import { authenticateToken } from '../auth/auth.middleware.js';

const router = Router();

const getOAuthClient = () => new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

/**
 * 1. Iniciar flujo OAuth — redirige al profesional a Google
 */
router.get('/oauth/start', authenticateToken, (req, res) => {
    const oauth2Client = getOAuthClient();
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/calendar.readonly'],
        state: String(req.user.id)
    });
    res.json({ url });
});

/**
 * 2. Callback de Google — guarda el refresh_token
 */
router.get('/oauth/callback', async (req, res) => {
    const { code, state: userId } = req.query;

    try {
        const oauth2Client = getOAuthClient();
        const { tokens } = await oauth2Client.getToken(code);

        await pool.query(`
            UPDATE members
            SET google_refresh_token = $1
            WHERE user_id = $2
        `, [tokens.refresh_token, parseInt(userId, 10)]);

        // Redirigir al frontend con éxito
        res.redirect(`${process.env.FRONTEND_URL}/calendario?connected=true`);
    } catch (error) {
        console.error('❌ Error en OAuth callback:', error.message);
        res.redirect(`${process.env.FRONTEND_URL}/calendario?error=true`);
    }
});

/**
 * 3. Obtener eventos del calendario del profesional
 */
router.get('/events', authenticateToken, async (req, res) => {
    try {
        const { date } = req.query;
        const userId = req.user.id;

        const memberRes = await pool.query(
            `SELECT google_refresh_token FROM members WHERE user_id = $1 LIMIT 1`,
            [userId]
        );

        const refreshToken = memberRes.rows[0]?.google_refresh_token;

        if (!refreshToken) {
            return res.json({ connected: false, data: [] });
        }

        const oauth2Client = getOAuthClient();
        oauth2Client.setCredentials({ refresh_token: refreshToken });

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
        const { rows } = await pool.query(
            `SELECT google_refresh_token FROM members WHERE user_id = $1 LIMIT 1`,
            [req.user.id]
        );
        res.json({ connected: !!rows[0]?.google_refresh_token });
    } catch (error) {
        res.status(500).json({ error: 'Error al verificar estado' });
    }
});

export default router;