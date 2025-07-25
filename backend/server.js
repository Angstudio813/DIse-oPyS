const express = require('express');
const cors = require('cors');
const path = require('path');

// Inicialización global de Firebase Admin
const admin = require('firebase-admin');
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require('./firebase-credentials.json')),
    });
    console.log('✅ Firebase Admin inicializado correctamente');
  }
} catch (err) {
  console.error('❌ Error inicializando Firebase Admin:', err);
}

const intercambiosRouter = require('./routes/intercambios');
const donacionesRouter = require('./routes/donaciones');
const entidadesRouter = require('./routes/entidades');
const authRouter = require('./routes/auth');
const registerRouter = require('./routes/register');

const app = express();
const mensajesContactoRouter = require('./routes/mensajes_contacto');
const contactoRouter = require('./routes/contacto');
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rutas de API

app.use('/api', intercambiosRouter);
app.use('/api', donacionesRouter);
app.use('/api', entidadesRouter);
app.use('/api', authRouter);
app.use('/api', registerRouter);

app.use('/api', mensajesContactoRouter);
app.use('/api', contactoRouter);

// Ruta para obtener todos los usuarios desde Firestore
app.get('/api/usuarios', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('usuarios').get();
    const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error leyendo usuarios desde Firestore', details: error.message });
  }
});

// Ruta principal - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos desde la carpeta frontend`);
});
