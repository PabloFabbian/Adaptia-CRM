export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log("⚠️ Intento de acceso sin token");
        return res.status(401).json({ error: 'No se proporcionó token de acceso' });
    }

    // LÓGICA TEMPORAL: Extraer el ID del token dummy 'session_token_ID_TIMESTAMP'
    if (token.startsWith('session_token_')) {
        const parts = token.split('_');
        req.user = { id: parseInt(parts[2]) }; // Inyectamos el ID para el controlador
        return next();
    }

    // Si ya implementaste JWT real, descomenta esto:
    /*
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
        req.user = user;
        next();
    });
    */

    res.status(401).json({ error: 'Formato de token no reconocido' });
};