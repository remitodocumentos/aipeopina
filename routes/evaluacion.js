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
router.post('/funcionarios', async (req, res) => {
    try {
        const { nombre, dispositivo_id } = req.body;
        
        // Registrar participante
        const participanteResult = await db.registrarParticipante(dispositivo_id, nombre);
        const participanteId = participanteResult.rows[0].id;
        
        // Guardar respuestas con ID del participante
        await db.saveRespuestasFuncionarios(req.body, participanteId);
        
        res.redirect('/evaluacion/administrativo');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al guardar respuestas');
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
