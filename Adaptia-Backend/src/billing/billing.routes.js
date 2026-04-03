import { Router } from 'express';
import { authenticateToken } from '../auth/auth.middleware.js';
import { requireCapability, CAPABILITIES } from '../auth/permissions.js';
import {
    getKPIs,
    getTransactions,
    createTransaction,
    markTransactionPaid,
    getOrCreateSettlement,
    approveSettlement,
    getSettlements,
    getCommissionRules,
    updateCommissionRule,
    previewSplit,
} from './billing.controller.js';

const router = Router();

/**
 * KPIs y resumen
 */
router.get('/kpis',
    authenticateToken,
    (req, res, next) => {
        if (req.query.clinicId) req.params.clinicId = req.query.clinicId;
        next();
    },
    requireCapability(CAPABILITIES.MANAGE_CLINIC),
    getKPIs
);

/**
 * Transacciones
 */
router.get('/transactions',
    authenticateToken,
    (req, res, next) => {
        if (req.query.clinicId) req.params.clinicId = req.query.clinicId;
        next();
    },
    requireCapability(CAPABILITIES.READ_RECORDS),
    getTransactions
);

router.post('/transactions',
    authenticateToken,
    (req, res, next) => {
        if (req.body.clinicId) req.params.clinicId = req.body.clinicId;
        next();
    },
    requireCapability(CAPABILITIES.WRITE_RECORDS),
    createTransaction
);

router.patch('/transactions/:id/pay',
    authenticateToken,
    requireCapability(CAPABILITIES.WRITE_RECORDS),
    markTransactionPaid
);

/**
 * Preview del split (sin guardar)
 */
router.get('/preview',
    authenticateToken,
    previewSplit
);

/**
 * Liquidaciones
 */
router.get('/settlements',
    authenticateToken,
    (req, res, next) => {
        if (req.query.clinicId) req.params.clinicId = req.query.clinicId;
        next();
    },
    requireCapability(CAPABILITIES.READ_RECORDS),
    getSettlements
);

router.post('/settlements/generate',
    authenticateToken,
    (req, res, next) => {
        if (req.query.clinicId) req.params.clinicId = req.query.clinicId;
        next();
    },
    requireCapability(CAPABILITIES.MANAGE_CLINIC),
    getOrCreateSettlement
);

router.patch('/settlements/:id/approve',
    authenticateToken,
    approveSettlement
);

/**
 * Reglas de split — solo Owner
 */
router.get('/rules',
    authenticateToken,
    (req, res, next) => {
        if (req.query.clinicId) req.params.clinicId = req.query.clinicId;
        next();
    },
    requireCapability(CAPABILITIES.MANAGE_CLINIC),
    getCommissionRules
);

router.patch('/rules/:id',
    authenticateToken,
    requireCapability(CAPABILITIES.MANAGE_CLINIC),
    updateCommissionRule
);

export default router;