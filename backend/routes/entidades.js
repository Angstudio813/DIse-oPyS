
const express = require('express');
const admin = require('firebase-admin');


const router = express.Router();

// Obtener todas las entidades (usuarios con rol 'entidad')
router.get('/entidades', async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection('usuarios').where('rol', '==', 'entidad').get();
        const entidades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(entidades);

    }  catch (error) {
        console.error('Error obteniendo entidades:', error);
    }
});

module.exports = router;
