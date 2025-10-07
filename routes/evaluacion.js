const express = require('express');
const router = express.Router();
const db = require('../db/queries');
const participacionMiddleware = require('../middleware/participacion');

// Mostrar formulario de funcionarios
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
            res.status(500).send('Error al cargar el formulario');
        }
    }
);

// Guardar respuestas de funcionarios
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
        // Registrar participante
        console.log('Registrando participante...');
        const participanteResult = await db.registrarParticipante(dispositivo_id, nombre);
        const participanteId = participanteResult.rows[0].id;
        console.log('Participante registrado con ID:', participanteId);
        
        // Guardar respuestas con ID del participante
        console.log('Guardando respuestas...');
        await db.saveRespuestasFuncionarios(req.body, participanteId);
        console.log('Respuestas guardadas correctamente');
        
        res.redirect('/evaluacion/administrativo');
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

// Mostrar formulario administrativo
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
            res.status(500).send('Error al cargar el formulario');
        }
    }
);

// Guardar respuestas administrativas
router.post('/administrativo', async (req, res) => {
    try {
        const { nombre, dispositivo_id } = req.body;
        
        // Registrar participante (si no se registró en la primera parte)
        const participanteResult = await db.registrarParticipante(dispositivo_id, nombre);
        const participanteId = participanteResult.rows[0].id;
        
        // Guardar respuestas con ID del participante
        await db.saveRespuestasAdministrativas(req.body, participanteId);
        
        res.redirect('/resultados');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al guardar respuestas');
    }
});

module.exports = router;
