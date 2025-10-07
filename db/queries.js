const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Función para registrar un participante
module.exports.registrarParticipante = async (dispositivo_id, nombre) => {
    try {
        console.log('=== DEBUG REGISTRAR PARTICIPANTE ===');
        console.log('Dispositivo ID:', dispositivo_id);
        console.log('Nombre:', nombre);
        
        // Validar que dispositivo_id no sea nulo o vacío
        if (!dispositivo_id || dispositivo_id.trim() === '') {
            throw new Error('El ID del dispositivo es requerido');
        }
        
        // Verificar si ya existe un participante con ese dispositivo_id
        const existente = await pool.query(
            'SELECT * FROM participantes WHERE dispositivo_id = $1',
            [dispositivo_id]
        );
        
        if (existente.rows.length > 0) {
            console.log('Participante ya existe, actualizando nombre...');
            // Actualizar el nombre si se proporcionó
            if (nombre && nombre.trim() !== '') {
                await pool.query(
                    'UPDATE participantes SET nombre = $1 WHERE dispositivo_id = $2',
                    [nombre, dispositivo_id]
                );
            }
            return existente;
        } else {
            console.log('Insertando nuevo participante...');
            // Insertar nuevo participante
            const result = await pool.query(
                'INSERT INTO participantes (dispositivo_id, nombre) VALUES ($1, $2) RETURNING id',
                [dispositivo_id, nombre && nombre.trim() !== '' ? nombre : null]
            );
            return result;
        }
    } catch (error) {
        console.error('Error en registrarParticipante:', error);
        throw error;
    }
};

// Función para guardar respuestas de funcionarios
module.exports.saveRespuestasFuncionarios = async (respuestas, participanteId) => {
    try {
        console.log('=== DEBUG SAVE RESPUESTAS FUNCIONARIOS ===');
        console.log('Participante ID:', participanteId);
        
        // Filtrar solo las respuestas (excluir nombre y dispositivo_id)
        const respuestasFiltradas = Object.entries(respuestas)
            .filter(([key]) => key !== 'nombre' && key !== 'dispositivo_id' && key !== 'tipo_participacion');
        
        console.log('Respuestas a guardar:', respuestasFiltradas);
        
        const queries = respuestasFiltradas.map(([key, value]) => {
            // Verificar que la clave tenga el formato esperado
            if (!key.includes('-')) {
                console.warn(`Formato de clave inválido: ${key}`);
                return null;
            }
            
            const [funcionarioId, preguntaId] = key.split('-');
            
            // Verificar que los IDs sean números válidos
            if (isNaN(funcionarioId) || isNaN(preguntaId)) {
                console.warn(`IDs inválidos en clave: ${key}`);
                return null;
            }
            
            console.log(`Guardando respuesta: funcionario=${funcionarioId}, pregunta=${preguntaId}, respuesta=${value}`);
            
            return pool.query(
                'INSERT INTO respuestas_funcionarios (funcionario_id, pregunta_id, respuesta, participante_id) VALUES ($1, $2, $3, $4)',
                [funcionarioId, preguntaId, value, participanteId]
            );
        }).filter(query => query !== null); // Filtrar consultas nulas
        
        console.log(`Ejecutando ${queries.length} consultas...`);
        
        // Ejecutar las consultas en secuencia para mejor manejo de errores
        for (const query of queries) {
            try {
                await query;
            } catch (error) {
                console.error('Error al ejecutar consulta:', error);
                throw error;
            }
        }
        
        console.log('Todas las respuestas guardadas correctamente');
    } catch (error) {
        console.error('Error en saveRespuestasFuncionarios:', error);
        throw error;
    }
};

