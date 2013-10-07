/* Various requires.
 * express is our framework
 */

var express = require ( 'express' ),
    fs      = require ( 'fs' ), //fs to access our sqlite file
    file    = 'test.db',  //DB filename. Relative path.
    exists  = fs.existsSync ( file ),//Check if the db already exists.
    sqlite3 = require ( 'sqlite3' ).verbose ( ); //The node-sqlite3 library
    db      = new sqlite3.Database ( file ), //The db handle
    dust    = require ( 'dustjs-linkedin' ),//Dust, the templaing engine of choice.
    cons    = require ( 'consolidate' ); //Consolidate, for dust to work with express.
    store   = express.session.MemoryStore;


/*
 * Initialize the app 
 */
 
var app = express ( ) ;

//Tell the app to use dust.js for templating
app.engine ( 'dust' , cons.dust ) ;
app.set ( 'template_engine', 'dust' ) ;


//Other app settings
app.use ( express.favicon() ) ; //Favicon
app.use ( express.logger('dev' ) );//use logger in dev context
app.use ( express.bodyParser ( ) );
app.use ( express.methodOverride ( ) ) ;

//We intend to use cookies and session for login.
app.use ( express.cookieParser ( 'wigglybits' ) ) ;
app.use ( express.session ( ) );

/* Routes definitions */

//Default route, e.g. localhost/
app.get('/', function (req, res){

   //Fetch from the database in a serial order.
   // TODO : Figure out how to parallelize this.
   
   db.serialize(function() {
       db.each("SELECT id ,title , post from entries ", function (err, row) {
       console.log(row.id + ":" + row.title );
	});
   });
   
   db.close();
   
   res.send("Hello, World!!");
   
});

app.get('/login', function (req, res){

   res.send('Login page');
   
});


app.listen(3000);

//Tell the user the app has started
console.log("App listening on port 3000");