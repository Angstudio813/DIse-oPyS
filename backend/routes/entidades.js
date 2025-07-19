
const express = require('express');
const path = require('path');
const { leerJSON } = require('../utils/fileHelper');

const router = express.Router();

// Obtener todas las entidades (usuarios con rol 'entidad')
router.get('/entidades', async (req, res) => {
    try {
        const usuariosPath = path.join(__dirname, '../usuarios.json');
        const data = await leerJSON(usuariosPath);
        const entidades = (data.usuarios || []).filter(u => u.rol === 'entidad');
        res.json(entidades);
    } catch (error) {
        console.error('Error obteniendo entidades:', error);
        res.status(500).json({ error: 'Error al cargar entidades' });
    }
});

module.exports = router;
