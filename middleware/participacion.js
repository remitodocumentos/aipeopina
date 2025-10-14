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
                
                // Determinar tipo de formulario basado en la ruta
                let tipoFormulario = 'general';
                if (req.path.includes('/funcionarios')) {
                    tipoFormulario = 'funcionarios';
                } else if (req.path.includes('/administrativo')) {
                    tipoFormulario = 'administrativas';
                }
                
                console.log('Tipo de formulario:', tipoFormulario);
                
                // Verificar si ya existe un participante con este dispositivo_id
                const participanteResult = await db.query(
                    'SELECT id FROM participantes WHERE dispositivo_id = $1', 
                    [dispositivoId]
                );
                
                if (participanteResult.rows.length > 0) {
                    const participanteId = participanteResult.rows[0].id;
                    
                    // VERIFICACIÓN ESPECÍFICA POR TIPO DE FORMULARIO
                    if (tipoFormulario === 'funcionarios') {
                        const respuestasFunc = await db.query(
                            'SELECT COUNT(*) as count FROM respuestas_funcionarios WHERE participante_id = $1',
                            [participanteId]
                        );
                        
                        const totalRespuestasFunc = parseInt(respuestasFunc.rows[0].count);
                        console.log(`Respuestas de funcionarios existentes: ${totalRespuestasFunc}`);
                        
                        if (totalRespuestasFunc > 0) {
                            console.log('❌ Ya participó en funcionarios, redirigiendo...');
                            return res.redirect('/ya-participo?tipo=funcionarios');
                        }
                        
                    } else if (tipoFormulario === 'administrativas') {
                        const respuestasAdmin = await db.query(
                            'SELECT COUNT(*) as count FROM respuestas_administrativas WHERE participante_id = $1',
                            [participanteId]
                        );
                        
                        const totalRespuestasAdmin = parseInt(respuestasAdmin.rows[0].count);
                        console.log(`Respuestas administrativas existentes: ${totalRespuestasAdmin}`);
                        
                        if (totalRespuestasAdmin > 0) {
                            console.log('❌ Ya participó en administrativas, redirigiendo...');
                            return res.redirect('/ya-participo?tipo=administrativas');
                        }
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
