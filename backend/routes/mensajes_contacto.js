const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Solo admins pueden ver todos los mensajes
router.get('/mensajes_contacto', async (req, res) => {
    // Verificar privilegio admin (puedes mejorar la autenticación si tienes JWT, aquí solo por query)
    if (!req.query.admin || req.query.admin !== '1') {
        return res.status(403).json({ error: 'Acceso restringido' });
    }
    try {
        const snapshot = await admin.firestore().collection('mensajes_contacto').get();
        const mensajes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(mensajes);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer mensajes', details: error.message });
    }
});

module.exports = router;