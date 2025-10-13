// middleware/participacion.js
// middleware/participacion.js
const { v4: uuidv4 } = require('uuid');
const db = require('../db/queries');

module.exports = {
    // Middleware para verificar si el dispositivo ya ha participado COMPLETAMENTE
    verificarParticipacion: async (req, res, next) => {
        try {
            // Solo verificar para rutas de evaluación
            if (req.path.startsWith('/evaluacion/') && !req.path.includes('/resultados')) {
                const dispositivoId = req.cookies.participacion_id;
                
                if (dispositivoId) {
                    console.log('=== VERIFICANDO PARTICIPACIÓN ===');
                    console.log('Dispositivo ID:', dispositivoId);
                    
                    // Verificar si ya existe un participante con este dispositivo_id
                    const participanteResult = await db.query(
                        'SELECT id FROM participantes WHERE dispositivo_id = $1', 
                        [dispositivoId]
                    );
                    
                    if (participanteResult.rows.length > 0) {
                        const participanteId = participanteResult.rows[0].id;
                        
                        // Verificar si ya hay respuestas guardadas (CUALQUIER respuesta)
                        const respuestasFuncionarios = await db.query(
                            'SELECT COUNT(*) as count FROM respuestas_funcionarios WHERE participante_id = $1',
                            [participanteId]
                        );
                        
                        const respuestasAdministrativas = await db.query(
                            'SELECT COUNT(*) as count FROM respuestas_administrativas WHERE participante_id = $1',
                            [participanteId]
                        );
                        
                        const totalRespuestas = 
                            parseInt(respuestasFuncionarios.rows[0].count) + 
                            parseInt(respuestasAdministrativas.rows[0].count);
                        
                        console.log(`Total respuestas encontradas: ${totalRespuestas}`);
                        
                        // Si tiene ALGUNA respuesta, redirigir a "ya participó"
                        if (totalRespuestas > 0) {
                            console.log('❌ Dispositivo ya participó, redirigiendo...');
                            return res.redirect('/ya-participo?tipo=general');
                        }
                    }
                }
            }
            
            // No ha participado o está accediendo a resultados, continuar
            next();
        } catch (error) {
            console.error('Error al verificar participación:', error);
            // En caso de error, permitir continuar (mejor que bloquear)
            next();
        }
    },
    
    // Middleware para generar identificador de dispositivo
    generarDispositivoId: (req, res, next) => {
        if (!req.cookies.participacion_id) {
            const dispositivoId = uuidv4();
            res.cookie('participacion_id', dispositivoId, { 
                maxAge: 365 * 24 * 60 * 60 * 1000, // 1 año
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
            req.dispositivoId = dispositivoId;
            console.log('✅ Nuevo dispositivo ID generado:', dispositivoId);
        } else {
            req.dispositivoId = req.cookies.participacion_id;
            console.log('✅ Dispositivo ID existente:', req.dispositivoId);
        }
        next();
    }
};
