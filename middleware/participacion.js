const { v4: uuidv4 } = require('uuid');

module.exports = {
    // Middleware para verificar si el dispositivo ya ha participado
    verificarParticipacion: async (req, res, next) => {
        try {
            // Verificar si ya existe una cookie de participación
            if (req.cookies.participacion_id) {
                const dispositivoId = req.cookies.participacion_id;
                
                // Verificar en la base de datos
                const result = await req.db.query(
                    'SELECT * FROM participantes WHERE dispositivo_id = $1', 
                    [dispositivoId]
                );
                
                if (result.rows.length > 0) {
                    // Ya ha participado, redirigir a página de ya participó
                    return res.redirect('/ya-participo');
                }
            }
            
            // No ha participado, continuar
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