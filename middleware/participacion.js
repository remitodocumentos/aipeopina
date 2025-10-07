// middleware/participacion.js
const { v4: uuidv4 } = require('uuid');

module.exports = {
    // Middleware para verificar si el dispositivo ya ha participado
    verificarParticipacion: async (req, res, next) => {
        try {
            // Solo verificar para rutas de evaluación, no para resultados
            if (req.path.startsWith('/evaluacion/') && !req.path.includes('/resultados')) {
                // Verificar si ya existe una cookie de participación
                if (req.cookies.participacion_id) {
                    const dispositivoId = req.cookies.participacion_id;
                    
                    // Verificar en la base de datos
                    const result = await req.db.query(
                        'SELECT * FROM participantes WHERE dispositivo_id = $1', 
                        [dispositivoId]
                    );
                    
                    if (result.rows.length > 0) {
                        // Verificar si ya hay respuestas guardadas
                        const respuestasFuncionarios = await req.db.query(
                            'SELECT COUNT(*) FROM respuestas_funcionarios WHERE participante_id = $1',
                            [result.rows[0].id]
                        );
                        
                        const respuestasAdministrativas = await req.db.query(
                            'SELECT COUNT(*) FROM respuestas_administrativas WHERE participante_id = $1',
                            [result.rows[0].id]
                        );
                        
                        if (respuestasFuncionarios.rows[0].count > 0 || respuestasAdministrativas.rows[0].count > 0) {
                            // Ya ha participado completamente, redirigir a página de ya participó
                            return res.redirect('/ya-participo');
                        }
                    }
                }
            }
            
            // No ha participado o está accediendo a resultados, continuar
            next();
        } catch (error) {
            console.error('Error al verificar participación:', error);
            next();
        }
    },
    
    // Middleware para generar identificador de dispositivo
    generarDispositivoId: (req, res, next) => {
        if (!req.cookies.participacion_id) {
            const dispositivoId = uuidv4();
            res.cookie('participacion_id', dispositivoId, { 
                maxAge: 365 * 24 * 60 * 60 * 1000, // 1 año
                httpOnly: true 
            });
            req.dispositivoId = dispositivoId;
        } else {
            req.dispositivoId = req.cookies.participacion_id;
        }
        next();
    }
};
