/*
 * notes interface
 * 
 */

Atomate.database.notes = { 
    parent: Atomate.database,
    schema: 'jid INT PRIMARY KEY, version INT, created INT, edited INT, deleted INT, contents TEXT, modified INT, tags TEXT, type TEXT, reminder INT, source TEXT',
    properties: '(jid, version, created, edited, deleted, contents, modified, tags, type, reminder, source)',
    values: '(?,?,?,?,?,?,?,?,?,?,?)',
    addNote:function(jid, version, created, edited, deleted, contents) {
	    // Adds note (from server) to database
	    this.parent.DB.transaction(function(tx) {
	                                   var del = 0;
	                                   var jid = jid; //, 10);
	                                   var created = parseInt(created, 10);
	                                   var edited = parseInt(edited, 10);
	                                   if (deleted === 1 || deleted === true || deleted === "true") { del = 1; }
	                                   tx.executeSql('INSERT INTO note VALUES' + this_.values + ';',
			                                         [jid, version, created, edited, del, contents, 0, tags, type, reminder, source],
			                                         function(tx, rs) { debug("NOTE INSERT - note DB"); }
			                                        );
	                               });
    },
    
    addNewNote:function(created, contents, tags, type, reminder, continuation) {
	    // Adds NEW note to DB, passes unique JID to continuation 
	    var this_ = this;
	    this.parent._getUniqueJID('note', function (jid) {
                                      var source = 'Atomate'; // todo: make more specific
	                                  var version = 0;
	                                  var edited = created;
	                                  var deleted = 0;
	                                  var modified = 1;
	                                  // Insert note into database
	                                  this_.parent.DB.transaction(function(tx) {
		                                                              tx.executeSql('INSERT INTO note VALUES' + this_.values + ';',
			                                                                        [jid, version, created, edited, deleted, contents, modified, tags, type, reminder, source],
			                                                                        function(tx, rs) { debug("NOTE INSERT - note DB"); }
			                                                                       );
	                                                              });
	                                  continuation(jid);
	                              });
    },

    editNote:function(jid, version, created, edited, deleted, contents, modified, tags, type, reminder, source, continuation) {
	    // Silently updates note's attributes
	    debug("Updating note in database: "+jid);
	    debug(created);
	    debug(edited);
        var this_ = this;
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql(
		                                   'INSERT OR REPLACE INTO note ' + this_.properties + ' VALUES' + this_.values + ';', 
		                                   [jid, version, created, edited, deleted, contents, modified, tags, type, reminder, source],
		                                   function(tx, rs) { 
                                               if (continuation !== undefined) {
				                                   this_.getNoteById(jid, continuation);                                                   
                                               }

                                               debug("SUCCESSFUL NOTE UPSERT to DB");
                                           }
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
                                                                 [jid, note.version, note.created, note.edited, 1, note.contents, 1, note.tags, note.type, note.reminder, note.source],
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
				                                             notes.push({
                                                                            jid:note.jid,
					                                                        contents:note.contents,
                                                                            tags: note.tags,
                                                                            type: note.type || 'note',
                                                                            edited: note.edited,
                                                                            reminder: note.reminder
                                                                        });
			                                             }
			                                             debug("DB: Finished grabbing notes.");
			                                             // Pass notes along
			                                             continuation(notes);
			                                         });
	                               });
    },

    putAllNotesInDB:function(notes) { 
	    // Put/update all note items into database
	    var sqlQuery = 'INSERT OR REPLACE INTO note ' + this.properties + ' VALUES' + this.values + ';';

        var attributes = notes.map(function(n){
	                                   var del = 0;
	                                   if (n.deleted === true || n.deleted === 'true' || n.deleted === 1) {del=1;}
	                                   return  [
		                                   n.jid,
		                                   parseInt(n.version, 10),
		                                   parseInt(n.created, 10),
		                                   parseInt(n.edited, 10),
		                                   del,
		                                   n.contents,
		                                   parseInt(n.modified, 10),
                                           n.tags,
                                           n.type,
                                           parseInt(n.reminder, 10),
                                           n.source
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


/*
 * 
 * 
 * 
 * todo: talk to max about what this is intended to do
 * onload are all notes 'unmodified' then when edited 'modified' then when saved set to 'unmodified
 * -- OR --
 * is this just to get all notes that have been edited?
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

 *     getAllNotesDict:function(continuation) {
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
 */