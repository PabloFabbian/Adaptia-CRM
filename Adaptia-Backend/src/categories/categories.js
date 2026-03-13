import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

/**
 * 1. LISTAR CATEGORÍAS POR CLÍNICA
 */
router.get('/', async (req, res) => {
    try {
        const { clinicId } = req.query;
        if (!clinicId) return res.json({ data: [] });

        const { rows } = await pool.query(`
            SELECT c.*, 
                COUNT(s.id) FILTER (WHERE s.active = true) AS services_count
            FROM categories c
            LEFT JOIN services s ON s.category_id = c.id
            WHERE c.clinic_id = $1
            GROUP BY c.id
            ORDER BY c.name ASC
        `, [parseInt(clinicId, 10)]);

        res.json({ data: rows });
    } catch (error) {
        console.error("❌ Error en GET /categories:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

/**
 * 2. OBTENER UNA CATEGORÍA POR ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT c.*, COUNT(s.id) FILTER (WHERE s.active = true) AS services_count
            FROM categories c
            LEFT JOIN services s ON s.category_id = c.id
            WHERE c.id = $1
            GROUP BY c.id
        `, [parseInt(req.params.id, 10)]);

        if (rows.length === 0) return res.status(404).json({ error: "Categoría no encontrada" });
        res.json({ data: rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener categoría" });
    }
});

/**
 * 3. CREAR CATEGORÍA
 */
router.post('/', async (req, res) => {
    try {
        const { clinic_id, name, description, color } = req.body;

        if (!clinic_id || !name) {
            return res.status(400).json({ error: "clinic_id y name son requeridos" });
        }

        const slug = name.toLowerCase().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const { rows } = await pool.query(`
            INSERT INTO categories (clinic_id, name, description, slug, color)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [clinic_id, name, description || null, slug, color || '#50e3c2']);

        res.status(201).json({ data: rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: "Ya existe una categoría con ese nombre en esta clínica" });
        }
        res.status(500).json({ error: "Error al crear categoría" });
    }
});

/**
 * 4. ACTUALIZAR CATEGORÍA (nombre, descripción, color, active)
 */
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, description, color, active } = req.body;

        const current = await pool.query(`SELECT * FROM categories WHERE id = $1`, [id]);
        if (current.rows.length === 0) return res.status(404).json({ error: "Categoría no encontrada" });

        const updated = {
            name: name ?? current.rows[0].name,
            description: description ?? current.rows[0].description,
            color: color ?? current.rows[0].color,
            active: active ?? current.rows[0].active,
        };

        // Regenerar slug solo si cambia el nombre
        const slug = updated.name !== current.rows[0].name
            ? updated.name.toLowerCase().trim()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            : current.rows[0].slug;

        const { rows } = await pool.query(`
            UPDATE categories
            SET name = $1, description = $2, color = $3, active = $4, slug = $5
            WHERE id = $6
            RETURNING *
        `, [updated.name, updated.description, updated.color, updated.active, slug, id]);

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar categoría" });
    }
});

/**
 * 5. ELIMINAR CATEGORÍA (solo si no tiene servicios vinculados)
 */
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        const linked = await pool.query(
            `SELECT COUNT(*) FROM services WHERE category_id = $1`, [id]
        );

        if (parseInt(linked.rows[0].count, 10) > 0) {
            return res.status(409).json({
                error: "No se puede eliminar: la categoría tiene servicios vinculados. Eliminá los servicios primero."
            });
        }

        await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar categoría" });
    }
});

/**
 * 6. LISTAR SERVICIOS DE UNA CATEGORÍA
 */
router.get('/:id/services', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT * FROM services
            WHERE category_id = $1
            ORDER BY name ASC
        `, [parseInt(req.params.id, 10)]);

        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener servicios" });
    }
});

export default router;