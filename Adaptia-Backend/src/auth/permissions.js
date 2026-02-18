export const CAPABILITIES = {
    READ_APPOINTMENTS: 'clinic.appointments.read',
    READ_PATIENTS: 'clinic.patients.read',
    READ_NOTES: 'clinic.notes.read'
};

/**
 * Genera un filtro SQL dinámico basado en Capacidades de Rol (Nivel 1)
 * y Consentimiento/Soberanía (Nivel 2).
 */
export const getResourceFilter = async (pool, viewerUserId, clinicId, resourceType) => {
    // Mapeo exacto entre frontend y backend
    const resourceMap = {
        'appointments': { cap: CAPABILITIES.READ_APPOINTMENTS, consentKey: 'appointments' },
        'patients': { cap: CAPABILITIES.READ_PATIENTS, consentKey: 'patients' },
        'clinical_notes': { cap: CAPABILITIES.READ_NOTES, consentKey: 'notes' }
    };

    const config = resourceMap[resourceType];
    // Seguridad: si el recurso no existe, bloqueamos todo.
    if (!config) return { query: `FALSE`, params: [] };

    try {
        // 1. Obtener el ID de Miembro del que está mirando (viewer)
        const viewerMemberRes = await pool.query(
            'SELECT id FROM members WHERE user_id = $1 AND clinic_id = $2',
            [viewerUserId, clinicId]
        );
        const viewerMemberId = viewerMemberRes.rows[0]?.id;

        // Si no es miembro de la clínica, no ve nada.
        if (!viewerMemberId) return { query: `FALSE`, params: [] };

        // 2. Verificar capacidad técnica del ROL (Nivel 1)
        const capsRes = await pool.query(`
            SELECT 1 FROM role_capabilities rc
            JOIN members m ON m.role_id = rc.role_id
            JOIN capabilities c ON rc.capability_id = c.id
            WHERE m.id = $1 AND c.slug = $2`,
            [viewerMemberId, config.cap]
        );

        const hasGlobalCapability = capsRes.rowCount > 0;

        /**
         * 3. FILTRO DE SOBERANÍA:
         * El viewer verá el registro 'a' (appointment) si:
         * - Es el dueño (owner_member_id = viewerMemberId)
         * - TIENE permiso de rol Y el dueño ha dado consentimiento (is_granted = TRUE)
         */
        if (hasGlobalCapability) {
            return {
                query: `(
                    a.owner_member_id = $2 
                    OR EXISTS (
                        SELECT 1 FROM consents c 
                        WHERE c.member_id = a.owner_member_id 
                        AND c.resource_type = $3 
                        AND c.is_granted = TRUE 
                        AND c.clinic_id = $1
                    )
                )`,
                params: [clinicId, viewerMemberId, config.consentKey]
            };
        } else {
            // Caso restrictivo: No tiene permiso de rol, solo ve lo propio.
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