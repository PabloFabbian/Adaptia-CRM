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
import { authenticateToken } from '../auth/auth.middleware.js';
import { requireCapability, CAPABILITIES } from '../auth/permissions.js';

const router = Router();

/**
 * 1. RUTAS GLOBALES Y CATÁLOGOS
 * Sin protección — son catálogos públicos que necesita el AuthContext al iniciar
 */
router.get('/roles', getRoles);
router.get('/capabilities', getAllCapabilities);

/**
 * 2. IDENTIDAD Y SOBERANÍA
 * Solo requiere token válido — no capability específica
 */
router.get('/me/sovereignty', authenticateToken, getMySovereigntyStatus);

/**
 * 3. RUTAS DE CLÍNICA
 */

// Capacidades por Rol — necesita token, sin capability extra (lo usa el AuthContext)
router.get('/:clinicId/roles/:roleId/capabilities',
    authenticateToken,
    getCapabilitiesByRole
);

// Directorio de miembros — solo Owner/Tech Owner
router.get('/:id/directory',
    authenticateToken,
    requireCapability(CAPABILITIES.READ_MEMBERS),
    getClinicDirectory
);

// Matriz de gobernanza — solo Owner/Tech Owner
router.get('/:clinicId/governance',
    authenticateToken,
    requireCapability(CAPABILITIES.READ_ROLES),
    getGovernance
);

// Invitaciones — solo quien puede gestionar la clínica
router.post('/:clinicId/invitations',
    authenticateToken,
    requireCapability(CAPABILITIES.MANAGE_CLINIC),
    createInvitation
);

// Toggle de permisos de rol — solo Owner/Tech Owner
router.post('/:clinicId/permissions/toggle',
    authenticateToken,
    requireCapability(CAPABILITIES.MANAGE_CLINIC),
    toggleRolePermission
);

/**
 * 4. SOBERANÍA INDIVIDUAL
 * Cualquier miembro puede actualizar su propio consentimiento
 */
router.patch('/:clinicId/members/:memberId/consent',
    authenticateToken,
    toggleMemberConsent
);

export default router;