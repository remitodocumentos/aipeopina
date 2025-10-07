// middleware/participacion.js
const { v4: uuidv4 } = require('uuid');
const db = require('../db/queries'); // 👈 AGREGAR ESTA LÍNEA

module.exports = {
    verificarParticipacion: async (req, res, next) => {
        try {
            if (req.path.startsWith('/evaluacion/') && !req.path.includes('/resultados')) {
                if (req.cookies.participacion_id) {
                    const dispositivoId = req.cookies.participacion_id;
                    
                    const result = await db.query(
                        'SELECT * FROM participantes WHERE dispositivo_id = $1', 
                        [dispositivoId]
                    );
                    
                    if (result.rows.length > 0) {
                        const respuestasFuncionarios = await db.query(
                            'SELECT COUNT(*) FROM respuestas_funcionarios WHERE participante_id = $1',
                            [result.rows[0].id]
                        );
                        
                        const respuestasAdministrativas = await db.query(
                            'SELECT COUNT(*) FROM respuestas_administrativas WHERE participante_id = $1',
                            [result.rows[0].id]
                        );
                        
                        if (respuestasFuncionarios.rows[0].count > 0 || respuestasAdministrativas.rows[0].count > 0) {
                            return res.redirect('/ya-participo');
                        }
                    }
                }
            }
            next();
        } catch (error) {
            console.error('Error al verificar participación:', error);
            next();
        }
    },
    
    generarDispositivoId: (req, res, next) => {
        if (!req.cookies.participacion_id) {
            const dispositivoId = uuidv4();
            res.cookie('participacion_id', dispositivoId, { 
                maxAge: 365 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
            req.dispositivoId = dispositivoId;
        } else {
            req.dispositivoId = req.cookies.participacion_id;
        }
        next();
    }
};