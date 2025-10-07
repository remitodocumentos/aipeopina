// routes/evaluacion.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');
const participacionMiddleware = require('../middleware/participacion');

// Página de evaluación de funcionarios
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
            console.error(error);
            res.status(500).send('Error al cargar el formulario de funcionarios');
        }
    }
);

// Procesar respuestas de funcionarios
router.post('/funcionarios', async (req, res) => {
    try {
        console.log('=== DEBUG GUARDAR RESPUESTAS FUNCIONARIOS ===');
        console.log('Cuerpo de la petición:', req.body);
        
        const { nombre, dispositivo_id } = req.body;
        
        // Validar que dispositivo_id esté presente
        if (!dispositivo_id) {
            console.error('Error: dispositivo_id no está presente en la petición');
            return res.status(400).send(`
                <div style="max-width: 600px; margin: 50px auto; padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; color: #721c24;">
                    <h2>Error de validación</h2>
                    <p>No se pudo identificar tu dispositivo. Por favor, recarga la página e intenta nuevamente.</p>
                    <a href="/evaluacion/funcionarios" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Volver a intentarlo</a>
                </div>
            `);
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
        
        // Redirigir a la página de resultados
        res.redirect('/resultados');
    } catch (error) {
        console.error('Error al guardar respuestas de funcionarios:', error);
        res.status(500).send(`
            <div style="max-width: 600px; margin: 50px auto; padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; color: #721c24;">
                <h2>Error al guardar respuestas</h2>
                <p>Ha ocurrido un error al guardar tus respuestas. Por favor, intenta nuevamente.</p>
                <p><strong>Detalles del error:</strong> ${error.message}</p>
                <a href="/evaluacion/funcionarios" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Volver a intentarlo</a>
            </div>
        `);
    }
});

// Página de evaluación administrativa
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
            console.error(error);
            res.status(500).send('Error al cargar el formulario administrativo');
        }
    }
);

// Procesar respuestas administrativas
router.post('/administrativo', async (req, res) => {
    try {
        const { nombre, dispositivo_id } = req.body;
        
        // Validar que dispositivo_id esté presente
        if (!dispositivo_id) {
            return res.status(400).send('Error: dispositivo_id no está presente en la petición');
        }
        
        // Registrar participante (si no se registró en la primera parte)
        const participanteResult = await db.registrarParticipante(dispositivo_id, nombre);
        const participanteId = participanteResult.rows[0].id;
        
        // Guardar respuestas con ID del participante
        await db.saveRespuestasAdministrativas(req.body, participanteId);
        
        // Redirigir a la página de resultados
        res.redirect('/resultados');
    } catch (error) {
        console.error('Error al guardar respuestas administrativas:', error);
        res.status(500).send('Error al guardar respuestas administrativas');
    }
});

module.exports = router;