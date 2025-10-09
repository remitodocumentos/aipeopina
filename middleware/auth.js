//middleware/auth.js
module.exports = {
    isAuthenticated: (req, res, next) => {
        console.log('=== DEBUG AUTH MIDDLEWARE ===');
        console.log('ID de sesión:', req.sessionID);
        console.log('Cookie de sesión:', req.headers.cookie);
        console.log('Sesión completa:', JSON.stringify(req.session, null, 2));
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
