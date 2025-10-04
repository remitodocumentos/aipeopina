-- Tabla de funcionarios
CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    seccion VARCHAR(100) NOT NULL
);

-- Tabla de preguntas para funcionarios
CREATE TABLE preguntas_funcionarios (
    id SERIAL PRIMARY KEY,
    texto VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL
);

-- Tabla de secciones administrativas
CREATE TABLE secciones_administrativas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla de preguntas administrativas
CREATE TABLE preguntas_administrativas (
    id SERIAL PRIMARY KEY,
    texto VARCHAR(255) NOT NULL,
    seccion_id INTEGER REFERENCES secciones_administrativas(id)
);

-- Tabla de respuestas de funcionarios
CREATE TABLE respuestas_funcionarios (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER NOT NULL,
    pregunta_id INTEGER NOT NULL,
    respuesta VARCHAR(20) NOT NULL CHECK (respuesta IN ('excelente', 'bueno', 'regular', 'deficiente', 'malo')),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de respuestas administrativas
CREATE TABLE respuestas_administrativas (
    id SERIAL PRIMARY KEY,
    seccion_id INTEGER NOT NULL,
    pregunta_id INTEGER NOT NULL,
    respuesta VARCHAR(20) NOT NULL CHECK (respuesta IN ('excelente', 'bueno', 'regular', 'deficiente', 'malo')),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para registrar participantes
CREATE TABLE participantes (
    id SERIAL PRIMARY KEY,
    dispositivo_id VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para sesiones (para almacenamiento persistente)
CREATE TABLE IF NOT EXISTS session (
    sid varchar NOT NULL COLLATE "default",
    sess json NOT NULL,
    expire timestamp(6) NOT NULL,
    PRIMARY KEY (sid)
);

-- Modificar tablas de respuestas para relacionar con participantes
ALTER TABLE respuestas_funcionarios ADD COLUMN participante_id INTEGER REFERENCES participantes(id);
ALTER TABLE respuestas_administrativas ADD COLUMN participante_id INTEGER REFERENCES participantes(id);