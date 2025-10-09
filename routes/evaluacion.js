// routes/evaluacion.js - VERSION MEJORADA CON BLOQUEO DE MULTIPLES PARTICIPACIONES
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

// Procesar respuestas de funcionarios - CON VERIFICACIÓN DE PARTICIPACIÓN PREVIA
// En la ruta POST /funcionarios - MEJORAR manejo de errores:
router.post('/funcionarios', async (req, res) => {
    try {
        console.log('=== GUARDANDO RESPUESTAS FUNCIONARIOS ===');
        
        const { nombre, dispositivo_id } = req.body;
        
        // Validar que dispositivo_id esté presente
        if (!dispositivo_id) {
            console.error('Error: dispositivo_id no está presente en la petición');
            return res.status(400).render('error', {
                message: 'No se pudo identificar tu dispositivo',
                details: 'Por favor, recarga la página e intenta nuevamente.'
            });
        }

        // VERIFICACIÓN CRÍTICA: Comprobar que el dispositivo no haya participado ya EN FUNCIONARIOS
        console.log('🔍 Verificando si el dispositivo ya participó en funcionarios...');
        const verificacionParticipante = await db.query(
            'SELECT id FROM participantes WHERE dispositivo_id = $1', 
            [dispositivo_id]
        );
        
        if (verificacionParticipante.rows.length > 0) {
            const participanteId = verificacionParticipante.rows[0].id;
            
            // Verificar si YA TIENE respuestas de funcionarios
            const respuestasExistentes = await db.query(
                'SELECT COUNT(*) as count FROM respuestas_funcionarios WHERE participante_id = $1',
                [participanteId]
            );
            
            const totalRespuestas = parseInt(respuestasExistentes.rows[0].count);
            console.log(`Respuestas de funcionarios existentes encontradas: ${totalRespuestas}`);
            
            if (totalRespuestas > 0) {
                console.log('❌ BLOQUEO: Intento de reenvío detectado. Dispositivo ya participó en funcionarios.');
                // 👇 REDIRIGIR en lugar de devolver JSON
                return res.redirect('/ya-participo?tipo=funcionarios');
            }
        }
        
        // Registrar participante - ESPECIFICAR que es para funcionarios
        console.log('✅ Registrando participante para funcionarios...');
        const participanteResult = await db.registrarParticipante(dispositivo_id, nombre, 'funcionarios');
        const participanteId = participanteResult.rows[0].id;
        console.log('Participante registrado con ID:', participanteId);
        
        // Guardar respuestas con ID del participante
        console.log('💾 Guardando respuestas de funcionarios...');
        await db.saveRespuestasFuncionarios(req.body, participanteId);
        console.log('✅ Respuestas de funcionarios guardadas correctamente');
        
        // Redirigir a la página de confirmación
        res.redirect('/evaluacion/confirmacion');
    } catch (error) {
        console.error('❌ Error al guardar respuestas de funcionarios:', error);
        
        // 👇 MANEJAR ERRORES CON PÁGINAS EN LUGAR DE JSON
        if (error.message.includes('ya ha completado')) {
            return res.redirect('/ya-participo?tipo=funcionarios');
        }
        
        res.status(500).render('error', {
            message: 'Error al guardar tus respuestas',
            details: error.message
        });
    }
});

