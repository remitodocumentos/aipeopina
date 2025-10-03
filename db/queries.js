const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Funciones para obtener datos
module.exports.getFuncionarios = async () => {
    const result = await pool.query('SELECT * FROM funcionarios ORDER BY id');
    return result.rows;
};

module.exports.getPreguntasFuncionarios = async () => {
    const result = await pool.query('SELECT * FROM preguntas_funcionarios ORDER BY categoria, id');
    return result.rows;
};

module.exports.getSeccionesAdministrativas = async () => {
    const result = await pool.query('SELECT * FROM secciones_administrativas ORDER BY id');
    return result.rows;
};

module.exports.getPreguntasAdministrativas = async () => {
    const result = await pool.query(`
        SELECT pa.*, sa.nombre AS seccion_nombre 
        FROM preguntas_administrativas pa
        JOIN secciones_administrativas sa ON pa.seccion_id = sa.id
        ORDER BY sa.id, pa.id
    `);
    return result.rows;
};

// Funciones para guardar respuestas
module.exports.saveRespuestasFuncionarios = async (respuestas) => {
    const queries = Object.entries(respuestas).map(([key, value]) => {
        const [funcionarioId, preguntaId] = key.split('-');
        return pool.query(
            'INSERT INTO respuestas_funcionarios (funcionario_id, pregunta_id, respuesta) VALUES ($1, $2, $3)',
            [funcionarioId, preguntaId, value]
        );
    });
    await Promise.all(queries);
};

module.exports.saveRespuestasAdministrativas = async (respuestas) => {
    const queries = Object.entries(respuestas).map(([key, value]) => {
        const [seccionId, preguntaId] = key.split('-');
        return pool.query(
            'INSERT INTO respuestas_administrativas (seccion_id, pregunta_id, respuesta) VALUES ($1, $2, $3)',
            [seccionId, preguntaId, value]
        );
    });
    await Promise.all(queries);
};

// Funciones para obtener resultados consolidados
module.exports.getResultadosFuncionarios = async () => {
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
};

module.exports.getResultadosAdministrativos = async () => {
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
};

// Añadir estas funciones al archivo db/queries.js

// Funciones para el panel de administración

// Funcionarios
module.exports.addFuncionario = async (nombre, cargo, seccion) => {
    await pool.query(
        'INSERT INTO funcionarios (nombre, cargo, seccion) VALUES ($1, $2, $3)',
        [nombre, cargo, seccion]
    );
};

module.exports.updateFuncionario = async (id, nombre, cargo, seccion) => {
    await pool.query(
        'UPDATE funcionarios SET nombre = $1, cargo = $2, seccion = $3 WHERE id = $4',
        [nombre, cargo, seccion, id]
    );
};

module.exports.deleteFuncionario = async (id) => {
    await pool.query('DELETE FROM funcionarios WHERE id = $1', [id]);
};

// Preguntas de funcionarios
module.exports.addPreguntaFuncionario = async (texto, categoria) => {
    await pool.query(
        'INSERT INTO preguntas_funcionarios (texto, categoria) VALUES ($1, $2)',
        [texto, categoria]
    );
};

module.exports.updatePreguntaFuncionario = async (id, texto, categoria) => {
    await pool.query(
        'UPDATE preguntas_funcionarios SET texto = $1, categoria = $2 WHERE id = $3',
        [texto, categoria, id]
    );
};

module.exports.deletePreguntaFuncionario = async (id) => {
    await pool.query('DELETE FROM preguntas_funcionarios WHERE id = $1', [id]);
};

// Preguntas administrativas
module.exports.addPreguntaAdministrativa = async (texto, seccion_id) => {
    await pool.query(
        'INSERT INTO preguntas_administrativas (texto, seccion_id) VALUES ($1, $2)',
        [texto, seccion_id]
    );
};

module.exports.updatePreguntaAdministrativa = async (id, texto, seccion_id) => {
    await pool.query(
        'UPDATE preguntas_administrativas SET texto = $1, seccion_id = $2 WHERE id = $3',
        [texto, seccion_id, id]
    );
};

module.exports.deletePreguntaAdministrativa = async (id) => {
    await pool.query('DELETE FROM preguntas_administrativas WHERE id = $1', [id]);
};

// Secciones administrativas
module.exports.addSeccionAdministrativa = async (nombre) => {
    await pool.query(
        'INSERT INTO secciones_administrativas (nombre) VALUES ($1)',
        [nombre]
    );
};

module.exports.updateSeccionAdministrativa = async (id, nombre) => {
    await pool.query(
        'UPDATE secciones_administrativas SET nombre = $1 WHERE id = $2',
        [nombre, id]
    );
};

module.exports.deleteSeccionAdministrativa = async (id) => {
    await pool.query('DELETE FROM secciones_administrativas WHERE id = $1', [id]);
};

// Estadísticas para el dashboard
module.exports.getTotalRespuestasFuncionarios = async () => {
    const result = await pool.query('SELECT COUNT(*) FROM respuestas_funcionarios');
    return parseInt(result.rows[0].count);
};

module.exports.getTotalRespuestasAdministrativas = async () => {
    const result = await pool.query('SELECT COUNT(*) FROM respuestas_administrativas');
    return parseInt(result.rows[0].count);
};