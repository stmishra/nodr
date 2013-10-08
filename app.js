/* Various requires.
 * express is our framework
 */

var express = require ( 'express' ),
    path    = require ('path'),
    fs      = require ( 'fs' ), //fs to access our sqlite file
    file    = path.join ( __dirname , '/test.db'),  //DB filename. Relative path.
    exists  = fs.existsSync ( file ),//Check if the db already exists.
    sqlite3 = require ( 'sqlite3' ).verbose ( ), //The node-sqlite3 library
    db      = new sqlite3.Database ( file , sqlite3.OPEN_READWRITE ), //The db handle
    dust    = require ( 'dustjs-linkedin' ),//Dust, the templaing engine of choice.
    cons    = require ( 'consolidate' ); //Consolidate, for dust to work with express.
    app     = express ( ) ; //Initialize the app.

//Tell the app to use dust.js for templating
app.engine ( 'dust' , cons.dust ) ;
app.set ( 'template_engine', 'dust' ) ;
app.set ( 'views', __dirname + '/templates') ;
app.set ( 'view engine' , 'dust' ) ;


//Other app settings
app.use ( express.favicon ( path.join ( __dirname , 'static/favicon.ico' ) ) ) ; //Favicon
app.use ( express.logger ('dev' ) );//use logger in dev context
app.use ( express.bodyParser ( ) );
app.use ( express.methodOverride ( ) ) ;

//We intend to use cookies and session for login.
app.use ( express.cookieParser ( 'wigglybits4every1!!' ) ) ;
app.use ( express.session ( ) );

//Static assets serving. We will move this to nginx directly when we set up reverse proxying

app.use ( express.static ( path.join ( __dirname , 'static' ) ) );

/* Routes definitions */

/* Default route, e.g. localhost/
 * This will show the posts in reverse order of their insertion
 *
 */
 
app.get ( '/', function (req, res) {

   //Fetch from the database in a serial order.
   // TODO : Figure out how to parallelize this.

   if ( exists ) {
       db.serialize( function () {
          db.all( "SELECT id, title, post FROM entries" , function ( err , rows ) {
          res.render('index' , { title : 'Posts', result: rows } );
          });
       });
   }

});

/* /login GET route, for example localhost/login
 * This just renders the login page, which will eventually POST to /login and create a session if the user is valid
 */

app.get ( '/login' , function ( req , res ) {

   res.render('login');
   
});

app.post ('/login', function ( req, res ) {
  
   var username = req.body.username || '';
   var password = req.body.password || '';
   if (username === 'stmishra@fastmail.fm' && password === 'bigpassword'){
     req.session.user = 'stmishra@fastmail.fm';
     res.redirect('/edit');
   } else {
     res.send ("Not logged in");
   }
});

app.post('/list', function ( req, res ) {

});

app.get ('/edit', restrict, function ( req, res ) {
   console.log('Was redirected here');   res.send("Edit page, logged in. Hell yes!");
});

/*
 * Sesion middle ware
 */
function restrict(req, res, next){
 if (req.session.user){
    next();
 } else {
    req.session.error  = "Access denied";
    res.redirect('/login');
 }
}


app.listen(3000);

//Tell the user the app has started
console.log("App listening on port 3000");