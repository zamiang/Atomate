/*
 * notes interface
 * 
 */

Atomate.database.notes = { 
    parent: Atomate.database,
    schema: 'id INT PRIMARY KEY, version INT, created INT, edited INT, deleted INT, contents TEXT, tags TEXT, type TEXT, reminder INT, source TEXT, locationid INT',
    properties: '(id, version, created, edited, deleted, contents, tags, type, reminder, source, locationid)',
    values: '(?,?,?,?,?,?,?,?,?,?,?)', // 11
    addNote:function(id, version, created, edited, deleted, contents, tags, type, reminder, source, locationid) {
	    // Adds note (from server) to database
	    this.parent.DB.transaction(function(tx) {
	                                   var created = parseInt(created, 10);
	                                   var edited = parseInt(edited, 10);
	                                   var del = (deleted === 1 || deleted === true || deleted === "true") ? 1 : 0;
                                       var version = parseInt(version, 10) || 0;

	                                   tx.executeSql('INSERT INTO note VALUES' + this_.values + ';',
			                                         [id, version, created, edited, del, contents, tags, type, reminder, source, locationid],
			                                         function(tx, rs) { debug("NOTE INSERT - note DB"); }
			                                        );
	                               });
    },
    
    addNewNote:function(created, contents, tags, type, reminder, continuation) {
	    // Adds NEW note to DB, passes unique ID to continuation 
	    var this_ = this;
	    this.parent._getUniqueID('note', function (id) {
                                      var source = 'Atomate'; // todo: make more specific
	                                  var version = 0;
	                                  var edited = created;
	                                  var deleted = 0;
	                                  // Insert note into database
	                                  this_.parent.DB.transaction(function(tx) {
		                                                              tx.executeSql('INSERT INTO note ' + this_.properties + ' VALUES' + this_.values + ';',
			                                                                        [id, version, created, edited, deleted, contents, tags, type, reminder, source],
			                                                                        function(tx, rs) { debug("NOTE INSERT - note DB"); }
			                                                                       );
	                                                              });
	                                  continuation(id);
	                              });
    },

    editNote:function(id, version, created, edited, deleted, contents, tags, type, reminder, source, continuation) {
	    // Silently updates note's attributes
	    debug("Updating note in database: "+id);
	    debug(created);
	    debug(edited);
        var this_ = this;
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql(
		                                   'INSERT OR REPLACE INTO note ' + this_.properties + ' VALUES' + this_.values + ';', 
		                                   [id, version, created, edited, deleted, contents, tags, type, reminder, source],
		                                   function(tx, rs) { 
                                               if (continuation !== undefined) {
				                                   this_.getNoteById(id, continuation);                                                   
                                               }                                               
                                               debug("SUCCESSFUL NOTE UPSERT to DB");
                                           }
	                                   );
	                               });
    },

    deleteNote:function(id) {
	    var this_ = this;
	    this.getNoteById(id, function (note) {
	                         if (note === null) { return; }
	                         this_.parent.DB.transaction(function(tx) {
		                                                     tx.executeSql(
		                                                         'INSERT OR REPLACE INTO note ' + this_.properties + ' VALUES' + this_.values + ';', 
                                                                 [id, note.version, note.created, note.edited, 1, note.contents, 1, note.tags, note.type, note.reminder, note.source],
		                                                         function(tx, rs) { debug("DB: note-delete success"); }
		                                                     );
	                                                     }); 
	                     });	
    },

    getNoteById:function(id, continuation) {
	    // Passes note to continuation function if exists.
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql('SELECT * FROM note WHERE id=? LIMIT 1',[id],
			                                         function(tx, rs) {
			                                             if (rs.rows.length === 1) {
                                                             var isFirefox = jQuery.isArray(rs.rows.item);
                                                             if (isFirefox) {
				                                                 var note = rs.rows.item[0];
                                                             } else {
				                                                 var note = rs.rows.item(0);    
                                                             }

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
                                                         var isFirefox = jQuery.isArray(rs.rows.item);
			                                             for (var i=0;i<rs.rows.length;i++) {
                                                             if (isFirefox) {
                                                                 var note = rs.rows.item[i];                         
                                                             } else {
				                                                 var note = rs.rows.item(i);                                                                 
                                                             }
                                                             
				                                             if (note.id === -1 && !includeOrder) {
				                                                 continue; // Skip special note
				                                             }
				                                             notes.push({
                                                                            id:note.id,
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
		                                   n.id,
		                                   parseInt(n.version, 10),
		                                   parseInt(n.created, 10),
		                                   parseInt(n.edited, 10),
		                                   del,
		                                   n.contents,
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
			                                       notes.push({id:note.id,
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
			                                       notes[note.id] = note.version;
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
			                                       notes[note.idq] = {
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