// Función para guardar respuestas administrativas
module.exports.saveRespuestasAdministrativas = async (respuestas, participanteId) => {
    try {
        console.log('=== DEBUG SAVE RESPUESTAS ADMINISTRATIVAS ===');
        console.log('Participante ID:', participanteId);
        
        // Filtrar solo las respuestas (excluir nombre y dispositivo_id)
        const respuestasFiltradas = Object.entries(respuestas)
            .filter(([key]) => key !== 'nombre' && key !== 'dispositivo_id' && key !== 'tipo_participacion');
        
        console.log('Respuestas a guardar:', respuestasFiltradas);
        
        const queries = respuestasFiltradas.map(([key, value]) => {
            // Verificar que la clave tenga el formato esperado
            if (!key.includes('-')) {
                console.warn(`Formato de clave inválido: ${key}`);
                return null;
            }
            
            const [seccionId, preguntaId] = key.split('-');
            
            // Verificar que los IDs sean números válidos
            if (isNaN(seccionId) || isNaN(preguntaId)) {
                console.warn(`IDs inválidos en clave: ${key}`);
                return null;
            }
            
            console.log(`Guardando respuesta: seccion=${seccionId}, pregunta=${preguntaId}, respuesta=${value}`);
            
            return pool.query(
                'INSERT INTO respuestas_administrativas (seccion_id, pregunta_id, respuesta, participante_id) VALUES ($1, $2, $3, $4)',
                [seccionId, preguntaId, value, participanteId]
            );
        }).filter(query => query !== null); // Filtrar consultas nulas
        
        console.log(`Ejecutando ${queries.length} consultas...`);
        
        // Ejecutar las consultas en secuencia para mejor manejo de errores
        for (const query of queries) {
            try {
                await query;
            } catch (error) {
                console.error('Error al ejecutar consulta:', error);
                throw error;
            }
        }
        
        console.log('Todas las respuestas guardadas correctamente');
    } catch (error) {
        console.error('Error en saveRespuestasAdministrativas:', error);
        throw error;
    }
};

// Función para obtener funcionarios
module.exports.getFuncionarios = async () => {
    const result = await pool.query('SELECT * FROM funcionarios ORDER BY id');
    return result.rows;
};

// Función para obtener preguntas de funcionarios
module.exports.getPreguntasFuncionarios = async () => {
    const result = await pool.query('SELECT * FROM preguntas_funcionarios ORDER BY id ASC');
    return result.rows;
};

// Función para obtener secciones administrativas
module.exports.getSeccionesAdministrativas = async () => {
    const result = await pool.query('SELECT * FROM secciones_administrativas ORDER BY id');
    return result.rows;
};

// Función para obtener preguntas administrativas
module.exports.getPreguntasAdministrativas = async () => {
    const result = await pool.query(`
        SELECT pa.*, sa.nombre AS seccion_nombre 
        FROM preguntas_administrativas pa
        JOIN secciones_administrativas sa ON pa.seccion_id = sa.id
        ORDER BY sa.id, pa.id
    `);
    return result.rows;
};

// Función para obtener estadísticas
module.exports.getTotalRespuestasFuncionarios = async () => {
    const result = await pool.query('SELECT COUNT(*) FROM respuestas_funcionarios');
    return parseInt(result.rows[0].count);
};

module.exports.getTotalRespuestasAdministrativas = async () => {
    const result = await pool.query('SELECT COUNT(*) FROM respuestas_administrativas');
    return parseInt(result.rows[0].count);
};

// Función para agregar funcionario
module.exports.addFuncionario = async (nombre, cargo, seccion) => {
    await pool.query(
        'INSERT INTO funcionarios (nombre, cargo, seccion) VALUES ($1, $2, $3)',
        [nombre, cargo, seccion]
    );
};

// Función para actualizar funcionario
module.exports.updateFuncionario = async (id, nombre, cargo, seccion) => {
    await pool.query(
        'UPDATE funcionarios SET nombre = $1, cargo = $2, seccion = $3 WHERE id = $4',
        [nombre, cargo, seccion, id]
    );
};

// Función para eliminar funcionario
module.exports.deleteFuncionario = async (id) => {
    await pool.query('DELETE FROM funcionarios WHERE id = $1', [id]);
};

