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
            ('Ana Maria Conde Garzon', 'Secretaria', 'Secretaria de protección social'),
            ('Jhon Alexander Pulecio Charry', 'Secretario', 'Secretaria de planeación'),
            ('Daniela Ramirez Chavarro', 'Secretaria', 'Secretaria de infraestructura'),
            ('Javier Charry Bonilla', 'Secretario', 'Secretaria de desarrollo económico'),
            ('Maria Ximena Martin Charry', 'Secretaria', 'Secretaria de tránsito'),
            ('Yoan Orlando Garay Diaz', 'Inspector', 'Inspección de policía'),
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
            ('Gestión financiera', 1),
            ('Agua potable y saneamiento', 2),
            ('Recolección de basuras', 2),
            ('Energía eléctrica', 2),
            ('Alcantarillado y aguas servidas', 2),
            ('Gestión de residuos solidos', 2),
            ('Vías, movilidad y transporte publico ', 2),
            ('Telecomunicaciones e internet', 2),
            ('Infraestructura educativa', 2),
            ('infraestructura de salud', 2),
            ('infraestructura practica deportiva', 2),
            ('infraestructura recreación familiar', 2),
            ('Ordenamiento territorial', 3),
            ('Espacio publico', 3),
            ('Vivienda', 3),
            ('Patrimonio y paisaje urbano', 3),
            ('Zonas verdes', 3),
            ('Uso del suelo', 3),
            ('Zonas de parqueo', 3),
            ('Urbanismo', 3),
            ('Calidad del aire', 4),
            ('Calidad del agua', 4),
            ('Biodiversidad y áreas verdes', 4),
            ('Gestión ambiental', 4),
            ('Cambio climático', 4),
            ('Contaminación por ruido', 4),
            ('Calidad de la salud', 5),
            ('Calidad de la educación', 5),
            ('Seguridad y convivencia', 5),
            ('Cultura y deporte', 5),
            ('Recreación y esparcimiento familiar', 5),
            ('Recreación y esparcimiento adulto mayor', 5),
            ('Inclusión social', 5),
            ('Empleo y desarrollo económico', 5),
            ('Innovación y tecnología', 6),
            ('Emprendimiento y empresariado', 6),
            ('Actividad económica licita', 6),
            ('Turismo', 6),
            ('Inversión extranjera', 6),
            ('Uso de la inteligencia artificial', 6),
            ('Satisfacción ciudadana', 7),
            ('Salud y bienestar', 7),
            ('Seguridad alimentaria', 7),
            ('Empleo de calidad', 7),
            ('Vivienda adecuada', 7),
            ('Estabilidad económica familiar', 7),
            ('Salud física', 7),
            ('Salud mental', 7),
            ('Ambientes saludables', 7),
            ('Inclusión educativa', 7),
            ('Confianza y solidaridad', 7),
            ('Ambiente sano', 7),
            ('Vida cultural de calidad', 7),
            ('Recreación y esparcimiento de calidad', 7),
            ('Seguridad humana', 7),
            ('Acciones contra la violencia familiar', 8),
            ('Acciones contra la violencia sexual', 8),
            ('Acciones contra la violencia de genero', 8),
            ('Acciones contra la drogadicción', 8),
            ('Acciones contra el alcoholismo', 8),
            ('Acciones contra el tabaquismo', 8),
            ('Acciones contra la inseguridad ciudadana', 8),
            ('Acciones contra la inseguridad vial', 8),
            ('Acciones contra el desamparo de adultos mayores', 8),
            ('Acciones contra la contaminación ambiental y acustica', 8),
            ('Acciones contra la ocupación del espacio público', 8),
            ('Acciones contra la pobreza multidimensional', 8),
            ('Acciones contra la delincuencia común', 8),
            ('Acciones contra la corrupción', 8),
            ('Acciones contra la falta de respuesta institucional', 8),
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