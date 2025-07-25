const express = require('express');
const cors = require('cors');
const path = require('path');

const intercambiosRouter = require('./routes/intercambios');
const donacionesRouter = require('./routes/donaciones');
const entidadesRouter = require('./routes/entidades');
const authRouter = require('./routes/auth');
const registerRouter = require('./routes/register');

const app = express();
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

app.use('/api', contactoRouter);

// Ruta para obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
    const fs = require('fs');
    const usuariosPath = path.join(__dirname, 'usuarios.json');
    fs.readFile(usuariosPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error leyendo usuarios' });
        const usuarios = JSON.parse(data).usuarios || [];
        res.json(usuarios);
    });
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