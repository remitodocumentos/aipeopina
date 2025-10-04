// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');
const authMiddleware = require('../middleware/auth');

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
        console.log('✅ Credenciales correctas');
        req.session.admin = { username };
        console.log('✅ Sesión creada:', req.session.admin);
        console.log('✅ Redirigiendo a /admin/dashboard');
        return res.redirect('/admin/dashboard');
    } else {
        console.log('❌ Credenciales incorrectas');
        return res.render('admin/login', { error: 'Credenciales inválidas' });
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
        res.render('admin/preguntas', { 
            preguntas, 
            tipo: 'funcionarios',
            titulo: 'Preguntas para Funcionarios'
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

module.exports = router;