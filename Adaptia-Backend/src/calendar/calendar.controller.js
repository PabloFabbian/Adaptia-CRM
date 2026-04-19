// src/calendar/calendar.controller.js
// Sin Prisma - SQL directo con node-postgres (pg)

import { google } from 'googleapis';
import crypto from 'crypto';
import pool from '../config/db.js';  // Tu pool de conexión Neon

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Funciones de encriptación
const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
    const [iv, encrypted] = text.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};

// Cliente OAuth
const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

/**
 * GET /api/calendar/status
 * Verificar si el usuario tiene Google Calendar vinculado
 */
export const getCalendarStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Query a BD
        const result = await pool.query(
            'SELECT user_id, access_token, token_expiry, email FROM calendar_connections WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({ connected: false, email: null });
        }

        const connection = result.rows[0];

        // Validar que el token no esté expirado
        if (connection.token_expiry && new Date() > new Date(connection.token_expiry)) {
            // Token expirado, intentar refrescar
            try {
                await refreshAccessToken(connection);
            } catch (err) {
                console.error('Error refrescando token:', err);
            }
        }

        return res.json({
            connected: true,
            email: connection.email,
        });
    } catch (error) {
        console.error('Error en getCalendarStatus:', error);
        res.status(500).json({ error: 'Error al verificar estado' });
    }
};

/**
 * GET /api/calendar/oauth/start
 * Iniciar el flujo de OAuth con Google
 */
export const startOAuth = async (req, res) => {
    try {
        const userId = req.user.id;

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/calendar.readonly',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            state: userId.toString(),
            prompt: 'consent'
        });

        res.json({ url: authUrl });
    } catch (error) {
        console.error('Error en startOAuth:', error);
        res.status(500).json({ error: 'Error al iniciar OAuth' });
    }
};

/**
 * GET /api/calendar/oauth/callback
 * Recibir el código de autorización y guardar los tokens
 */
export const handleOAuthCallback = async (req, res) => {
    const client = await pool.connect();
    try {
        const { code, state } = req.query;
        const userId = parseInt(state);

        if (!code) {
            return res.redirect('/calendar?error=true');
        }

        // Intercambiar código por tokens
        const { tokens } = await oauth2Client.getToken(code);

        // Obtener info del usuario de Google
        const userInfoClient = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET
        );
        userInfoClient.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: 'v2', auth: userInfoClient });
        const userInfo = await oauth2.userinfo.get();
        const googleEmail = userInfo.data.email;

        // Usar transacción para garantizar integridad
        await client.query('BEGIN');

        // Verificar si ya existe conexión
        const existingResult = await client.query(
            'SELECT id FROM calendar_connections WHERE user_id = $1',
            [userId]
        );

        if (existingResult.rows.length > 0) {
            // Actualizar existente
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
                    userId
                ]
            );
        } else {
            // Crear nuevo
            await client.query(
                `INSERT INTO calendar_connections 
         (user_id, refresh_token, access_token, token_expiry, email, calendar_id) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    userId,
                    encrypt(tokens.refresh_token),
                    encrypt(tokens.access_token),
                    tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                    googleEmail,
                    'primary'
                ]
            );
        }

        await client.query('COMMIT');
        res.redirect('/calendar?connected=true');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en handleOAuthCallback:', error);
        res.redirect('/calendar?error=true');
    } finally {
        client.release();
    }
};

/**
 * GET /api/calendar/events
 * Obtener eventos de Google Calendar para una semana
 */
export const getCalendarEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.query;

        // Query a BD
        const result = await pool.query(
            'SELECT refresh_token, access_token, token_expiry, calendar_id FROM calendar_connections WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({ connected: false, data: [] });
        }

        let connection = result.rows[0];

        // Refrescar token si está expirado
        if (connection.token_expiry && new Date() > new Date(connection.token_expiry)) {
            await refreshAccessToken(connection);
            // Recargar conexión actualizada
            const updatedResult = await pool.query(
                'SELECT refresh_token, access_token, token_expiry, calendar_id FROM calendar_connections WHERE user_id = $1',
                [userId]
            );
            connection = updatedResult.rows[0];
        }

        // Configurar cliente con tokens
        oauth2Client.setCredentials({
            refresh_token: decrypt(connection.refresh_token),
            access_token: decrypt(connection.access_token)
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Calcular rango de semana
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const events = await calendar.events.list({
            calendarId: connection.calendar_id || 'primary',
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 100
        });

        const formattedEvents = (events.data.items || []).map(event => ({
            id: event.id,
            title: event.summary || 'Sin título',
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            isAllDay: !event.start?.dateTime,
            location: event.location || null,
            htmlLink: event.htmlLink,
            description: event.description || null
        }));

        res.json({
            connected: true,
            data: formattedEvents
        });
    } catch (error) {
        console.error('Error en getCalendarEvents:', error);
        res.status(500).json({
            connected: false,
            data: [],
            error: 'Error al obtener eventos'
        });
    }
};

/**
 * POST /api/calendar/disconnect
 * Desvincula Google Calendar de la cuenta
 */
export const disconnectCalendar = async (req, res) => {
    try {
        const userId = req.user.id;

        await pool.query(
            'DELETE FROM calendar_connections WHERE user_id = $1',
            [userId]
        );

        res.json({ success: true, message: 'Desvinculado correctamente' });
    } catch (error) {
        console.error('Error en disconnectCalendar:', error);
        res.status(500).json({ error: 'Error al desvincular' });
    }
};

/**
 * Función auxiliar: refrescar access token usando refresh token
 */
const refreshAccessToken = async (connection) => {
    try {
        oauth2Client.setCredentials({
            refresh_token: decrypt(connection.refresh_token)
        });

        const { credentials } = await oauth2Client.refreshAccessToken();

        // Actualizar en BD
        await pool.query(
            `UPDATE calendar_connections 
       SET access_token = $1, token_expiry = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = (SELECT user_id FROM calendar_connections WHERE access_token = $3)`,
            [
                encrypt(credentials.access_token),
                credentials.expiry_date ? new Date(credentials.expiry_date) : null,
                connection.access_token
            ]
        );
    } catch (error) {
        console.error('Error refrescando token:', error);
        throw error;
    }
};