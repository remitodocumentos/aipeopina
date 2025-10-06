// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Página de login
router.get('/login', (req, res) => {
    res.render('admin/login', { error: null });
});

// Procesar login

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    console.log('=== DEBUG LOGIN ===');
    console.log('Usuario ingresado:', username);
    console.log('Contraseña ingresada:', password);
    console.log('ADMIN_USER de entorno:', process.env.ADMIN_USER);
    console.log('ADMIN_PASSWORD de entorno:', process.env.ADMIN_PASSWORD ? 'Configurado' : 'No configurado');
    console.log('SESSION_SECRET de entorno:', process.env.SESSION_SECRET ? 'Configurado' : 'No configurado');
    console.log('==================');
    
    // Verificar credenciales
    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
        req.session.admin = { username };
        console.log('✅ Credenciales correctas');
        console.log('✅ Sesión creada:', req.session.admin);
        
        // Forzar el guardado de la sesión antes de redirigir
        req.session.save((err) => {
            if (err) {
                console.error('Error al guardar la sesión:', err);
                return res.status(500).send('Error al iniciar sesión');
            }
            console.log('✅ Sesión guardada correctamente');
            console.log('✅ Redirigiendo a /admin/dashboard');
            return res.redirect('/admin/dashboard');
        });
    } else {
        console.log('❌ Credenciales incorrectas');
        res.render('admin/login', { error: 'Credenciales inválidas' });
    }
});

// Cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Dashboard
router.get('/dashboard', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        console.log('=== DEBUG DASHBOARD ===');
        console.log('Usuario en sesión:', req.session.admin);
        console.log('====================');

        // Obtener estadísticas para el dashboard
        const totalRespuestasFuncionarios = await db.getTotalRespuestasFuncionarios();
        const totalRespuestasAdministrativas = await db.getTotalRespuestasAdministrativas();
        
        res.render('admin/dashboard', {
            totalRespuestasFuncionarios,
            totalRespuestasAdministrativas
        });
    } catch (error) {
        console.error('Error al cargar el dashboard:', error);
        res.status(500).send('Error al cargar el dashboard');
    }
});

// Gestión de funcionarios
router.get('/funcionarios', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const funcionarios = await db.getFuncionarios();
        console.log(`Funcionarios obtenidos: ${funcionarios.length}`);
        res.render('admin/funcionarios', { funcionarios });
     
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar funcionarios');
    }
});

// Agregar funcionario
router.post('/funcionarios', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const { nombre, cargo, seccion } = req.body;
        await db.addFuncionario(nombre, cargo, seccion);
        res.redirect('/admin/funcionarios');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al agregar funcionario');
    }
});

// Editar funcionario
router.put('/funcionarios/:id', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, cargo, seccion } = req.body;
        await db.updateFuncionario(id, nombre, cargo, seccion);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar funcionario' });
    }
});

// Eliminar funcionario
router.delete('/funcionarios/:id', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        await db.deleteFuncionario(id);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar funcionario' });
    }
});

// Gestión de preguntas de funcionarios
router.get('/preguntas-funcionarios', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const preguntas = await db.getPreguntasFuncionarios();
        console.log(`Preguntas de funcionarios obtenidas: ${preguntas.length}`);
        res.render('admin/preguntas', { 
            preguntas, 
            tipo: 'funcionarios',
            titulo: 'Preguntas para Funcionarios',
            secciones: [] // 👈 evita el error en la vista
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar preguntas');
    }
});

// Gestión de preguntas administrativas
router.get('/preguntas-administrativas', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const preguntas = await db.getPreguntasAdministrativas();
        const secciones = await db.getSeccionesAdministrativas();
        console.log(`Preguntas administrativas obtenidas: ${preguntas.length}`);
        console.log(`Secciones obtenidas: ${secciones.length}`);
        res.render('admin/preguntas', { 
            preguntas, 
            secciones,
            tipo: 'administrativas',
            titulo: 'Preguntas Administrativas'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar preguntas');
    }
});

// Agregar pregunta para funcionarios
router.post('/preguntas-funcionarios', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const { texto, categoria } = req.body;
        await db.addPreguntaFuncionario(texto, categoria);
        res.redirect('/admin/preguntas-funcionarios');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al agregar pregunta');
    }
});

// Agregar pregunta administrativa
router.post('/preguntas-administrativas', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const { texto, seccion_id } = req.body;
        await db.addPreguntaAdministrativa(texto, seccion_id);
        res.redirect('/admin/preguntas-administrativas');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al agregar pregunta');
    }
});

