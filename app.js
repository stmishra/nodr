/* Various requires.
 * express is our framework
 
-TODOS:  DB connection opening should be a middleware
- DB connection closing should also be a middleware.

 */

var express = require ( 'express' ),
    path    = require ('path'),
    fs      = require ( 'fs' ), //fs to access our sqlite file
    file    = path.join ( __dirname , '/test.db'),  //DB filename. Relative path.
    exists  = fs.existsSync ( file ),//Check if the db already exists.
    sqlite3 = require ( 'sqlite3' ).verbose ( ), //The node-sqlite3 library
    db      = new sqlite3.cached.Database ( file , sqlite3.OPEN_READWRITE ), //The db handle
    dust    = require ( 'dustjs-linkedin' ),//Dust, the templaing engine of choice.
    cons    = require ( 'consolidate' ); //Consolidate, for dust to work with express.
    app     = express ( ), //Initialize the app.
    appS    = express ( ),
    http    = require ( 'http' ),
    https   = require ('https');
    

//Tell the app to use dust.js for templating
app.engine ( 'dust' , cons.dust ) ;
app.set ( 'template_engine', 'dust' ) ;
app.set ( 'views', __dirname + '/templates') ;
app.set ( 'view engine' , 'dust' ) ;


//Other app settings
app.use ( express.favicon ( path.join ( __dirname , '/static/favicon.ico' ) ) ) ; //Favicon
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

 
app.get ( '/' , function (req, res) {

   //Fetch from the database in a serial order.
   // TODO : Figure out how to parallelize this.
   // 
   var logged_in = false;
   if (req.session.user) logged_in = true;
   if ( exists ) {
       db.serialize( function () {
          db.all( "SELECT id, title, post FROM entries order by id desc" , function ( err , rows ) {
          res.render('index' , { title : 'Posts', result: rows, logged_in: logged_in } );
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
     res.redirect('http://ka.berserker.gen.in/');
   } else {
     res.send ("Not logged in");
   }
});

app.get ( '/logout', function ( req , res ){

   req.session.destroy(function(){
     res.redirect('http://ka.berserker.gen.in/');
   });

});

app.get( '/post/:id', function ( req , res ){

  var logged_in = false;
  var id = req.params.id || null;
  if (req.session.user) logged_in = true;
  if ( exists && id ){
     db.serialize( function () {
        db.get( " SELECT id, title, post from entries where id = ?", [id] , function (err , row) {
            res.render("post",{result : row, logged_in : logged_in });
        });
      });
  }
});

app.post( '/post/:id', restrict , function (req, res ){
  var id = req.params.id || null;
  var title = req.body.title || null;
  var post = req.body.text || null;
  db.serialize( function () {
    db.run ( " UPDATE entries set title = ? , post = ?  where id = ?", [title, post, id], function (err) {
      console.log(JSON.stringify(err));
      res.redirect("/post/" + id);
    });
  });
});



app.post ('/add', restrict, function ( req, res ){ 

	var title = req.body.title;
	var text = req.body.text;
	db.run( "INSERT INTO entries (title, post) values (?, ?)",  [title, text] );
    res.redirect('/');

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



var privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var httpsServer = https.createServer({key : privateKey, cert: certificate}, app);
var httpServer = http.createServer( app ); 


httpServer.listen(80);
httpsServer.listen(443);

//Tell the user the app has started
console.log("Secure App listening on port 443");
console.log(" App listening on port 80");
