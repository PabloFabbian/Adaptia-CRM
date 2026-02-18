import { Router } from 'express';
import {
    getClinicDirectory,
    getAllCapabilities,
    getGovernance,
    getCapabilitiesByRole,
    toggleRolePermission,
    createInvitation,
    toggleMemberConsent,
    getMySovereigntyStatus
} from './clinics.controller.js';
import { getRoles } from './roles.js';

// Importación corregida a tu carpeta src/auth/
import { authenticateToken } from '../auth/auth.middleware.js';

const router = Router();

/** 1. RUTAS GLOBALES Y CATÁLOGOS */
router.get('/roles', getRoles);
router.get('/capabilities', getAllCapabilities);

/** 2. RUTAS DE IDENTIDAD Y SOBERANÍA (Nivel de Usuario) */
// Esta ruta es vital para que el AuthContext obtenga el member_id al iniciar
router.get('/me/sovereignty', authenticateToken, getMySovereigntyStatus);

/** 3. RUTAS BASADAS EN CLÍNICA (/:clinicId) */
// Capacidades por Rol
router.get('/:clinicId/roles/:roleId/capabilities', getCapabilitiesByRole);

// Directorio y Gobernanza
router.get('/:id/directory', getClinicDirectory);
router.get('/:clinicId/governance', getGovernance);

// Invitaciones y Permisos de Rol
router.post('/:clinicId/invitations', createInvitation);
router.post('/:clinicId/permissions/toggle', toggleRolePermission);

/** 4. ACCIONES DE MIEMBRO (Soberanía) */
// Actualiza el consentimiento individual
router.patch('/:clinicId/members/:memberId/consent', authenticateToken, toggleMemberConsent);

export default router;