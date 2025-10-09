// routes/index.js - VERSION COMPLETA CON ESTADÍSTICAS
const express = require('express');
const router = express.Router();
const db = require('../db/queries');

router.get('/', async (req, res) => {
    try {
        console.log('📊 Cargando página principal con estadísticas...');
        
        // Obtener todas las estadísticas
        const [
            totalRespuestasFuncionarios,
            totalRespuestasAdministrativas,
            totalParticipantes,
            participantesFuncionarios,
            participantesAdministrativas,
            totalVisitas
        ] = await Promise.all([
            db.getTotalRespuestasFuncionarios(),
            db.getTotalRespuestasAdministrativas(),
            db.getTotalParticipantes(),
            db.getParticipantesConRespuestasFuncionarios(),
            db.getParticipantesConRespuestasAdministrativas(),
            db.getTotalVisitas()
        ]);
        
        // Calcular porcentajes para las barras de progreso
        const porcentajeFuncionarios = totalParticipantes > 0 ? 
            Math.round((participantesFuncionarios / totalParticipantes) * 100) : 0;
        const porcentajeAdministrativas = totalParticipantes > 0 ? 
            Math.round((participantesAdministrativas / totalParticipantes) * 100) : 0;
        
        console.log('✅ Estadísticas cargadas:', {
            respuestasFuncionarios: totalRespuestasFuncionarios,
            respuestasAdministrativas: totalRespuestasAdministrativas,
            participantes: totalParticipantes,
            participantesFuncionarios,
            participantesAdministrativas,
            visitas: totalVisitas,
            porcentajeFuncionarios,
            porcentajeAdministrativas
        });
        
        res.render('index', {
            estadisticas: {
                respuestasFuncionarios: totalRespuestasFuncionarios,
                respuestasAdministrativas: totalRespuestasAdministrativas,
                totalParticipantes: totalParticipantes,
                participantesFuncionarios: participantesFuncionarios,
                participantesAdministrativas: participantesAdministrativas,
                totalVisitas: totalVisitas,
                porcentajeFuncionarios: porcentajeFuncionarios,
                porcentajeAdministrativas: porcentajeAdministrativas
            }
        });
    } catch (error) {
        console.error('❌ Error al cargar estadísticas para página principal:', error);
        // En caso de error, renderizar sin estadísticas
        res.render('index', {
            estadisticas: null
        });
    }
});

module.exports = router;