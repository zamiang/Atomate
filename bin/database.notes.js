/*
 * notes interface
 * 
 */

Atomate.database.notes = { 
    parent: Atomate.database,
    schema: 'jid TEXT PRIMARY KEY, version INT, created INT, edited INT, deleted INT, contents TEXT, modified INT, '
        + 'name TEXT, nickname TEXT, email1 TEXT, email2 TEXT, email3 TEXT, photourl TEXT, source TEXT, '
        + 'fbid INT, gender TEXT, facebookurl TEXT, url TEXT, priority TEXT',
    properties: 'id, version, created, edited, deleted, contents, modified, name, nickname, email1, email2, email3, photourl, source, fbid, gender, facebookurl, url, priority',    
    values: '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',  // 19
    addNote:function(jid, version, created, edited, deleted, contents) {
	    // Adds note (from server) to database
	    this.parent.DB.transaction(function(tx) {
	                                   var del = 0;
	                                   var jid = parseInt(jid, 10);
	                                   var created = parseInt(created, 10);
	                                   var edited = parseInt(edited, 10);
	                                   if (deleted === 1 || deleted === true || deleted === "true") { del = 1; }
	                                   tx.executeSql('INSERT INTO note VALUES' + this_.values + ';',
			                                         [jid, version, created, edited, del, contents, 0, tags, type, reminder],
			                                         function(tx, rs) { debug("NOTE INSERT - note DB"); }
			                                        );
	                               });
    },
    
    addNewNote:function(created, contents, continuation) {
	    // Adds NEW note to DB, passes unique JID to continuation 
	    var this_ = this;
	    this.parent._getUniqueJID('note', function (jid) {
	                                  var version = 0;
	                                  var edited = created;
	                                  var deleted = 0;
	                                  var modified = 1;
	                                  // Insert note into database
	                                  this_.parent.DB.transaction(function(tx) {
		                                                              tx.executeSql('INSERT INTO note VALUES' + this_.values + ';',
			                                                                        [jid, version, created, edited, deleted, contents, modified, tags, type, reminder],
			                                                                        function(tx, rs) { debug("NOTE INSERT - note DB"); }
			                                                                       );
	                                                              });
	                                  continuation(jid);
	                              });
    },

    addExistingNote:function(note, modified) {
	    // not called...
	    var jid = note.jid;
	    var created = parseInt(note.created, 10);
	    var edited = parseInt(note.edited, 10);
	    var deleted = 0;
	    if (note.deleted === true || note.deleted === "true" || note.deleted === 1) {
	        deleted = 1;
	    }
	    var contents = note.contents;
	    var version = parseInt(note.version, 10);
	    // Adds PRE-EXISTING note to DB, passes unique JID to continuation 
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql('INSERT INTO note VALUES' + this_.values + ';',
			                                         [jid, version, created, edited, deleted, contents, modified, tags, type, reminder],
			                                         function(tx, rs) { debug("NOTE INSERT - note DB"); }
			                                        );
	                               });
    },

    editNote:function(jid, version, created, edited, deleted, contents, modified) {
	    // Silently updates note's attributes
	    debug("Updating note in database: "+jid);
	    debug(created);
	    debug(edited);
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql(
		                                   'INSERT OR REPLACE INTO note ' + this_.properties + ' VALUES' + this_.values + ';', 
		                                   [jid, version, created, edited, deleted, contents, modified, tags, type, reminder],
		                                   function(tx, rs) { debug("SUCCESSFUL NOTE UPSERT to DB"); }
	                                   );
	                               });
    },

    deleteNote:function(jid) {
	    var this_ = this;
	    this.getNoteById(jid, function (note) {
	                         if (note === null) { return; }
	                         this_.parent.DB.transaction(function(tx) {
		                                                     tx.executeSql(
		                                                         'INSERT OR REPLACE INTO note ' + this_.properties + ' VALUES' + this_.values + ';', 
                                                                 [jid, note.version, note.created, note.edited, 1, note.contents, 1, note.tags, note.type, note.reminder],
		                                                         function(tx, rs) { debug("DB: note-delete success"); }
		                                                     );
	                                                     }); 
	                     });	
    },

    getNoteById:function(jid, continuation) {
	    // Passes note to continuation function if exists.
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql('SELECT * FROM note WHERE jid=? LIMIT 1',[jid],
			                                         function(tx, rs) {
			                                             if (rs.rows.length === 1) {
				                                             var note = rs.rows.item(0);
				                                             continuation(note);
			                                             } else { // No note
				                                             continuation(null);
			                                             }
			                                         },
			                                         function(tx, error) {
			                                             debug("Unsuccessful get");
			                                             debug(error);
			                                             continuation(null);
			                                         });
	                               });
    },

    getAllNotes:function(isDeleted, includeOrder, continuation) {
	    // Passes 'notes' to continuation
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql('SELECT * FROM note WHERE deleted = ? ORDER BY created DESC',
			                                         [(isDeleted) ? 1 : 0],
			                                         function(tx, rs) {
			                                             debug("DB: Starting to grab notes");
			                                             var notes = [];
			                                             for (var i=0;i<rs.rows.length;i++) {
				                                             var note = rs.rows.item(i);
				                                             if (note.jid === -1 && !includeOrder) {
				                                                 continue; // Skip special note
				                                             }
				                                             notes.push({"jid":note.jid,
					                                                     "contents":note.contents});
			                                             }
			                                             debug("DB: Finished grabbing notes.");
			                                             // Pass notes along
			                                             continuation(notes);
			                                         });
	                               });
    },

    getAllNotesDict:function(continuation) {
	    // Passes 'notes' to continuation
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql(
		                                   'SELECT * FROM note',[],
		                                   function(tx, rs) {
		                                       var notes = {};
		                                       for (var i=0;i<rs.rows.length;i++) {
			                                       var note = rs.rows.item(i);
			                                       notes[note.jid] = {
                                                       created:note.created,
					                                   edited:note.edited,
					                                   deleted:note.deleted,
					                                   contents:note.contents,
					                                   version:note.version,
					                                   modified:note.modified,
                                                       tags: note.tags,
                                                       type: note.type,
                                                       reminder: note.reminder                                                       
                                                   };
		                                       }
		                                       // Pass notes along
		                                       continuation(notes);
		                                   }
	                                   );
	                               });
    },

    getModifiedNotes:function(continuation) {
	    // Passes 'notes' to continuation
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql(
		                                   'SELECT * FROM note WHERE modified = ?',[1],
		                                   function(tx, rs) {
		                                       var notes = [];
		                                       for (var i=0;i<rs.rows.length;i++) {
			                                       var note = rs.rows.item(i);
			                                       notes.push({jid:note.jid,
				                                               created:note.created,
				                                               edited:note.edited,
				                                               deleted:note.deleted,
				                                               contents:note.contents,
				                                               version:note.version,
					                                           modified:note.modified,
                                                               tags: note.tags,
                                                               type: note.type,
                                                               reminder: note.reminder                                                                                                                      
                                                              });
		                                       } // Then pass notes along
		                                       continuation(notes);
		                                   }
	                                   );
	                               });
    },

    getUnmodifiedNoteDict:function(continuation) {
	    // Passes 'notes' to continuation
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql(
		                                   'SELECT * FROM note WHERE modified = ?',[0],
		                                   function(tx, rs) {
		                                       var notes = {};
		                                       for (var i=0;i<rs.rows.length;i++) {
			                                       var note = rs.rows.item(i);
			                                       notes[note.jid] = note.version;
		                                       } // Then pass notes along
		                                       continuation(notes);
		                                   }
	                                   );
	                               });
    },

    putAllNotesInDB:function(notes) { 
	    // Put/update all note items into database
	    var sqlQuery = 'INSERT OR REPLACE INTO note ' + this.properties + ' VALUES' + this.values + ';';

        var attributes = notes.map(function(n){
	                                   var del = 0;
	                                   if (n.deleted === true || n.deleted === 'true' || n.deleted === 1) {del=1;}
	                                   return  [
		                                   parseInt(n.jid, 10),
		                                   parseInt(n.version, 10),
		                                   parseInt(n.created, 10),
		                                   parseInt(n.edited, 10),
		                                   del,
		                                   n.contents,
		                                   n.modified,
                                           n.tags,
                                           n.type,
                                           n.reminder
                                       ];
                                   });
	    // MUCH FASTER THIS WAY, ~ 1000 times faster (no seek time for each transaction!)
	    this.updateBatchNotes(sqlQuery, attributes);
    },

    updateBatchNotes:function(sqlQuery, noteAttributes) {
	    //debug("Batch Updating "+noteAttributes.length+" notes.");
	    this.parent.DB.transaction(function(tx) {
	                                   for (var i=0;i<noteAttributes.length;i++) {
		                                   tx.executeSql(sqlQuery, noteAttributes[i],
			                                             function(tx, rs) { // Successful row update
			                                             }, function(tx, error) {
				                                             debug("BAD _updateNotes");
			                                             });
	                                   }
	                               });
    }
};