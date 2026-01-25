import { hasPermission, CAPABILITIES, SCOPES } from './src/auth/permissions.js';

// Simulacro de datos
const psicologoA = {
    id: 1,
    name: 'Luis David',
    role: { capabilities: [CAPABILITIES.VIEW_ALL_APPOINTMENTS] },
    consents: [SCOPES.SHARE_APPOINTMENTS]
};

const psicologoB = {
    id: 2,
    name: 'Esteban',
    role: { capabilities: [] },
    consents: [] // Esteban NO ha compartido nada aún
};

console.log('--- TEST DE PERMISOS ADAPTIA ---');

// Caso 1: Luis David intenta ver citas de Esteban
const intento1 = hasPermission(psicologoA, psicologoB, CAPABILITIES.VIEW_ALL_APPOINTMENTS, SCOPES.SHARE_APPOINTMENTS);
console.log(`¿Luis puede ver citas de Esteban?: ${intento1 ? 'SÍ' : 'NO (Falta consentimiento)'}`);

// Caso 2: Esteban da permiso a la clínica
psicologoB.consents.push(SCOPES.SHARE_APPOINTMENTS);
const intento2 = hasPermission(psicologoA, psicologoB, CAPABILITIES.VIEW_ALL_APPOINTMENTS, SCOPES.SHARE_APPOINTMENTS);
console.log(`¿Luis puede ver citas de Esteban ahora?: ${intento2 ? 'SÍ' : 'NO'}`);