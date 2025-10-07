//app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(session);
const app = express();
const port = process.env.PORT || 3000;

// 🔐 Render usa proxy HTTPS, esto es obligatorio para que Express detecte el protocolo real
app.set('trust proxy', 1);

// 📦 Configuración de base de datos PostgreSQL en Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  client_encoding: 'UTF8'
});

// ⚙️ Configuración general
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Middleware para configurar codificación UTF-8
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    next();
});

// 🛡️ Configuración de sesión persistente con PostgreSQL
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session' // Asegúrate de que esta tabla exista en Railway
  }),
  secret: process.env.SESSION_SECRET || 'secreto_temporal',
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid', // 👈 nombre explícito de la cookie
  cookie: {
    maxAge: 3600000,     // 1 hora
    secure: true,        // 👈 Render usa HTTPS, esto debe estar en true
    httpOnly: true,
    sameSite: 'none'     // 👈 permite que la cookie viaje en todas las peticiones
  }
}));

// 🔄 Inyectar pool en cada petición
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// 🛣️ Rutas
app.use('/', require('./routes/index'));
app.use('/evaluacion', require('./routes/evaluacion'));
app.use('/resultados', require('./routes/resultados'));
app.use('/admin', require('./routes/admin'));

// 🚀 Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en https://aipe-opina.onrender.com`);
});


