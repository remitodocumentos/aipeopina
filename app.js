//app.js
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

// 🔐 Render usa proxy HTTPS
app.set('trust proxy', 1);

// 📦 Configuración de base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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

// 🛡️ Configuración de sesión persistente con PostgreSQL
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
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Middleware para inyectar pool en req
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// 🛣️ Rutas
app.use('/', require('./routes/index'));
app.use('/evaluacion', require('./routes/evaluacion'));
app.use('/resultados', require('./routes/resultados'));
app.use('/detalle-participante', require('./routes/detalle-participante')); // 👈 NUEVA RUTA
app.use('/admin', require('./routes/admin'));
app.use('/export', require('./routes/export')); // Exportación con auth
app.use('/descargar', require('./routes/export-public')); // 👈 Exportación PÚBLICA

// Redirecciones para compatibilidad
app.get('/resultados-inicial', (req, res) => res.redirect('/resultados/inicial'));
app.get('/resultados-final', (req, res) => res.redirect('/resultados/final'));

// ✅ NUEVA RUTA PARA PÁGINA "YA PARTICIPÓ"
router.get('/ya-participo', (req, res) => {
    const tipo = req.query.tipo || 'completa';
    
    // Validar que el tipo sea uno de los permitidos
    const tiposPermitidos = ['funcionarios', 'administrativas', 'completa'];
    const tipoFinal = tiposPermitidos.includes(tipo) ? tipo : 'completa';
    
    res.render('ya-participo', {
        tipo: tipoFinal
    });
});

// Manejo de errores 404 - SIMPLIFICADO
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Página no encontrada</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #2c5aa0; }
        </style>
    </head>
    <body>
        <h1>404 - Página no encontrada</h1>
        <p>La página que buscas no existe.</p>
        <a href="/">Volver al inicio</a>
    </body>
    </html>
  `);
});

// Manejo de errores general - SIMPLIFICADO
app.use((error, req, res, next) => {
  console.error('Error en la aplicación:', error);
  res.status(500).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Error del servidor</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #e74c3c; }
            .debug { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: left; }
        </style>
    </head>
    <body>
        <h1>500 - Error interno del servidor</h1>
        <p>Ha ocurrido un error inesperado.</p>
        ${process.env.NODE_ENV !== 'production' ? 
          `<div class="debug"><strong>Debug:</strong><br>${error.message}</div>` : ''}
        <a href="/">Volver al inicio</a>
    </body>
    </html>
  `);
});

// 🚀 Iniciar servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en puerto ${port}`);
  console.log(`✅ Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Base de datos: ${process.env.DATABASE_URL ? 'Configurada' : 'No configurada'}`);
});