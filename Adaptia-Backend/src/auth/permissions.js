export const CAPABILITIES = {
    VIEW_ALL_APPOINTMENTS: 'view_all_appointments',
    VIEW_ALL_PATIENTS: 'view_all_patients',
    VIEW_ALL_NOTES: 'view_all_clinical_notes',
    MANAGE_CLINIC: 'manage_clinic'
};

/**
 * Genera el filtro SQL dinámico.
 * Esta es la "Llave" de Adaptia: Filtra lo propio + lo consentido por otros.
 */
export const getResourceFilter = async (pool, viewerMemberId, clinicId, resourceType) => {
    try {
        // 1. Obtener capacidades del miembro en esta clínica
        const capsRes = await pool.query(`
            SELECT c.slug 
            FROM members m
            JOIN role_capabilities rc ON m.role_id = rc.role_id
            JOIN capabilities c ON rc.capability_id = c.id
            WHERE m.id = $1 AND m.clinic_id = $2`,
            [viewerMemberId, clinicId]
        );

        const capabilities = capsRes.rows.map(r => r.slug);
        const canViewAll = capabilities.includes(`view_all_${resourceType}`);

        if (canViewAll) {
            // Retorna: (Soy el dueño) O (El dueño ha dado permiso a la clínica para este recurso)
            return {
                query: `(owner_member_id = $1 OR owner_member_id IN (
                    SELECT member_id FROM consents 
                    WHERE resource_type = $2 AND is_granted = TRUE AND clinic_id = $3
                ))`,
                params: [viewerMemberId, resourceType, clinicId]
            };
        }

        // Si no tiene capacidad de ver todo, solo ve lo suyo
        return {
            query: `owner_member_id = $1`,
            params: [viewerMemberId]
        };

    } catch (error) {
        console.error("❌ Error en permissions.js:", error);
        return { query: `owner_member_id = $1`, params: [viewerMemberId] };
    }
};

export const hasPermission = async (pool, memberId, capabilitySlug) => {
    const res = await pool.query(`
        SELECT count(*) 
        FROM members m
        JOIN role_capabilities rc ON m.role_id = rc.role_id
        JOIN capabilities c ON rc.capability_id = c.id
        WHERE m.id = $1 AND c.slug = $2`,
        [memberId, capabilitySlug]
    );
    return parseInt(res.rows[0].count) > 0;
};