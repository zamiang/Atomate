/**
 * Store items in SqlLite HTML5 Database
 * For storing notes/stuff locally!
 * 
 * @Author Wolfe Styke 
 * @Author Brennan Moore - modiefied this for Atomate adding person and location
 */


/* 
 *  NOTES SCHEMA 
    jid INT PRIMARY KEY, 
    version INT, 
    created INT, 
    edited INT, 
    deleted INT,
	contents TEXT, 
    modified INT,
    tags TEXT // new
    type TEXT // new
    reminder INT


 *  Person SCHEMA 
    id TEXT PRIMARY KEY,  // @firstnamelastname
    version INT, 
    created INT, 
    edited INT, 
    deleted INT,
    modified INT,
    contents TEXT, // for notes

    name TEXT,
    nickname TEXT,
    email1 TEXT,
    email2 TEXT,
    email3 TEXT,
    photourl TEXT,
    source TEXT,
    fbid INT,
    gender TEXT,
    facebookurl TEXT,
    url1 TEXT,
    url2 TEXT,
    url3 TEXT,
    priority TEXT

 * NOT INTEGRATED
 *  Location SCHEMA  
    jid INT PRIMARY KEY, 
    lat FLOAT,
    lng FLOAT,
    qlat FLOAT,
    qlng FLOAT,
    name TEXT,
    type TEXT
*/

Atomate.database = {
    parent: Atomate,
    DB: null,
    noteSchema: 'jid INT PRIMARY KEY, version INT, created INT, edited INT, deleted INT, contents TEXT, modified INT, tags TEXT, type TEXT, reminder INT',
    noteProperties: '(jid, version, created, edited, deleted, contents, modified, tags, type, reminder)',
    personSchema: 'jid TEXT PRIMARY KEY, version INT, created INT, edited INT, deleted INT, contents TEXT, modified INT, '
        + 'name TEXT, nickname TEXT, email1 TEXT, email2 TEXT, email3 TEXT, photourl TEXT, source TEXT, '
        + 'fbid INT, gender TEXT, facebookurl TEXT, url1 TEXT, url2 TEXT,  url3 TEXT, priority TEXT',
    personProperties: 'id, version, created, edited, deleted, contents, modified, name, nickname, email1, email2, email3, photourl, source, fbid, gender, facebookurl, url1, url2,  url3, priority',
    initialize: function() {
        try {
            this.createNoteDB();
            this.createPersonDB();
            //this.createLocationDB();            
        } catch (e) {
            console.log(e);
        }

    },
    
    clearDB: function(){
        this.clearNoteDB();        
        this.clearPersonDB();        
        //this.clearLocationDB(); 
    },


    // TODO: fix repition of note
    clearNoteDB:function() {
        this._clearDB('note', 'CREATE TABLE note (' + this.notes.schema + ')');
    },
    
    createNoteDB:function() {
        this._createDB('CREATE TABLE IF NOT EXISTS note ('+ this.notes.schema + ')');
    },

    clearPersonDB:function() {
        this._clearDB('person', 'CREATE TABLE person (' + this.person.schema + ')');
    },

    createPersonDB:function() {
        this._createDB('CREATE TABLE IF NOT EXISTS person ('+ this.person.schema + ')');
    },

    _clearDB: function(name,createSQL) {
	    this.DB.transaction(function(tx) {
	                                 tx.executeSql('DROP TABLE ' + name, []);
	                                 tx.executeSql(createSQL, []);
	                             });
    },

    _createDB:function(createSQL) {
	    // Open Database + Create Table if needed
	    this.DB = this.DB || openDatabase("Atomate","","Atomate", 5000000);
	    this.DB.transaction(function(tx) {	tx.executeSql(createSQL, []); });
    },

    _getUniqueJID:function(name, continuation) {
        var this_ = this;
	    // Passes unique JID to continuation.
	    var jid = Math.floor(Math.random()*1000000);
	    this.DB.transaction(function(tx) {
	                                 tx.executeSql('SELECT * FROM ' + note +' WHERE jid=? LIMIT 1',[jid],
			                                       function(tx, rs) {
			                                           if (rs.rows.length === 1) {
				                                           // Chose existing jid, repeat...
				                                           this_.getUniqueJID(continuation);
			                                           } else { // No note
				                                           // Success - new jid unique!
				                                           continuation(jid);
			                                           }
			                                       },
			                                       function(tx, error) {
			                                           console.log("Unsuccessful get");
			                                           console.log(error);
			                                           continuation(jid);
			                                       });
	                        });
    }
};      