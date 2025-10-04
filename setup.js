const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runSQLFile(filePath) {
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
        console.log(`✅ Ejecutado: ${path.basename(filePath)}`);
    } catch (error) {
        console.error(`❌ Error en ${path.basename(filePath)}:`, error);
        throw error;
    }
}

async function dropTables() {
    try {
        console.log('Eliminando tablas existentes...');
        
        // Eliminar tablas en orden inverso para evitar errores de claves foráneas
        await pool.query('DROP TABLE IF EXISTS session CASCADE');
        await pool.query('DROP TABLE IF EXISTS respuestas_administrativas CASCADE');
        await pool.query('DROP TABLE IF EXISTS respuestas_funcionarios CASCADE');
        await pool.query('DROP TABLE IF EXISTS participantes CASCADE');
        await pool.query('DROP TABLE IF EXISTS preguntas_administrativas CASCADE');
        await pool.query('DROP TABLE IF EXISTS preguntas_funcionarios CASCADE');
        await pool.query('DROP TABLE IF EXISTS secciones_administrativas CASCADE');
        await pool.query('DROP TABLE IF EXISTS funcionarios CASCADE');
        
        console.log('✅ Tablas eliminadas correctamente');
    } catch (error) {
        console.error('❌ Error al eliminar tablas:', error);
        throw error;
    }
}

async function setup() {
    try {
        console.log('Iniciando configuración de la base de datos...');
        
        // Eliminar tablas existentes
        await dropTables();
        
        // Ejecutar migraciones
        await runSQLFile(path.join(__dirname, 'db', 'migrations.sql'));
        
        // Ejecutar semillas
        await runSQLFile(path.join(__dirname, 'db', 'seeds.sql'));
        
        console.log('✅ Configuración completada con éxito');
    } catch (error) {
        console.error('❌ Error durante la configuración:', error);
    } finally {
        await pool.end();
    }
}

setup();