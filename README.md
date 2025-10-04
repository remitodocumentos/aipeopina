¿Cómo ven el municipio de Aipe – Huila sus habitantes?

Aplicación web para la evaluación del desempeño de los funcionarios y la administración municipal de Aipe, Huila.

Descripción:
Esta aplicación permite a los habitantes de Aipe expresar su opinión sobre el desempeño de los funcionarios municipales y la gestión administrativa. Los usuarios pueden evaluar de forma anónima o identificarse, y el sistema garantiza una sola participación por dispositivo para mantener la integridad de los resultados.

Características:
Evaluación de funcionarios municipales por secciones
Evaluación de la gestión administrativa por áreas
Opción de participación anónima o con nombre
Sistema de control para una sola participación por dispositivo
Resultados consolidados y visualización de estadísticas
Panel de administración para gestionar funcionarios, preguntas y secciones

Requisitos previos:
Node.js (v14 o superior)
npm (v6 o superior)
PostgreSQL

aipe-opina/
├── db/                    # Archivos de base de datos
│   ├── migrations.sql     # Esquema de la base de datos
│   ├── seeds.sql          # Datos iniciales
│   └── queries.js         # Consultas a la base de datos
├── middleware/            # Middleware de la aplicación
│   └── auth.js            # Middleware de autenticación
├── public/                # Archivos estáticos
│   ├── css/
│   │   └── styles.css     # Estilos de la aplicación
│   ├── js/
│   └── images/
├── routes/                # Rutas de la aplicación
│   ├── admin.js           # Rutas del panel de administración
│   ├── evaluacion.js      # Rutas de evaluación
│   ├── index.js           # Rutas principales
│   └── resultados.js      # Rutas de resultados
├── views/                 # Vistas de la aplicación
│   ├── admin/             # Vistas del panel de administración
│   │   ├── dashboard.ejs
│   │   ├── funcionarios.ejs
│   │   ├── login.ejs
│   │   ├── preguntas.ejs
│   │   └── secciones.ejs
│   ├── partials/          # Vistas parciales
│   │   ├── footer.ejs
│   │   └── header.ejs
│   ├── administrativo.ejs
│   ├── funcionarios.ejs
│   ├── index.ejs
│   ├── resultados.ejs
│   └── ya-participo.ejs
├── .env                   # Variables de entorno (no subir al      repositorio)
├── .env.example           # Plantilla de variables de entorno
├── .gitignore             # Archivos ignorados por Git
├── app.js                 # Archivo principal de la aplicación
├── package.json           # Dependencias y scripts del proyecto
└── README.md              # Este archivo

Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo LICENCIA.md para detalles.

Contacto
Para cualquier consulta o sugerencia, por favor contacta a:

Nombre: info remito
Correo electrónico: remito@github.com
Teléfono: + 1 968-555-367-174


