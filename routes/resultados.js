//routes/resultados.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');

// Ruta única para TODOS los resultados
router.get('/:tipo?', async (req, res) => {
    try {
        const tipo = req.params.tipo || 'general';
        
        console.log(`=== CARGANDO RESULTADOS TIPO: ${tipo} ===`);
        
        // Obtener datos AGRUPADOS POR PARTICIPANTE
        let participantes = [];
        let resultadosPorParticipante = {
            funcionarios: {},
            administrativas: {}
        };
        
        try {
            // Obtener lista de participantes únicos
            participantes = await db.getParticipantesUnicos();
            console.log(`✅ Participantes únicos: ${participantes.length}`);
            
            // Obtener resultados de funcionarios agrupados
            const resultadosFunc = await db.getResultadosFuncionariosPorParticipante();
            console.log(`✅ Respuestas funcionarios: ${resultadosFunc.length}`);
            
            // Obtener resultados administrativos agrupados
            const resultadosAdmin = await db.getResultadosAdministrativosPorParticipante();
            console.log(`✅ Respuestas administrativas: ${resultadosAdmin.length}`);
            
            // Organizar resultados por participante
            resultadosFunc.forEach(resultado => {
                const participanteId = resultado.participante_id;
                if (!resultadosPorParticipante.funcionarios[participanteId]) {
                    resultadosPorParticipante.funcionarios[participanteId] = [];
                }
                resultadosPorParticipante.funcionarios[participanteId].push(resultado);
            });
            
            resultadosAdmin.forEach(resultado => {
                const participanteId = resultado.participante_id;
                if (!resultadosPorParticipante.administrativas[participanteId]) {
                    resultadosPorParticipante.administrativas[participanteId] = [];
                }
                resultadosPorParticipante.administrativas[participanteId].push(resultado);
            });
            
        } catch (error) {
            console.error('Error cargando resultados:', error);
        }
        
        // Determinar si mostrar mensaje de "sin datos"
        const mensaje = participantes.length === 0 
            ? 'Aún no hay resultados disponibles. Sé el primero en participar.'
            : null;
        
        // Renderizar plantilla
        res.render('resultados', {
            tipoVista: tipo,
            participantes,
            resultadosPorParticipante,
            mensaje
        });
        
    } catch (error) {
        console.error('❌ ERROR al cargar resultados:', error);
        res.status(500).render('error', {
            message: 'Error al cargar los resultados',
            error: process.env.NODE_ENV === 'production' ? {} : error
        });
    }
});

module.exports = router;