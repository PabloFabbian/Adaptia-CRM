import express from 'express';
import pool from '../config/db.js';
import { getResourceFilter, requireCapability, CAPABILITIES } from '../auth/permissions.js';
import { authenticateToken } from '../auth/auth.middleware.js';

const router = express.Router();

/**
 * 1. LISTAR CITAS
 */
router.get('/',
    authenticateToken,
    requireCapability(CAPABILITIES.READ_APPOINTMENTS),
    async (req, res) => {
        try {
            const { userId, clinicId } = req.query;
            if (!userId || !clinicId) return res.json({ data: [] });

            const uId = parseInt(userId, 10);
            const cId = parseInt(clinicId, 10);

            const filter = await getResourceFilter(pool, uId, cId, 'appointments');

            let filterQuery = filter.query;
            const offset = 1;
            filterQuery = filterQuery.replace(/\$(\d+)/g, (_, num) => `$${parseInt(num) + offset}`);

            const query = `
                SELECT a.*, p.name as patient_name
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                WHERE a.clinic_id = $1
                AND ${filterQuery}
                ORDER BY a.date ASC
            `;

            const { rows } = await pool.query(query, [cId, ...filter.params]);
            res.json({ data: rows });
        } catch (error) {
            console.error("❌ Error en Appointments:", error.message);
            res.status(500).json({ data: [], error: "Error al consultar citas" });
        }
    }
);

export default router;