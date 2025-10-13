//routes/resultados.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');

// Ruta única para TODOS los resultados (CONSOLIDADO)
router.get('/:tipo?', async (req, res) => {
    try {
        const tipo = req.params.tipo || 'general';
        
        console.log(`=== CARGANDO RESULTADOS CONSOLIDADOS: ${tipo} ===`);
        
        let resultadosFuncionarios = [];
        let resultadosAdministrativos = [];
        let errorCarga = null;
        
        try {
            resultadosFuncionarios = await db.getResultadosFuncionarios();
            console.log(`✅ Resultados funcionarios: ${resultadosFuncionarios ? resultadosFuncionarios.length : 0} registros`);
        } catch (error) {
            console.error('❌ Error cargando resultados de funcionarios:', error.message);
            errorCarga = 'Error al cargar resultados de funcionarios';
        }
        
        try {
            resultadosAdministrativos = await db.getResultadosAdministrativos();
            console.log(`✅ Resultados administrativos: ${resultadosAdministrativos ? resultadosAdministrativos.length : 0} registros`);
        } catch (error) {
            console.error('❌ Error cargando resultados administrativos:', error.message);
            errorCarga = errorCarga ? errorCarga + ' y administrativos' : 'Error al cargar resultados administrativos';
        }
        
        // Si no hay datos de ningún tipo, mostrar mensaje amigable
        if ((!resultadosFuncionarios || resultadosFuncionarios.length === 0) && (!resultadosAdministrativos || resultadosAdministrativos.length === 0)) {
            console.log('ℹ️ No hay datos de resultados disponibles aún');
            return res.render('resultados', {
                resultadosFuncionarios: [],
                resultadosAdministrativos: [],
                mensaje: 'Aún no hay resultados disponibles. Sé el primero en participar.',
                tipoVista: tipo,
                error: errorCarga
            });
        }
        
        res.render('resultados', { 
            resultadosFuncionarios: resultadosFuncionarios || [], 
            resultadosAdministrativos: resultadosAdministrativos || [],
            mensaje: null,
            tipoVista: tipo,
            error: errorCarga
            // 👆 NO incluir 'participantes' aquí - eso es para otra vista
        });
        
    } catch (error) {
        console.error('❌ ERROR CRÍTICO AL CARGAR RESULTADOS:', error);
        res.status(500).render('error', {
            message: 'Error al cargar los resultados',
            details: error.message,
            error: process.env.NODE_ENV === 'production' ? {} : error
        });
    }
});

module.exports = router;