// Editar pregunta (funcionario o administrativa)
router.put('/preguntas/:tipo/:id', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const { tipo, id } = req.params;
        const { texto, categoria, seccion_id } = req.body;
        
        if (tipo === 'funcionarios') {
            await db.updatePreguntaFuncionario(id, texto, categoria);
        } else {
            await db.updatePreguntaAdministrativa(id, texto, seccion_id);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar pregunta' });
    }
});

// Eliminar pregunta (funcionario o administrativa)
router.delete('/preguntas/:tipo/:id', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const { tipo, id } = req.params;
        
        if (tipo === 'funcionarios') {
            await db.deletePreguntaFuncionario(id);
        } else {
            await db.deletePreguntaAdministrativa(id);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar pregunta' });
    }
});

// Gestión de secciones administrativas
router.get('/secciones', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const secciones = await db.getSeccionesAdministrativas();
        console.log(`Secciones obtenidas: ${secciones.length}`);
        res.render('admin/secciones', { secciones });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar secciones');
    }
});

// Agregar sección administrativa
router.post('/secciones', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const { nombre } = req.body;
        await db.addSeccionAdministrativa(nombre);
        res.redirect('/admin/secciones');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al agregar sección');
    }
});

// Editar sección administrativa
router.put('/secciones/:id', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        await db.updateSeccionAdministrativa(id, nombre);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar sección' });
    }
});

// Eliminar sección administrativa
router.delete('/secciones/:id', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        await db.deleteSeccionAdministrativa(id);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar sección' });
    }
});

// Para resetear base de datos y restablecer datos iniciales
// ... (rutas existentes)

// Página de confirmación para resetear base de datos
router.get('/resetear-db', authMiddleware.isAuthenticated, (req, res) => {
    res.render('admin/resetear-db', { 
        title: 'Resetear Base de Datos',
        error: null,
        success: null
    });
});