// Función para agregar pregunta de funcionario
module.exports.addPreguntaFuncionario = async (texto, categoria) => {
    await pool.query(
        'INSERT INTO preguntas_funcionarios (texto, categoria) VALUES ($1, $2)',
        [texto, categoria]
    );
};

// Función para actualizar pregunta de funcionario
module.exports.updatePreguntaFuncionario = async (id, texto, categoria) => {
    await pool.query(
        'UPDATE preguntas_funcionarios SET texto = $1, categoria = $2 WHERE id = $3',
        [texto, categoria, id]
    );
};

// Función para eliminar pregunta de funcionario
module.exports.deletePreguntaFuncionario = async (id) => {
    await pool.query('DELETE FROM preguntas_funcionarios WHERE id = $1', [id]);
};

// Función para agregar pregunta administrativa
module.exports.addPreguntaAdministrativa = async (texto, seccion_id) => {
    await pool.query(
        'INSERT INTO preguntas_administrativas (texto, seccion_id) VALUES ($1, $2)',
        [texto, seccion_id]
    );
};

// Función para actualizar pregunta administrativa
module.exports.updatePreguntaAdministrativa = async (id, texto, seccion_id) => {
    await pool.query(
        'UPDATE preguntas_administrativas SET texto = $1, seccion_id = $2 WHERE id = $3',
        [texto, seccion_id, id]
    );
};

// Función para eliminar pregunta administrativa
module.exports.deletePreguntaAdministrativa = async (id) => {
    await pool.query('DELETE FROM preguntas_administrativas WHERE id = $1', [id]);
};

// Función para agregar sección administrativa
module.exports.addSeccionAdministrativa = async (nombre) => {
    await pool.query(
        'INSERT INTO secciones_administrativas (nombre) VALUES ($1)',
        [nombre]
    );
};

// Función para actualizar sección administrativa
module.exports.updateSeccionAdministrativa = async (id, nombre) => {
    await pool.query(
        'UPDATE secciones_administrativas SET nombre = $1 WHERE id = $2',
        [nombre, id]
    );
};

// Función para eliminar sección administrativa
module.exports.deleteSeccionAdministrativa = async (id) => {
    await pool.query('DELETE FROM secciones_administrativas WHERE id = $1', [id]);
};


// Función para obtener resultados de funcionarios
module.exports.getResultadosFuncionarios = async () => {
    try {
        const result = await pool.query(`
            SELECT 
                f.id AS funcionario_id,
                f.nombre AS funcionario_nombre,
                f.cargo,
                pf.id AS pregunta_id,
                pf.texto AS pregunta_texto,
                rf.respuesta,
                COUNT(rf.id) AS cantidad
            FROM respuestas_funcionarios rf
            JOIN funcionarios f ON rf.funcionario_id = f.id
            JOIN preguntas_funcionarios pf ON rf.pregunta_id = pf.id
            GROUP BY f.id, f.nombre, f.cargo, pf.id, pf.texto, rf.respuesta
            ORDER BY f.id, pf.id, rf.respuesta
        `);
        return result.rows;
    } catch (error) {
        console.error('Error en getResultadosFuncionarios:', error);
        throw error;
    }
};

// Función para obtener resultados administrativos
module.exports.getResultadosAdministrativos = async () => {
    try {
        const result = await pool.query(`
            SELECT 
                sa.id AS seccion_id,
                sa.nombre AS seccion_nombre,
                pa.id AS pregunta_id,
                pa.texto AS pregunta_texto,
                ra.respuesta,
                COUNT(ra.id) AS cantidad
            FROM respuestas_administrativas ra
            JOIN secciones_administrativas sa ON ra.seccion_id = sa.id
            JOIN preguntas_administrativas pa ON ra.pregunta_id = pa.id
            GROUP BY sa.id, sa.nombre, pa.id, pa.texto, ra.respuesta
            ORDER BY sa.id, pa.id, ra.respuesta
        `);
        return result.rows;
    } catch (error) {
        console.error('Error en getResultadosAdministrativos:', error);
        throw error;
    }
};