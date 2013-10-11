CREATE TABLE entries ( id integer primary key autoincrement, 
                       title text not null, 
                       post text not null, 
                       slug text not null default "", 
                       created  date not null default date('now'), 
                       updated  date not null default date('now'),
                    );
