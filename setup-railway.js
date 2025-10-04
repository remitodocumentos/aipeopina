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

async function setup() {
    try {
        console.log('Iniciando configuración de la base de datos...');
        
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