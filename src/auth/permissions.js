// Adaptia - Permisos Flexibles (Node.js)

export const CAPABILITIES = {
    VIEW_ALL_APPOINTMENTS: 'clinic:appointments:view_all',
    VIEW_ALL_PATIENTS: 'clinic:patients:view_all',
};

export const SCOPES = {
    SHARE_APPOINTMENTS: 'member:share:appointments',
    SHARE_PATIENTS: 'member:share:patients',
};

/**
 * Validador Maestro de Adaptia
 */
export const canAccessResource = (reqMember, resourceOwner, capability, scope) => {
    // 1. Si el psicólogo es dueño del recurso, acceso total
    if (reqMember.id === resourceOwner.id) return true;

    // 2. ¿Tiene el rol la capacidad técnica?
    const hasCapability = reqMember.role.capabilities.includes(capability);

    // 3. ¿El dueño otorgó el permiso a la clínica (scope)?
    const hasScope = resourceOwner.consents.includes(scope);

    return hasCapability && hasScope;
};