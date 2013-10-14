module.exports = function() {
    return function(req, res, next) {
        if (!req.secure && req.path === '/login') {
            res.redirect ( 'https://' + req.header('Host') + req.url);
        }
        else if ( req.secure && req.path !== '/login'){
            res.redirect ( 'http://'  + req.header('Host') + req.url);
        }
        else {
            next(); 
        }
    }
 };