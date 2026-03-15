export const CAP_LABELS = {
    'clinic.appointments.read': { label: 'Ver Agenda', sidebar: true },
    'clinic.appointments.write': { label: 'Gestionar Agenda', sidebar: false },
    'clinic.patients.read': { label: 'Ver Pacientes', sidebar: true },
    'clinic.patients.write': { label: 'Alta Pacientes', sidebar: true },
    'clinic.notes.read': { label: 'Ver Notas', sidebar: true },
    'clinic.notes.write': { label: 'Crear Notas', sidebar: false },
    'clinic.records.read': { label: 'Ver Expedientes', sidebar: false },
    'clinic.records.write': { label: 'Editar Expedientes', sidebar: false },
    'clinic.records.read.all': { label: 'Expedientes Globales', sidebar: false },
    'clinic.categories.read': { label: 'Ver Categorías', sidebar: true },
    'clinic.categories.write': { label: 'Gestionar Categorías', sidebar: false },
    'clinic.services.read': { label: 'Ver Servicios', sidebar: false },
    'clinic.services.write': { label: 'Gestionar Servicios', sidebar: false },
    'clinic.members.read': { label: 'Ver Equipo', sidebar: false },
    'clinic.roles.read': { label: 'Ver Roles', sidebar: false },
    'clinic.settings.write': { label: 'Configuración', sidebar: false },
    'manage_clinic': { label: 'Administrar Clínica', sidebar: true },
};

export const SIDEBAR_ITEMS = [
    { label: 'Inicio', cap: null, always: true },
    { label: 'Pacientes', cap: 'clinic.patients.read' },
    { label: 'Agenda y Turnos', cap: 'clinic.appointments.read' },
    { label: 'Notas Clínicas', cap: 'clinic.notes.read' },
    { label: 'Categorías', cap: 'clinic.categories.read' },
    { label: 'Nueva Cita', cap: 'clinic.appointments.write' },
    { label: 'Alta Paciente', cap: 'clinic.patients.write' },
    { label: 'Gobernanza', cap: 'manage_clinic' },
    { label: 'Honorarios', cap: 'manage_clinic' },
    { label: 'Compartir Recursos', cap: null, always: true },
    { label: 'Supervisión', cap: null, always: true },
    { label: 'Configuración', cap: null, always: true },
];

export const ROLE_STYLES = {
    'Tech Owner': {
        avatar: 'bg-[#50e3c2]/20 text-[#50e3c2] border-[#50e3c2]/30',
        badge: 'bg-[#50e3c2]/10 text-[#50e3c2] border-[#50e3c2]/25',
        bar: 'bg-[#50e3c2]',
    },
    'Owner': {
        avatar: 'bg-violet-500/20 text-violet-400 border-violet-400/30',
        badge: 'bg-violet-500/10 text-violet-400 border-violet-400/25',
        bar: 'bg-violet-500',
    },
    'Psicólogo': {
        avatar: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
        badge: 'bg-blue-500/10 text-blue-400 border-blue-400/25',
        bar: 'bg-blue-500',
    },
    'Secretaría': {
        avatar: 'bg-amber-500/20 text-amber-400 border-amber-400/30',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-400/25',
        bar: 'bg-amber-500',
    },
};

export const DEFAULT_ROLE_STYLE = {
    avatar: 'bg-slate-500/20 text-slate-400 border-slate-400/30',
    badge: 'bg-slate-500/10 text-slate-400 border-slate-400/25',
    bar: 'bg-slate-400',
};