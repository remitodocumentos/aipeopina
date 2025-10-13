// routes/evaluacion.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');
const participacionMiddleware = require('../middleware/participacion');

// Middleware para verificar participación
router.use(participacionMiddleware.generarDispositivoId);

// FORMULARIO DE FUNCIONARIOS
router.get('/funcionarios', 
    participacionMiddleware.verificarParticipacion,
    async (req, res) => {
        try {
            const [funcionarios, preguntas] = await Promise.all([
                db.getFuncionarios(),
                db.getPreguntasFuncionarios()
            ]);
            
            res.render('funcionarios', { 
                funcionarios, 
                preguntas,
                dispositivoId: req.dispositivoId 
            });
        } catch (error) {
            console.error('Error al cargar formulario de funcionarios:', error);
            res.status(500).render('error', {
                message: 'Error al cargar el formulario',
                details: error.message
            });
        }
    }
);

// PROCESAR FUNCIONARIOS - CON MIDDLEWARE DE VERIFICACIÓN
router.post('/funcionarios', 
    participacionMiddleware.verificarParticipacion, // ✅ AGREGAR ESTO
    participacionMiddleware.verificarAntesDeGuardar, // ✅ Y ESTO
    async (req, res) => {
        try {
            console.log('=== GUARDANDO RESPUESTAS FUNCIONARIOS ===');
            
            const { nombre, dispositivo_id } = req.body;
            
            // Validar que dispositivo_id esté presente
            if (!dispositivo_id) {
                console.error('Error: dispositivo_id no está presente');
                return res.status(400).render('error', {
                    message: 'No se pudo identificar tu dispositivo',
                    details: 'Por favor, recarga la página e intenta nuevamente.'
                });
            }

            // ✅ ELIMINAR VERIFICACIÓN DUPLICADA - Ya la hace el middleware
            console.log('✅ Pasó verificación middleware, procediendo a guardar...');

            // REGISTRAR Y GUARDAR (código normal)
            console.log('✅ Registrando participante para funcionarios...');
            const participanteResult = await db.registrarParticipante(dispositivo_id, nombre, 'funcionarios');
            const participanteId = participanteResult.rows[0].id;
            
            console.log('💾 Guardando respuestas de funcionarios...');
            await db.saveRespuestasFuncionarios(req.body, participanteId);
            console.log('✅ Respuestas guardadas correctamente');
            
            // Redirigir a confirmación
            res.redirect('/evaluacion/confirmacion');
            
        } catch (error) {
            console.error('❌ Error al guardar respuestas de funcionarios:', error);
            
            // MANEJAR ERRORES CON REDIRECCIONES HTML
            if (error.message.includes('ya ha completado') || error.message.includes('ya participó')) {
                return res.redirect('/ya-participo?tipo=funcionarios');
            }
            
            // ✅ Asegurar que siempre se renderice HTML, nunca JSON
            res.status(500).render('error', {
                message: 'Error al guardar tus respuestas',
                details: 'Por favor intenta nuevamente. Si el problema persiste, contacta al administrador.'
            });
        }
    }
);

// FORMULARIO ADMINISTRATIVO
router.get('/administrativo', 
    participacionMiddleware.verificarParticipacion,
    async (req, res) => {
        try {
            const [secciones, preguntas] = await Promise.all([
                db.getSeccionesAdministrativas(),
                db.getPreguntasAdministrativas()
            ]);
            
            res.render('administrativo', { 
                secciones, 
                preguntas,
                dispositivoId: req.dispositivoId 
            });
        } catch (error) {
            console.error('Error al cargar formulario administrativo:', error);
            res.status(500).render('error', {
                message: 'Error al cargar el formulario',
                details: error.message
            });
        }
    }
);

// PROCESAR ADMINISTRATIVO - CON MIDDLEWARE DE VERIFICACIÓN
router.post('/administrativo', 
    participacionMiddleware.verificarParticipacion, // ✅ AGREGAR ESTO
    participacionMiddleware.verificarAntesDeGuardar, // ✅ Y ESTO
    async (req, res) => {
        try {
            console.log('=== GUARDANDO RESPUESTAS ADMINISTRATIVAS ===');
            
            const { nombre, dispositivo_id } = req.body;
            
            // Validar que dispositivo_id esté presente
            if (!dispositivo_id) {
                console.error('❌ Error: dispositivo_id no presente');
                return res.status(400).render('error', {
                    message: 'No se pudo identificar tu dispositivo',
                    details: 'Por favor, recarga la página e intenta nuevamente.'
                });
            }

            // ✅ ELIMINAR VERIFICACIÓN DUPLICADA - Ya la hace el middleware
            console.log('✅ Pasó verificación middleware, procediendo a guardar administrativas...');

            // REGISTRAR Y GUARDAR (código normal)
            console.log('✅ Registrando participante para administrativas...');
            const participanteResult = await db.registrarParticipante(dispositivo_id, nombre, 'administrativas');
            const participanteId = participanteResult.rows[0].id;
            
            console.log('💾 Guardando respuestas administrativas...');
            await db.saveRespuestasAdministrativas(req.body, participanteId);
            console.log('✅ Respuestas administrativas guardadas');
            
            // Redirigir a confirmación administrativa
            res.redirect('/evaluacion/confirmacion-admin');
            
        } catch (error) {
            console.error('❌ Error al guardar respuestas administrativas:', error);
            
            // MANEJAR ERRORES CON REDIRECCIONES HTML
            if (error.message.includes('ya ha completado') || error.message.includes('ya participó')) {
                return res.redirect('/ya-participo?tipo=administrativas');
            }
            
            // ✅ Asegurar que siempre se renderice HTML, nunca JSON
            res.status(500).render('error', {
                message: 'Error al guardar tus respuestas',
                details: 'Por favor intenta nuevamente. Si el problema persiste, contacta al administrador.'
            });
        }
    }
);

// PÁGINAS DE CONFIRMACIÓN
router.get('/confirmacion', (req, res) => {
    res.render('confirmacion');
});

router.get('/confirmacion-admin', (req, res) => {
    res.render('confirmacion-admin');
});

module.exports = router;