const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Inicializar Firebase Admin solo una vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../firebase-credentials.json')),
  });
}
const db = admin.firestore();

// Acciones de entidad sobre donación
router.post('/donaciones/:id/accion', async (req, res) => {
  const { accion, entidad } = req.body;
  const id = req.params.id;
  if (!['aceptar','rechazar','entregada'].includes(accion)) {
    return res.status(400).json({ success: false, message: 'Acción no válida' });
  }
  try {
    const donacionRef = db.collection('donaciones').doc(id);
    const doc = await donacionRef.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Donación no encontrada' });
    const fecha = new Date().toISOString();
    let update = {};
    if (accion === 'aceptar') {
      update = {
        estadoDonacion: 'aceptada',
        entidadReceptora: entidad,
        historialEstados: admin.firestore.FieldValue.arrayUnion({ estado: 'aceptada', fecha })
      };
    } else if (accion === 'rechazar') {
      update = {
        estadoDonacion: 'rechazada',
        entidadReceptora: entidad,
        historialEstados: admin.firestore.FieldValue.arrayUnion({ estado: 'rechazada', fecha })
      };
    } else if (accion === 'entregada') {
      update = {
        estadoDonacion: 'entregada',
        fechaEntrega: fecha,
        historialEstados: admin.firestore.FieldValue.arrayUnion({ estado: 'entregada', fecha })
      };
    }
    await donacionRef.update(update);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar donación' });
  }
});


// Obtener todas las donaciones
router.get('/donaciones', async (req, res) => {
  // Si se consulta por email de usuario (donante)
  const email = req.query.email || req.headers['x-user-email'] || req.body?.email;
  // Si se consulta por entidad beneficiaria
  const entidadEmail = req.query.entidadEmail;
  const entidadId = req.query.entidadId;
  try {
    const snapshot = await admin.firestore().collection('donaciones').get();
    let donaciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Filtrar por usuario donante
    if (email) {
      donaciones = donaciones.filter(d => d.email === email);
      return res.json(donaciones);
    }
    // Filtrar por entidad beneficiaria
    if (entidadEmail || entidadId) {
      donaciones = donaciones.filter(d => {
        const beneficiaria = d.entidadBeneficiaria || {};
        const receptora = d.entidadReceptora || {};
        return (
          (beneficiaria && ((entidadEmail && beneficiaria.email === entidadEmail) || (entidadId && String(beneficiaria.id) === String(entidadId)))) ||
          (receptora && ((entidadEmail && receptora.email === entidadEmail) || (entidadId && String(receptora.id) === String(entidadId))))
        );
      });
      return res.json(donaciones);
    }
    // Si no hay filtros, devolver vacío por seguridad
    return res.json([]);
  } catch (error) {
    res.status(500).json({ error: 'Error leyendo donaciones desde Firestore', details: error.message });
  }
});


// Crear donación
router.post('/donaciones', async (req, res) => {
  try {
    const nuevaDonacion = {
      fecha: new Date().toISOString(),
      ...req.body,
      estadoPublicacion: 'activo',
      historialEstados: [{ estado: 'pendiente', fecha: new Date().toISOString() }]
    };
    const docRef = await db.collection('donaciones').add(nuevaDonacion);
    res.json({ success: true, donacion: { id: docRef.id, ...nuevaDonacion } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al guardar la donación' });
  }
});

// Filtrar donaciones por categoría
router.get('/donaciones/categoria/:categoria', async (req, res) => {
  try {
    const categoria = req.params.categoria.toLowerCase();
    const snapshot = await db.collection('donaciones').where('categoria', '==', categoria).where('estadoPublicacion', '==', 'activo').get();
    const filtradas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(filtradas);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al filtrar donaciones' });
  }
});

// Buscar donaciones por término
router.get('/donaciones/buscar/:termino', async (req, res) => {
  try {
    const termino = req.params.termino.toLowerCase();
    const snapshot = await db.collection('donaciones').get();
    const encontradas = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(d =>
        (d.itemDona && d.itemDona.toLowerCase().includes(termino)) ||
        (d.descripcion && d.descripcion.toLowerCase().includes(termino))
      );
    res.json(encontradas);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al buscar donaciones' });
  }
});

module.exports = router;