// En la ruta POST /administrativo - MEJORAR manejo de errores:
router.post('/administrativo', async (req, res) => {
    try {
        console.log('=== GUARDANDO RESPUESTAS ADMINISTRATIVAS ===');

        const { nombre, dispositivo_id } = req.body;
        
        // Validar que dispositivo_id esté presente
        if (!dispositivo_id) {
            console.error('❌ Error: dispositivo_id no presente en la petición');
            return res.status(400).render('error', {
                message: 'No se pudo identificar tu dispositivo',
                details: 'Por favor, recarga la página e intenta nuevamente.'
            });
        }

        // VERIFICACIÓN CRÍTICA: Comprobar que el dispositivo no haya participado ya EN ADMINISTRATIVAS
        console.log('🔍 Verificando si el dispositivo ya participó en administrativas...');
        const verificacionParticipante = await db.query(
            'SELECT id FROM participantes WHERE dispositivo_id = $1', 
            [dispositivo_id]
        );
        
        if (verificacionParticipante.rows.length > 0) {
            const participanteId = verificacionParticipante.rows[0].id;
            
            // Verificar si YA TIENE respuestas administrativas
            const respuestasExistentes = await db.query(
                'SELECT COUNT(*) as count FROM respuestas_administrativas WHERE participante_id = $1',
                [participanteId]
            );
            
            const totalRespuestas = parseInt(respuestasExistentes.rows[0].count);
            console.log(`Respuestas administrativas existentes encontradas: ${totalRespuestas}`);
            
            if (totalRespuestas > 0) {
                console.log('❌ BLOQUEO: Intento de reenvío detectado. Dispositivo ya participó en administrativas.');
                // 👇 REDIRIGIR en lugar de devolver JSON
                return res.redirect('/ya-participo?tipo=administrativas');
            }
        }
        
        console.log('✅ Dispositivo ID:', dispositivo_id);
        console.log('✅ Nombre:', nombre);

        // Registrar participante - ESPECIFICAR que es para administrativas
        const participanteResult = await db.registrarParticipante(dispositivo_id, nombre, 'administrativas');
        const participanteId = participanteResult.rows[0].id;
        console.log('✅ Participante ID:', participanteId);

        // Guardar respuestas con ID del participante
        await db.saveRespuestasAdministrativas(req.body, participanteId);
        console.log('✅ Respuestas administrativas guardadas');
        
        // Redirigir a la página de confirmación administrativa
        res.redirect('/evaluacion/confirmacion-admin');
    } catch (error) {
        console.error('❌ Error al guardar respuestas administrativas:', error);
        
        // 👇 MANEJAR ERRORES CON PÁGINAS EN LUGAR DE JSON
        if (error.message.includes('ya ha completado')) {
            return res.redirect('/ya-participo?tipo=administrativas');
        }
        
        res.status(500).render('error', {
            message: 'Error al guardar tus respuestas',
            details: error.message
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

// Procesar respuestas administrativas - CON VERIFICACIÓN DE PARTICIPACIÓN PREVIA
router.post('/administrativo', async (req, res) => {
    try {
        console.log('=== GUARDANDO RESPUESTAS ADMINISTRATIVAS ===');
        console.log('Body completo recibido:', JSON.stringify(req.body, null, 2));
        console.log('Dispositivo_id recibido:', req.body.dispositivo_id);

        const { nombre, dispositivo_id } = req.body;
        
        // Validar que dispositivo_id esté presente
        if (!dispositivo_id) {
            console.error('❌ Error: dispositivo_id no presente en la petición');
            return res.status(400).json({
                success: false,
                message: 'No se pudo identificar tu dispositivo. Por favor, recarga la página e intenta nuevamente.'
            });
        }

        // VERIFICACIÓN CRÍTICA: Comprobar que el dispositivo no haya participado ya
        console.log('🔍 Verificando si el dispositivo ya participó...');
        const verificacionParticipante = await db.query(
            'SELECT id FROM participantes WHERE dispositivo_id = $1', 
            [dispositivo_id]
        );
        
        if (verificacionParticipante.rows.length > 0) {
            const participanteId = verificacionParticipante.rows[0].id;
            
            // Verificar si YA TIENE respuestas administrativas
            const respuestasExistentes = await db.query(
                'SELECT COUNT(*) as count FROM respuestas_administrativas WHERE participante_id = $1',
                [participanteId]
            );
            
            const totalRespuestas = parseInt(respuestasExistentes.rows[0].count);
            console.log(`Respuestas administrativas existentes encontradas: ${totalRespuestas}`);
            
            if (totalRespuestas > 0) {
                console.log('❌ BLOQUEO: Intento de reenvío detectado. Dispositivo ya participó.');
                return res.status(400).json({
                    success: false,
                    message: 'Ya has participado anteriormente. No puedes enviar respuestas múltiples veces desde el mismo dispositivo.'
                });
            }
        }
        
        console.log('✅ Dispositivo ID:', dispositivo_id);
        console.log('✅ Nombre:', nombre);

        // Registrar participante
        const participanteResult = await db.registrarParticipante(dispositivo_id, nombre);
        const participanteId = participanteResult.rows[0].id;
        console.log('✅ Participante ID:', participanteId);

        // Guardar respuestas con ID del participante
        await db.saveRespuestasAdministrativas(req.body, participanteId);
        console.log('✅ Respuestas administrativas guardadas');
        
        // Redirigir a la página de confirmación administrativa
        res.redirect('/evaluacion/confirmacion-admin');
    } catch (error) {
        console.error('❌ Error al guardar respuestas administrativas:', error);
        
        // Manejar específicamente el error de "ya participó"
        if (error.message.includes('ya ha participado')) {
            return res.status(400).json({
                success: false,
                message: 'Este dispositivo ya ha participado y no puede enviar respuestas nuevamente.'
            });
        }
        
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