
const express = require('express');
// Usar instancia global de Firebase Admin inicializada en server.js
const router = express.Router();

// Firebase Admin ya está inicializado en server.js
const db = require('firebase-admin').firestore();


// Obtener todos los intercambios
router.get('/intercambios', async (req, res) => {
  try {
    const snapshot = await db.collection('intercambios').get();
    const intercambios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(intercambios);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener intercambios', error });
  }
});


// Crear intercambio
router.post('/intercambios', async (req, res) => {
  try {
    const nuevoIntercambio = {
      fecha: new Date().toISOString(),
      ...req.body,
      estado: 'activo'
    };
    let ref;
    if (req.body.id) {
      ref = db.collection('intercambios').doc(String(req.body.id));
      await ref.set(nuevoIntercambio);
    } else {
      ref = await db.collection('intercambios').add(nuevoIntercambio);
    }
    const intercambioGuardado = { id: ref.id, ...nuevoIntercambio };
    res.json({ success: true, intercambio: intercambioGuardado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al guardar', error });
  }
});


// Obtener intercambio por ID
router.get('/intercambios/:id', async (req, res) => {
  try {
    const doc = await db.collection('intercambios').doc(req.params.id).get();
    if (!doc.exists) {
      return res.json(null);
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener intercambio', error });
  }
});


// Filtrar por categoría
router.get('/intercambios/categoria/:categoria', async (req, res) => {
  try {
    const snapshot = await db.collection('intercambios')
      .where('categoria', '==', req.params.categoria)
      .where('estado', '==', 'activo')
      .get();
    const filtrados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(filtrados);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al filtrar', error });
  }
});


// Buscar por término
router.get('/intercambios/buscar/:termino', async (req, res) => {
  try {
    const termino = req.params.termino.toLowerCase();
    const snapshot = await db.collection('intercambios').get();
    const encontrados = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(i =>
        (i.itemOfrece && i.itemOfrece.toLowerCase().includes(termino)) ||
        (i.itemBusca && i.itemBusca.toLowerCase().includes(termino)) ||
        (i.descripcionOfrece && i.descripcionOfrece.toLowerCase().includes(termino)) ||
        (i.descripcionBusca && i.descripcionBusca.toLowerCase().includes(termino))
      );
    res.json(encontrados);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en la búsqueda', error });
  }
});

module.exports = router;