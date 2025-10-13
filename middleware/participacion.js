// middleware/participacion.js
// middleware/participacion.js
const { v4: uuidv4 } = require('uuid');
const db = require('../db/queries');

module.exports = {
    // Middleware para verificar participación POR TIPO de evaluación
    verificarParticipacion: async (req, res, next) => {
        try {
            // Solo verificar para rutas de evaluación específicas
            if (req.path.startsWith('/evaluacion/') && !req.path.includes('/resultados')) {
                const dispositivoId = req.cookies.participacion_id;
                
                if (dispositivoId) {
                    console.log('=== VERIFICANDO PARTICIPACIÓN ===');
                    console.log('Dispositivo ID:', dispositivoId);
                    console.log('Ruta solicitada:', req.path);
                    
                    // Verificar si ya existe un participante con este dispositivo_id
                    const participanteResult = await db.query(
                        'SELECT id FROM participantes WHERE dispositivo_id = $1', 
                        [dispositivoId]
                    );
                    
                    if (participanteResult.rows.length > 0) {
                        const participanteId = participanteResult.rows[0].id;
                        
                        // DETERMINAR QUÉ TIPO DE EVALUACIÓN SE ESTÁ INTENTANDO ACCEDER
                        let tipoEvaluacion = '';
                        if (req.path.includes('/funcionarios') || req.path === '/evaluacion/funcionarios') {
                            tipoEvaluacion = 'funcionarios';
                        } else if (req.path.includes('/administrativo') || req.path === '/evaluacion/administrativo') {
                            tipoEvaluacion = 'administrativas';
                        }
                        
                        console.log('Tipo de evaluación detectado:', tipoEvaluacion);
                        
                        // VERIFICAR SEGÚN EL TIPO DE EVALUACIÓN
                        if (tipoEvaluacion === 'funcionarios') {
                            const respuestasFuncionarios = await db.query(
                                'SELECT COUNT(*) as count FROM respuestas_funcionarios WHERE participante_id = $1',
                                [participanteId]
                            );
                            
                            const tieneRespuestasFuncionarios = parseInt(respuestasFuncionarios.rows[0].count) > 0;
                            console.log('Tiene respuestas funcionarios:', tieneRespuestasFuncionarios);
                            
                            if (tieneRespuestasFuncionarios) {
                                console.log('❌ Ya completó evaluación de funcionarios, redirigiendo...');
                                return res.redirect('/ya-participo?tipo=funcionarios');
                            }
                            
                        } else if (tipoEvaluacion === 'administrativas') {
                            const respuestasAdministrativas = await db.query(
                                'SELECT COUNT(*) as count FROM respuestas_administrativas WHERE participante_id = $1',
                                [participanteId]
                            );
                            
                            const tieneRespuestasAdministrativas = parseInt(respuestasAdministrativas.rows[0].count) > 0;
                            console.log('Tiene respuestas administrativas:', tieneRespuestasAdministrativas);
                            
                            if (tieneRespuestasAdministrativas) {
                                console.log('❌ Ya completó evaluación administrativa, redirigiendo...');
                                return res.redirect('/ya-participo?tipo=administrativas');
                            }
                            
                            // Para evaluación administrativa, también verificar si completó funcionarios primero
                            const respuestasFuncionarios = await db.query(
                                'SELECT COUNT(*) as count FROM respuestas_funcionarios WHERE participante_id = $1',
                                [participanteId]
                            );
                            
                            const tieneRespuestasFuncionarios = parseInt(respuestasFuncionarios.rows[0].count) > 0;
                            
                            if (!tieneRespuestasFuncionarios) {
                                console.log('⚠️  Intenta acceder a administrativa sin completar funcionarios, redirigiendo...');
                                return res.redirect('/evaluacion/funcionarios');
                            }
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

    // Middleware para verificación en envío de formularios
    verificarAntesDeGuardar: async (req, res, next) => {
        try {
            const dispositivoId = req.cookies.participacion_id;
            
            if (!dispositivoId) {
                return res.redirect('/evaluacion/funcionarios');
            }
            
            const participanteResult = await db.query(
                'SELECT id FROM participantes WHERE dispositivo_id = $1', 
                [dispositivoId]
            );
            
            if (participanteResult.rows.length === 0) {
                return next(); // No existe participante, puede continuar
            }
            
            const participanteId = participanteResult.rows[0].id;
            
            // Verificar según el tipo de formulario que se está enviando
            if (req.path.includes('/funcionarios') || req.body.tipo === 'funcionarios') {
                const respuestasExistente = await db.query(
                    'SELECT COUNT(*) as count FROM respuestas_funcionarios WHERE participante_id = $1',
                    [participanteId]
                );
                
                if (parseInt(respuestasExistente.rows[0].count) > 0) {
                    console.log('❌ Intento de reenvío de formulario funcionarios');
                    return res.redirect('/ya-participo?tipo=funcionarios');
                }
                
            } else if (req.path.includes('/administrativo') || req.body.tipo === 'administrativas') {
                const respuestasExistente = await db.query(
                    'SELECT COUNT(*) as count FROM respuestas_administrativas WHERE participante_id = $1',
                    [participanteId]
                );
                
                if (parseInt(respuestasExistente.rows[0].count) > 0) {
                    console.log('❌ Intento de reenvío de formulario administrativas');
                    return res.redirect('/ya-participo?tipo=administrativas');
                }
            }
            
            next();
        } catch (error) {
            console.error('Error en verificación antes de guardar:', error);
            next();
        }
    },
    
    // Middleware para generar identificador de dispositivo (sin cambios)
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