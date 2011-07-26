/**
 * Store items in SqlLite HTML5 Database
 * For storing notes/stuff locally!
 * 
 * @Author Brennan Moore - modiefied this for Atomate adding person and location
 */

Atomate.database = {
    parent: Atomate,
    DB: null,
    initialize: function() {
        this.createPersonDB();
        this.createNoteDB();
        this.createLocationDB();
    },

    _replaceLocalCacheItem: function(item, type) {        
        this.parent[type] = this.parent[type].map(function(n) { 
                                                      return item.id === n.id ? item : n;
                                                  });
        return item;
    },    
    replaceNoteInLocalCache: function(note) { return this._replaceLocalCacheItem(note, 'notes');  },    
    replacePersonInLocalCache: function(person) { return this._replaceLocalCacheItem(person, 'people');  },
    replaceLocationInLocalCache: function(location) { return this._replaceLocalCacheItem(location, 'locations');    },
    
    pushModified: function(lastPushed) {
        var this_ = this;
        var modified = lastPushed || 0;
        var people = this.parent.people.filter(function(d){ return d.modified && d.modified >= modified; });
        var notes = this.parent.notes.filter(function(d){ return d.modified && d.modified >= modified; });
        var locations = this.parent.locations.filter(function(d){ return d.modified && d.modified >= modified; });

        jQuery.postJSON('/data', {                            
                            people: people,
                            notes: notes,
                            notes: notes
                        }, function(response) {
                            debug(response);
                        });
    },    
    
    bulkSave: function(items, type, cacheList) {
        this.parent.auth.interval_map_lite(response.data.people, 
                                           function(entry) { 
                                               // todo: do some normalization
									           this_.replacePersonInLocalCache(entry);
                                               cacheList.push(entry);
                                               
						                   }, function() { 
                                               debug('about to save from server -- ' + type);
                                               debug(cacheList);
                                               
                                               if (type == "person") {
                                                   Atomate.database.person.putAllPeopleInDB(cacheList);                                                   
                                               } else if (type == "notes") {
                                                   Atomate.database.notes.putAllNotesInDB(cacheList);
                                               } else {
                                                   Atomate.database.location.putAllLocationsInDB(cacheList);
                                               }

                                               delete cacheList;
                                           });
    },

    pullModified: function(lastUpdated) {
        var this_ = this;
        var modified = lastUpdated || 0;
        jQuery.getJSON('/data', {
                           modified: modified
                       }, function(response) {
                           if (response.success && response.data) {                               
                               var people_cache = [];
                               var location_cache = [];
                               var note_cache = [];

                               this_.bulkSaveFromServer(response.data.people, 'people', people_cache);
                               this_.bulkSaveFromServer(response.data.notes, 'notes', note_cache);
                               this_.bulkSaveFromServer(response.data.locations, 'locations', location_cache);
                           } else {
                               debug(response.code);
                           }
                       });
    },    

    
    clearDB: function(){
        this.clearNoteDB();        
        this.clearPersonDB();        
        this.clearLocationDB(); 
    },

    // TODO: fix repition of create statements
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

    clearLocationDB:function() {
        this._clearDB('location', 'CREATE TABLE location (' + this.location.schema + ')');
    },

    createLocationDB:function() {
        this._createDB('CREATE TABLE IF NOT EXISTS location ('+ this.location.schema + ')');
    },

    _clearDB: function(name,createSQL) {
	    this.DB.transaction(function(tx) {
	                            tx.executeSql('DROP TABLE ' + name, []);
	                            tx.executeSql(createSQL, []);
	                        });
    },

    _createDB:function(createSQL) {
	    // Open Database + Create Table if needed
        if (window.Components) {
            var this_ = this;
            this.setupFirefoxDB();
            this.isFirefox = true;
        }
	    this.DB = this.DB || openDatabase("Atomate","","Atomate", 5000000);
	    this.DB.transaction(function(tx) {	tx.executeSql(createSQL, []); });
    },

    _getUniqueID:function(name, continuation) {
        var this_ = this;
	    // Passes unique ID to continuation.
	    var id = Math.floor(Math.random()*1000000);
	    this.DB.transaction(function(tx) {
	                            tx.executeSql('SELECT * FROM ' + name +' WHERE id=? LIMIT 1',[id],
			                                  function(tx, rs) {
			                                      if (rs.rows.length === 1) {
				                                      // Chose existing id, repeat...
				                                      this_.getUniqueID(continuation);
			                                      } else { // No note
				                                      // Success - new id unique!
				                                      continuation(id);
			                                      }
			                                  },
			                                  function(tx, error) {
			                                      console.log("Unsuccessful get");
			                                      console.log(error);
			                                      continuation(id);
			                                  });
	                        });
    },
    setupFirefoxDB: function() {
        var this_ = this;

        netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
        var file = Components.classes["@mozilla.org/file/directory_service;1"]
            .getService(Components.interfaces.nsIProperties)
            .get("ProfD", Components.interfaces.nsIFile);
        file.append("Atomate_001.sqlite");

	    var storageService = Components.classes["@mozilla.org/storage/service;1"]
            .getService(Components.interfaces.mozIStorageService);
        this._DB = storageService.openDatabase(file); // cant be modified

        this.DB = {};
        this.DB.transaction = function(cont) { return cont(this_.DB); };
        this.DB.executeSql = function(stmnt, val, cont) { 
            if (val) { val.map(function(v){ 
                                   if (parseInt(v, 10)){
                                       stmnt = stmnt.replace('?', v);
                                   } else {
                                       stmnt = stmnt.replace('?', "\"" + v + "\"");
                                   }
                               });                                             
                     }
            if (!cont) { cont = function(){}; }

            netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
            var statement = this_._DB.createStatement(stmnt);
            var executedCont = false;
            return statement.executeAsync({
                                              handleResult: function(rs) {
                                                  var result = {rows:{item:[],length:0}};
                                                  var numRows = 0;
                                                  var row, i, k, v;
                                                  
                                                  netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');                                                          
                                                  for (row = rs.getNextRow(); row; row = rs.getNextRow()) {
                                                      result.rows.item[numRows] = {};
                                                      for (i = 0; i < row.numEntries; i++) {
                                                          k = statement.getColumnName(i);
                                                          v = row.getResultByIndex(i);
                                                          result.rows.item[numRows][k] = v;
                                                      }
                                                      numRows++;
                                                      result.rows.length = numRows;
                                                  }
                                                  executedCont = true;
                                                  cont(statement, result);
                                              },                                                      
                                              handleError: function(e){ console.log(e + ' << error');  debug(e); },                                                      
                                              handleCompletion: function(e){  
                                                  if (e != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED) {
                                                      debug("Query canceled or aborted!");
                                                  }                                                                                                    
                                                  if (!executedCont) {
                                                      cont(statement, {rows:{item:[],length:0}});
                                                  }
                                              }
                                          });
        };
    }
};      