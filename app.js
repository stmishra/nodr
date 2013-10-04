var express = require ('express');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');
var app = express();
app.get('/', function (req, res){
	db.serialize(function() {
		db.run('create table lorem (info TEXT)');
		var stmt = db.prepare("INSERT into lorem VALUES (?)");
		for (var i = 1; i < 10 ; i++){
			stmt.run("Ipsum " + i);
		}
		stmt.finalize();
		db.each("SELECT rowid as id, info from lorem", function (err, row) {
				console.log(row.id + ":" + row.info);
		});
	});
	db.close();
	res.send("Hello, World!!");
});
app.listen(3000);
console.log("App listening on port 3000");

