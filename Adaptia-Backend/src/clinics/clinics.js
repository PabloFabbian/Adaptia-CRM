import express from 'express';
const router = express.Router();

router.patch('/consent', async (req, res) => {
    const { memberId, resourceType, isGranted } = req.body;

    try {
        const query = `
            INSERT INTO consents (member_id, resource_type, is_granted)
            VALUES ($1, $2, $3)
            ON CONFLICT (member_id, resource_type) 
            DO UPDATE SET is_granted = EXCLUDED.is_granted, updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;

        const { rows } = await req.pool.query(query, [memberId, resourceType, isGranted]);

        res.json({
            message: `Permiso para ${resourceType} actualizado`,
            consent: rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el consentimiento" });
    }
});

export default router;