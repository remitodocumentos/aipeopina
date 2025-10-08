-- db/migrations.sql
-- migrations.sql CORREGIDO
CREATE TABLE IF NOT EXISTS funcionarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    seccion VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS preguntas_funcionarios (
    id SERIAL PRIMARY KEY,
    texto VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS secciones_administrativas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS preguntas_administrativas (
    id SERIAL PRIMARY KEY,
    texto VARCHAR(255) NOT NULL,
    seccion_id INTEGER REFERENCES secciones_administrativas(id)
);

CREATE TABLE IF NOT EXISTS participantes (
    id SERIAL PRIMARY KEY,
    dispositivo_id VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session (
    sid varchar NOT NULL COLLATE "default",
    sess json NOT NULL,
    expire timestamp(6) NOT NULL,
    PRIMARY KEY (sid)
);

CREATE TABLE IF NOT EXISTS respuestas_funcionarios (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id),
    pregunta_id INTEGER NOT NULL REFERENCES preguntas_funcionarios(id),
    respuesta VARCHAR(20) NOT NULL CHECK (respuesta IN ('excelente', 'bueno', 'regular', 'deficiente', 'malo')),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    participante_id INTEGER REFERENCES participantes(id)
);

CREATE TABLE IF NOT EXISTS respuestas_administrativas (
    id SERIAL PRIMARY KEY,
    seccion_id INTEGER NOT NULL REFERENCES secciones_administrativas(id),
    pregunta_id INTEGER NOT NULL REFERENCES preguntas_administrativas(id),
    respuesta VARCHAR(20) NOT NULL CHECK (respuesta IN ('excelente', 'bueno', 'regular', 'deficiente', 'malo')),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    participante_id INTEGER REFERENCES participantes(id)
);