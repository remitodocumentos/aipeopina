//app.js
// app.js - VERSION CORREGIDA
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(session);

// Crear la aplicación Express
const app = express();
const port = process.env.PORT || 3000;

// 🔐 Render usa proxy HTTPS, esto es obligatorio para que Express detecte el protocolo real
app.set('trust proxy', 1);

// 📦 Configuración de base de datos PostgreSQL en Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  client_encoding: 'UTF8'
});

// ⚙️ Configuración general
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Middleware para configurar codificación UTF-8
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    next();
});

// 🛡️ Configuración de sesión persistente con PostgreSQL - CORREGIDA
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'secreto_temporal_' + Math.random().toString(36),
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid',
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    secure: process.env.NODE_ENV === 'production', // 👈 IMPORTANTE: solo true en producción
    httpOnly: true,
    sameSite: 'lax' // 👈 CAMBIAR de 'none' a 'lax'
  }
}));

// Middleware para inyectar pool en req (opcional, pero útil)
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// 🛣️ Rutas
app.use('/', require('./routes/index'));
app.use('/evaluacion', require('./routes/evaluacion'));
app.use('/resultados', require('./routes/resultados'));
app.use('/admin', require('./routes/admin'));

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Página no encontrada',
    error: { status: 404 }
  });
});

// Manejo de errores general
app.use((error, req, res, next) => {
  console.error('Error en la aplicación:', error);
  res.status(500).render('error', {
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'production' ? {} : error
  });
});

// 🚀 Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});