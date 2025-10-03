// middleware/auth.js
module.exports = {
    // Middleware para verificar si el usuario está autenticado
    isAuthenticated: (req, res, next) => {
        if (req.session && req.session.admin) {
            return next();
        }
        res.redirect('/admin/login');
    }
};