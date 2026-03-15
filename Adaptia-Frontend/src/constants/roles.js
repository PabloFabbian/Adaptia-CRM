// Role IDs de referencia — usar solo cuando sea estrictamente necesario.
// Preferir siempre can('capability.slug') sobre verificación por ID.
export const ROLE = {
    TECH_OWNER: 0,  // ID lógico, no el de la DB
};

// Capabilities del sistema — deben coincidir exactamente con los slugs de la DB
export const CAP = {
    // Pacientes
    READ_PATIENTS: 'clinic.patients.read',
    WRITE_PATIENTS: 'clinic.patients.write',
    // Citas
    READ_APPOINTMENTS: 'clinic.appointments.read',
    WRITE_APPOINTMENTS: 'clinic.appointments.write',
    // Notas
    READ_NOTES: 'clinic.notes.read',
    WRITE_NOTES: 'clinic.notes.write',
    // Categorías y Servicios
    READ_CATEGORIES: 'clinic.categories.read',
    WRITE_CATEGORIES: 'clinic.categories.write',
    READ_SERVICES: 'clinic.services.read',
    WRITE_SERVICES: 'clinic.services.write',
    // Administración
    READ_MEMBERS: 'clinic.members.read',
    READ_ROLES: 'clinic.roles.read',
    WRITE_SETTINGS: 'clinic.settings.write',
    MANAGE_CLINIC: 'manage_clinic',
};

// Grupos de acceso para el Sidebar — basados en capabilities, no en role IDs
export const NAV_PERMISSIONS = {
    MASTER: [0, 2],       // Solo Tech Owner y Owner (por role_id, para Gobernanza)
    PROFESSIONAL: [0, 2, 4],    // Tech Owner, Owner, Psicólogo
    PUBLIC: [0, 2, 4, 6], // Todos
};