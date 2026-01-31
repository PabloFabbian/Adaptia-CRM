import express from 'express';

export const getRoles = async (req, res) => {
    try {
        const query = 'SELECT id, name, description FROM roles ORDER BY id ASC';
        const { rows } = await req.pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error("❌ Error al obtener roles:", err.message);
        res.status(500).json({ error: "No se pudieron cargar los niveles de gobernanza" });
    }
};