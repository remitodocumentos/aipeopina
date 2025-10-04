require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(session);
const app = express();
const port = process.env.PORT || 3000;

// Configuración de base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Configuración
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Configuración de sesión con PostgreSQL
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session' // Nombre de la tabla para sesiones
    }),
    secret: process.env.SESSION_SECRET || 'secreto_temporal',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 3600000, // 1 hora
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        sameSite: 'lax'
    }
}));

// Middleware para agregar pool a las peticiones
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// Rutas
app.use('/', require('./routes/index'));
app.use('/evaluacion', require('./routes/evaluacion'));
app.use('/resultados', require('./routes/resultados'));
app.use('/admin', require('./routes/admin'));

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

