
const admin = require('firebase-admin');
const express = require('express');
const router = express.Router();

// Inicializa Firebase Admin solo si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../firebase-credentials.json')),
  });
}
const db = admin.firestore();

router.post('/register', async (req, res) => {
  try {
    const { nombre, email, telefono, password, dni, direccion, fechaNacimiento } = req.body;
    if (!nombre || !email || !telefono || !password || !dni || !direccion || !fechaNacimiento) {
      return res.status(400).json({ error: 'Completa todos los campos.' });
    }
    // Verificar si el email ya existe en Firestore
    const snapshot = await db.collection('usuarios').where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ error: 'El correo ya está registrado.' });
    }
    // Generar un nuevo id numérico (opcional, para compatibilidad)
    const usuariosSnap = await db.collection('usuarios').get();
    let maxId = 0;
    usuariosSnap.forEach(doc => {
      const u = doc.data();
      if (u.id && typeof u.id === 'number' && u.id > maxId) maxId = u.id;
    });
    const nuevoUsuario = {
      id: maxId + 1,
      nombre,
      email,
      telefono,
      password,
      dni,
      direccion,
      fechaNacimiento,
      rol: 'usuario'
    };
    const ref = await db.collection('usuarios').add(nuevoUsuario);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
});

module.exports = router;
