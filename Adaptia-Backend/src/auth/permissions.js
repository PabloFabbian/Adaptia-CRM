import pool from '../config/db.js';

export const CAPABILITIES = {
    READ_APPOINTMENTS: 'clinic.appointments.read',
    WRITE_APPOINTMENTS: 'clinic.appointments.write',
    READ_PATIENTS: 'clinic.patients.read',
    WRITE_PATIENTS: 'clinic.patients.write',
    READ_NOTES: 'clinic.notes.read',
    WRITE_NOTES: 'clinic.notes.write',
    READ_CATEGORIES: 'clinic.categories.read',
    WRITE_CATEGORIES: 'clinic.categories.write',
    READ_SERVICES: 'clinic.services.read',
    WRITE_SERVICES: 'clinic.services.write',
    READ_MEMBERS: 'clinic.members.read',
    READ_ROLES: 'clinic.roles.read',
    WRITE_SETTINGS: 'clinic.settings.write',
    MANAGE_CLINIC: 'manage_clinic',
};

/**
 * Middleware que protege una ruta verificando que el usuario
 * tenga la capacidad requerida según su rol en la clínica.
 *
 * Orden de búsqueda de clinicId:
 *   1. req.params.clinicId  (rutas tipo /:clinicId/...)
 *   2. req.params.id        (rutas tipo /:id)
 *   3. req.query.clinicId   (GET con ?clinicId=)
 *   4. req.body.clinicId    (POST/PUT con body)
 *   5. req.body.clinic_id   (variante snake_case)
 *
 * Si no hay clinicId disponible, verifica si el usuario es
 * Tech Owner globalmente y le permite pasar.
 */
export const requireCapability = (requiredSlug) => {
    return async (req, res, next) => {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({ error: 'Acceso denegado: sin identificación' });
        }

        const clinicId =
            req.params?.clinicId ||
            req.params?.id ||
            req.query?.clinicId ||
            req.body?.clinicId ||
            req.body?.clinic_id ||
            null;

        try {
            // Sin clinicId — verificar si es Tech Owner global
            if (!clinicId) {
                const { rows } = await pool.query(`
                    SELECT r.name FROM members m
                    JOIN roles r ON m.role_id = r.id
                    WHERE m.user_id = $1
                    LIMIT 1
                `, [userId]);

                if (rows[0]?.name === 'Tech Owner') return next();

                return res.status(403).json({
                    error: 'Acceso denegado: falta clinicId'
                });
            }

            // Con clinicId — verificar capability en role_capabilities
            const { rows } = await pool.query(`
                SELECT 1 FROM role_capabilities rc
                JOIN members m ON m.role_id = rc.role_id
                JOIN capabilities c ON rc.capability_id = c.id
                WHERE m.user_id   = $1
                AND   m.clinic_id = $2
                AND   c.slug      = $3
                LIMIT 1
            `, [userId, parseInt(clinicId, 10), requiredSlug]);

            if (rows.length === 0) {
                return res.status(403).json({
                    error: `Acceso denegado: se requiere "${requiredSlug}"`
                });
            }

            next();
        } catch (error) {
            console.error('❌ Error en requireCapability:', error.message);
            res.status(500).json({ error: 'Error al verificar permisos' });
        }
    };
};

/**
 * Genera un filtro SQL dinámico basado en Capacidades de Rol (Nivel 1)
 * y Consentimiento/Soberanía (Nivel 2).
 */
export const getResourceFilter = async (pool, viewerUserId, clinicId, resourceType) => {
    const resourceMap = {
        'appointments': { cap: CAPABILITIES.READ_APPOINTMENTS, consentKey: 'appointments' },
        'patients': { cap: CAPABILITIES.READ_PATIENTS, consentKey: 'patients' },
        'clinical_notes': { cap: CAPABILITIES.READ_NOTES, consentKey: 'notes' }
    };

    const config = resourceMap[resourceType];
    if (!config) return { query: `FALSE`, params: [] };

    try {
        const viewerMemberRes = await pool.query(
            'SELECT id FROM members WHERE user_id = $1 AND clinic_id = $2',
            [viewerUserId, clinicId]
        );
        const viewerMemberId = viewerMemberRes.rows[0]?.id;
        if (!viewerMemberId) return { query: `FALSE`, params: [] };

        const capsRes = await pool.query(`
            SELECT 1 FROM role_capabilities rc
            JOIN members m ON m.role_id = rc.role_id
            JOIN capabilities c ON rc.capability_id = c.id
            WHERE m.id = $1 AND c.slug = $2
        `, [viewerMemberId, config.cap]);

        const hasGlobalCapability = capsRes.rowCount > 0;

        if (hasGlobalCapability) {
            return {
                query: `(
                    a.owner_member_id = $2
                    OR EXISTS (
                        SELECT 1 FROM consents c
                        WHERE c.member_id     = a.owner_member_id
                        AND   c.resource_type = $3
                        AND   c.is_granted    = TRUE
                        AND   c.clinic_id     = $1
                    )
                )`,
                params: [clinicId, viewerMemberId, config.consentKey]
            };
        } else {
            return {
                query: `a.owner_member_id = $2`,
                params: [clinicId, viewerMemberId]
            };
        }
    } catch (error) {
        console.error("❌ Error en getResourceFilter:", error);
        return { query: `FALSE`, params: [] };
    }
};