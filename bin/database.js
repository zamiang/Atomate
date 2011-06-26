/**
 * Store items in SqlLite HTML5 Database
 * For storing notes/stuff locally!
 * 
 * @Author Wolfe Styke 
 * @Author Brennan Moore - modiefied this for Atomate adding person and location
 */

Atomate.database = {
    parent: Atomate,
    DB: null,
    initialize: function() {
        try {
            this.createPersonDB();
            this.createNoteDB();

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
	                                 tx.executeSql('SELECT * FROM ' + name +' WHERE jid=? LIMIT 1',[jid],
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