// Registrar participante
module.exports.registrarParticipante = async (dispositivo_id, nombre) => {
    try {
        // Verificar si ya existe
        const result = await pool.query(
            'SELECT * FROM participantes WHERE dispositivo_id = $1', 
            [dispositivo_id]
        );
        
        if (result.rows.length === 0) {
            // Insertar nuevo participante
            return await pool.query(
                'INSERT INTO participantes (dispositivo_id, nombre) VALUES ($1, $2) RETURNING id',
                [dispositivo_id, nombre || null]
            );
        } else {
            // Actualizar nombre si se proporcionó
            if (nombre) {
                await pool.query(
                    'UPDATE participantes SET nombre = $1 WHERE dispositivo_id = $2',
                    [nombre, dispositivo_id]
                );
            }
            return { rows: [{ id: result.rows[0].id }] };
        }
    } catch (error) {
        console.error('Error al registrar participante:', error);
        throw error;
    }
};

// Modificar funciones existentes para incluir participante_id
module.exports.saveRespuestasFuncionarios = async (respuestas, participanteId) => {
    const queries = Object.entries(respuestas)
        .filter(([key]) => key !== 'nombre' && key !== 'dispositivo_id')
        .map(([key, value]) => {
            const [funcionarioId, preguntaId] = key.split('-');
            return pool.query(
                'INSERT INTO respuestas_funcionarios (funcionario_id, pregunta_id, respuesta, participante_id) VALUES ($1, $2, $3, $4)',
                [funcionarioId, preguntaId, value, participanteId]
            );
        });
    await Promise.all(queries);
};

module.exports.saveRespuestasAdministrativas = async (respuestas, participanteId) => {
    const queries = Object.entries(respuestas)
        .filter(([key]) => key !== 'nombre' && key !== 'dispositivo_id')
        .map(([key, value]) => {
            const [seccionId, preguntaId] = key.split('-');
            return pool.query(
                'INSERT INTO respuestas_administrativas (seccion_id, pregunta_id, respuesta, participante_id) VALUES ($1, $2, $3, $4)',
                [seccionId, preguntaId, value, participanteId]
            );
        });
    await Promise.all(queries);
};