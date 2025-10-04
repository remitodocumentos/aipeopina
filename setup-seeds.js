const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runQuery(query) {
    try {
        await pool.query(query);
        console.log('✅ Consulta ejecutada correctamente');
    } catch (error) {
        console.error('❌ Error en la consulta:', error);
        throw error;
    }
}

async function setupSeeds() {
    try {
        console.log('Iniciando inserción de datos...');
        
        // Funcionarios
        await runQuery(`
            INSERT INTO funcionarios (nombre, cargo, seccion) VALUES 
            ('Luis Angel Ramirez Vargas', 'Alcalde', 'Despacho del alcalde'),
            ('Jairo Garzón Conde', 'Secretario', 'Secretaria general y de gobierno'),
            ('Alfredo Charry Medina', 'Secretario', 'Secretaria de hacienda'),
            ('Maria Perez Diaz', 'Secretario', 'Secretaria de protección social'),
            ('Alexander Pulecio Charry', 'Secretario', 'Secretaria de planeación'),
            ('Marlene casallas Martin', 'Secretario', 'Secretaria de infraestructura'),
            ('Javier Charry bonilla', 'Secretario', 'Secretaria de desarrollo económico'),
            ('Ximena martin Charry', 'Secretario', 'Secretaria de tránsito'),
            ('Joan Orlando Garay Diaz', 'Inspector', 'Inspección de policía'),
            ('Helenohora Llanos Diaz', 'Comisaria', 'Comisaria de familia');
        `);
        
        // Preguntas para funcionarios
        await runQuery(`
            INSERT INTO preguntas_funcionarios (texto, categoria) VALUES 
            ('Integridad y ética', 'Personal'),
            ('Respeto, dignidad y decoro', 'Personal'),
            ('Aptitud y honestidad', 'Personal'),
            ('Veracidad y cumplimiento', 'Personal'),
            ('Comunicación y empatía', 'Personal'),
            ('Liderazgo y gestión de equipos', 'Profesional'),
            ('Capacidad para resolver problemas', 'Profesional'),
            ('Transparencia y eficiencia en la toma de decisiones', 'Profesional'),
            ('Eficiencia en la gestión de los recursos', 'Desempeño'),
            ('Cumplimiento de metas', 'Desempeño'),
            ('Proyectos estratégicos con resultados concretos', 'Desempeño'),
            ('Ejercicio adecuado del cargo', 'Desempeño'),
            ('Uso adecuado del tiempo de trabajo', 'Desempeño');
        `);
        
        // Secciones administrativas
        await runQuery(`
            INSERT INTO secciones_administrativas (nombre) VALUES 
            ('Gestión y administración pública'),
            ('Infraestructura y servicios públicos'),
            ('Desarrollo urbano y territorial'),
            ('Medio ambiente y sostenibilidad'),
            ('Desarrollo social y bienestar'),
            ('Desarrollo económico y competitividad'),
            ('Calidad de vida en general'),
            ('Vulneración del bienestar social y la convivencia ciudadana');
        `);
        
        // Preguntas administrativas (sección por sección)
        await runQuery(`
            INSERT INTO preguntas_administrativas (texto, seccion_id) VALUES 
            ('Eficiencia administrativa', 1),
            ('Transparencia y rendición de cuentas', 1),
            ('Participación ciudadana', 1),
            ('Planificación estratégica', 1),
            ('Gestión financiera', 1);
        `);
        
        // Continuar con el resto de secciones...
        
        console.log('✅ Datos insertados correctamente');
    } catch (error) {
        console.error('❌ Error durante la inserción de datos:', error);
    } finally {
        await pool.end();
    }
}

setupSeeds();