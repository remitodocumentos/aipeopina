//routes/evaluacion.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');
const participacionMiddleware = require('../middleware/participacion');

// Middleware para verificar si el dispositivo ya ha participado
router.get('/funcionarios', 
    participacionMiddleware.verificarParticipacion,
    participacionMiddleware.generarDispositivoId,
    async (req, res) => {
        try {
            const funcionarios = await db.getFuncionarios();
            const preguntas = await db.getPreguntasFuncionarios();
            res.render('funcionarios', { 
                funcionarios, 
                preguntas,
                dispositivoId: req.dispositivoId 
            });
        } catch (error) {
            console.error('Error al cargar el formulario de funcionarios:', error);
            res.status(500).send('Error al cargar el formulario');
        }
    }
);

// Procesar respuestas de funcionarios
router.post('/funcionarios', async (req, res) => {
    try {
        console.log('=== DEBUG GUARDAR RESPUESTAS FUNCIONARIOS ===');
        console.log('Cuerpo de la petición:', req.body);
        
        const { nombre, dispositivo_id, tipo_participacion } = req.body;
        
        // Validar que dispositivo_id esté presente
        if (!dispositivo_id) {
            console.error('Error: dispositivo_id no está presente en la petición');
            return res.status(400).json({
                success: false,
                message: 'No se pudo identificar tu dispositivo. Por favor, recarga la página e intenta nuevamente.'
            });
        }
        
        // Registrar participante
        console.log('Registrando participante...');
        const participanteResult = await db.registrarParticipante(dispositivo_id, nombre);
        const participanteId = participanteResult.rows[0].id;
        console.log('Participante registrado con ID:', participanteId);
        
        // Guardar respuestas con ID del participante
        console.log('Guardando respuestas...');
        await db.saveRespuestasFuncionarios(req.body, participanteId);
        console.log('Respuestas guardadas correctamente');
        
        // Redirigir a la página de confirmación
        res.redirect('/evaluacion/confirmacion');
    } catch (error) {
        console.error('Error al guardar respuestas de funcionarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar tus respuestas: ' + error.message
        });
    }
});

// Página de confirmación
router.get('/confirmacion', (req, res) => {
    res.render('confirmacion');
});

// Middleware para verificar si el dispositivo ya ha participado
router.get('/administrativo', 
    participacionMiddleware.verificarParticipacion,
    participacionMiddleware.generarDispositivoId,
    async (req, res) => {
        try {
            const secciones = await db.getSeccionesAdministrativas();
            const preguntas = await db.getPreguntasAdministrativas();
            res.render('administrativo', { 
                secciones, 
                preguntas,
                dispositivoId: req.dispositivoId 
            });
        } catch (error) {
            console.error('Error al cargar el formulario administrativo:', error);
            res.status(500).send('Error al cargar el formulario');
        }
    }
);

// ESTE ES EL CÓDIGO DEL PASO 4 - PROCESAR RESPUESTAS ADMINISTRATIVAS
router.post('/administrativo', async (req, res) => {
    try {
        console.log('=== DEBUG ADMINISTRATIVO ===');
        console.log('Body recibido:', req.body);

        const { nombre, dispositivo_id } = req.body;
        
        // Validar que dispositivo_id esté presente
        if (!dispositivo_id) {
            console.error('❌ Error: dispositivo_id no presente en la petición');
            return res.status(400).json({
                success: false,
                message: 'No se pudo identificar tu dispositivo. Por favor, recarga la página e intenta nuevamente.'
            });
        }
        
        console.log('✅ Dispositivo ID:', dispositivo_id);
        console.log('✅ Nombre:', nombre);

        // Registrar participante (si no se registró en la primera parte)
        const participanteResult = await db.registrarParticipante(dispositivo_id, nombre);
        const participanteId = participanteResult.rows[0].id;
        console.log('✅ Participante ID:', participanteId);

        // Guardar respuestas con ID del participante
        await db.saveRespuestasAdministrativas(req.body, participanteId);
        console.log('✅ Respuestas administrativas guardadas');
        
        // Redirigir a la página de confirmación administrativa
        res.redirect('/evaluacion/confirmacion-admin');
    } catch (error) {
        console.error('Error al guardar respuestas administrativas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar tus respuestas: ' + error.message
        });
    }
});

// Página de confirmación administrativa
router.get('/confirmacion-admin', (req, res) => {
    res.render('confirmacion-admin');
});

module.exports = router;