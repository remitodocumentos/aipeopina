// middleware/auth.js
module.exports = {
    // Middleware para verificar si el usuario está autenticado
    isAuthenticated: (req, res, next) => {
        console.log('=== DEBUG AUTH MIDDLEWARE ===');
        console.log('Sesión actual:', req.session);
        console.log('Usuario en sesión:', req.session.admin);
        console.log('============================');
        
        if (req.session && req.session.admin) {
            console.log('✅ Usuario autenticado, continuando...');
            return next();
        }
        console.log('❌ Usuario no autenticado, redirigiendo a login');
        res.redirect('/admin/login');
    }
};