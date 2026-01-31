/**
 * Filtra un array de recursos en memoria.
 * Útil para filtrar resultados que ya trajiste de la DB o en el frontend.
 */
export const filterResourcesInMemory = (viewerMemberId, resources, consents, hasGlobalPower) => {
    return resources.filter(res => {
        // 1. Es mío
        if (res.owner_member_id === viewerMemberId) return true;

        // 2. Si tengo poder global, reviso si el dueño dio permiso
        if (hasGlobalPower) {
            const ownerConsent = consents.find(c =>
                c.member_id === res.owner_member_id && c.is_granted === true
            );
            return !!ownerConsent;
        }

        return false;
    });
};