// Procesar reseteo de base de datos
router.post('/resetear-db', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        console.log('Iniciando reseteo de la base de datos...');
        
        // 1. Eliminar todas las tablas en orden inverso para evitar errores de claves foráneas
        await req.db.query('DROP TABLE IF EXISTS respuestas_administrativas CASCADE');
        await req.db.query('DROP TABLE IF EXISTS respuestas_funcionarios CASCADE');
        await req.db.query('DROP TABLE IF EXISTS participantes CASCADE');
        await req.db.query('DROP TABLE IF EXISTS preguntas_administrativas CASCADE');
        await req.db.query('DROP TABLE IF EXISTS preguntas_funcionarios CASCADE');
        await req.db.query('DROP TABLE IF EXISTS secciones_administrativas CASCADE');
        await req.db.query('DROP TABLE IF EXISTS funcionarios CASCADE');
        await req.db.query('DROP TABLE IF EXISTS session CASCADE');
        
        console.log('✅ Tablas eliminadas');
        
        // 2. Volver a crear las tablas
        await req.db.query(`
            CREATE TABLE funcionarios (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                cargo VARCHAR(100) NOT NULL,
                seccion VARCHAR(100) NOT NULL
            );
            
            CREATE TABLE preguntas_funcionarios (
                id SERIAL PRIMARY KEY,
                texto VARCHAR(255) NOT NULL,
                categoria VARCHAR(100) NOT NULL
            );
            
            CREATE TABLE secciones_administrativas (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL
            );
            
            CREATE TABLE preguntas_administrativas (
                id SERIAL PRIMARY KEY,
                texto VARCHAR(255) NOT NULL,
                seccion_id INTEGER REFERENCES secciones_administrativas(id)
            );
            
            CREATE TABLE participantes (
                id SERIAL PRIMARY KEY,
                dispositivo_id VARCHAR(255) NOT NULL UNIQUE,
                nombre VARCHAR(100),
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE session (
                sid varchar NOT NULL COLLATE "default",
                sess json NOT NULL,
                expire timestamp(6) NOT NULL,
                PRIMARY KEY (sid)
            );
            
            CREATE TABLE respuestas_funcionarios (
                id SERIAL PRIMARY KEY,
                funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id),
                pregunta_id INTEGER NOT NULL REFERENCES preguntas_funcionarios(id),
                respuesta VARCHAR(20) NOT NULL CHECK (respuesta IN ('excelente', 'bueno', 'regular', 'deficiente', 'malo')),
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                participante_id INTEGER REFERENCES participantes(id)
            );
            
            CREATE TABLE respuestas_administrativas (
                id SERIAL PRIMARY KEY,
                seccion_id INTEGER NOT NULL REFERENCES secciones_administrativas(id),
                pregunta_id INTEGER NOT NULL REFERENCES preguntas_administrativas(id),
                respuesta VARCHAR(20) NOT NULL CHECK (respuesta IN ('excelente', 'bueno', 'regular', 'deficiente', 'malo')),
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                participante_id INTEGER REFERENCES participantes(id)
            );
        `);
        
        console.log('✅ Tablas recreadas');
        
        // 3. Insertar datos iniciales totales desde seeds
        await req.db.query(`
            -- Insertar funcionarios
            INSERT INTO funcionarios (nombre, cargo, seccion) VALUES 
            ('Luis Angel Ramirez Vargas', 'Alcalde', 'Despacho del alcalde'),
            ('Jairo Garzón Conde', 'Secretario', 'Secretaria general y de gobierno'),
            ('Alfredo Charry Medina', 'Secretario', 'Secretaria de hacienda'),
            ('Ana Maria Conde Garzon', 'Secretaria', 'Secretaria de protección social'),
            ('Alexander Pulecio Charry', 'Secretario', 'Secretaria de planeación'),
            ('Daniela Ramirez Chavarro', 'Secretaria', 'Secretaria de infraestructura'),
            ('Javier Charry Bonilla', 'Secretario', 'Secretaria de desarrollo económico'),
            ('Maria Ximena Martin Charry', 'Secretaria', 'Secretaria de tránsito'),
            ('Joan Orlando Garay Diaz', 'Inspector', 'Inspección de policía'),
            ('Helenohora Llanos Diaz', 'Comisaria', 'Comisaria de familia');
            
            -- Insertar preguntas para funcionarios
            INSERT INTO preguntas_funcionarios (texto, categoria) VALUES 
            ('Integridad y ética', 'Personal'),
            ('Respeto, dignidad y decoro', 'Personal'),
            ('Aptitud y honestidad', 'Personal'),
            ('Veracidad y cumplimiento', 'Personal'),
            ('Comunicación y empatía', 'Personal'),
            ('Liderazgo y gestión de equipos', 'Profesional'),
            ('Capacidad para resolver problemas', 'Profesional'),
            ('Transparencia y eficiencia en la toma de decisiones', 'Profesional'),
            ('Eficiencia en la gestión de los recursos', 'Desempeño'),
            ('Cumplimiento de metas', 'Desempeño'),
            ('Proyectos estratégicos con resultados concretos', 'Desempeño'),
            ('Ejercicio adecuado del cargo', 'Desempeño'),
            ('Uso adecuado del tiempo de trabajo', 'Desempeño');
            
            -- Insertar secciones administrativas
            INSERT INTO secciones_administrativas (nombre) VALUES 
            ('Gestión y administración pública'),
            ('Infraestructura y servicios públicos'),
            ('Desarrollo urbano y territorial'),
            ('Medio ambiente y sostenibilidad'),
            ('Desarrollo social y bienestar'),
            ('Desarrollo económico y competitividad'),
            ('Calidad de vida en general'),
            ('Vulneración del bienestar social y la convivencia ciudadana');
            `);

        // 4. Insertar preguntas administrativas desde el archivo SQL
        const preguntasPath = path.join(__dirname, '..', 'db', 'preguntas-administrativas.sql');
        const preguntasSQL = fs.readFileSync(preguntasPath, 'utf8');

        // Mejorar el procesamiento del SQL
        const cleanSQL = preguntasSQL
            .replace(/\r\n/g, '\n') // Normalizar saltos de línea
            .replace(/\n\s*\n/g, '\n') // Eliminar líneas vacías múltiples
            .trim();

        // Dividir el SQL en sentencias individuales
        const statements = cleanSQL.split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        console.log(`Procesando ${statements.length} sentencias SQL...`);

        // Iniciar transacción
        const client = await req.db.connect();
        try {
            await client.query('BEGIN');
            
            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                if (statement.trim()) {
                    try {
                        await client.query(statement);
                        console.log(`✅ Sentencia ${i + 1}/${statements.length} ejecutada`);
                    } catch (error) {
                        console.error(`❌ Error en sentencia ${i + 1}:`, statement.substring(0, 50) + '...');
                        console.error('Error:', error.message);
                        throw error;
                    }
                }
            }
            
            await client.query('COMMIT');
            console.log('✅ Preguntas administrativas insertadas correctamente');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error al insertar preguntas administrativas:', error);
            throw error;
        } finally {
            client.release();
        }   
        
        console.log('✅ Datos iniciales insertados');
        
        res.render('admin/resetear-db', { 
            title: 'Resetear Base de Datos',
            success: 'Base de datos reseteada exitosamente',
            error: null
        });
        
    } catch (error) {
        console.error('Error al resetear la base de datos:', error);
        res.render('admin/resetear-db', { 
            title: 'Resetear Base de Datos',
            error: 'Error al resetear la base de datos: ' + error.message,
            success: null
        });
    }
});

module.exports = router;
