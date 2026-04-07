const express = require('express');
const router = express.Router();
const { verifyToken } = require('../auth/auth.middleware');
// Aquí importarías tu controlador

// Obtener plantillas (Consentimiento informado, Anamnesis, etc.)
router.get('/templates', verifyToken, (req, res) => {
    // mock de plantillas por ahora
    res.json([{ id: 1, name: 'Consentimiento Informado V1', required: true }]);
});

// Guardar firma de un paciente
router.post('/sign', verifyToken, (req, res) => {
    const { patientId, templateId, signatureData } = req.body;
    // Lógica para guardar en DB vinculando patient_id
    res.status(201).json({ message: 'Documento firmado correctamente' });
});

module.exports = router;