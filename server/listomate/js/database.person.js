/*
 * person interface
 * 
 */

Atomate.database.person = { 
    parent: Atomate.database,
    schema: 'id INT PRIMARY KEY, version INT, created INT, edited INT, deleted INT, name TEXT, '
            + 'nickname TEXT, email TEXT, photourl TEXT, phone TEXT, fbid INT, website TEXT, tag TEXT, locationid INT',
    properties: '(id, version, created, edited, deleted, name, nickname, email, photourl, phone, fbid, website, tag, locationid)',    
    values: '(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',  // 14
    addPerson:function(id, version, created, edited, deleted, name, nickname, email, photourl, phone, fbid, website, tag, locationid) {
	    // Adds person (from server) to database
	    this.parent.DB.transaction(function(tx) {
	                                   var del = 0;
	                                   var id = parseInt(id, 10);
	                                   var created = parseInt(created, 10);
	                                   var edited = parseInt(edited, 10);
	                                   if (deleted === 1 || deleted === true || deleted === "true") { del = 1; }
	                                   tx.executeSql('INSERT INTO person VALUES' + this_.values + ';',
                                                     [id, version, created, edited, deleted, name, nickname, email, photourl, phone, fbid, website, tag, locationid],
			                                         function(tx, rs) { debug("PERSON INSERT - person DB"); }
			                                        );
	                               });
    },
    
    addNewPerson:function(created, contents, continuation) {
	    // Adds NEW person to DB, passes unique ID to continuation 
	    var this_ = this;
	    this.parent._getUniqueID('person', function (id) {
	                                  var version = 0;
	                                  var edited = created;
	                                  var deleted = 0;
	                                  var modified = 1;
	                                  // Insert person into database
	                                  this_.parent.DB.transaction(function(tx) {
		                                                              tx.executeSql('INSERT INTO person VALUES' + this_.values + ';',
                                                                                    [id, version, created, edited, deleted, modified, name, nickname, email1, email2, email3, photourl, source, fbid, url, priority, tag],
			                                                                        function(tx, rs) { debug("PERSON INSERT - person DB"); }
			                                                                       );
	                                                              });
	                                  continuation(id);
	                              });
    },

    editPerson:function(id, version, created, edited, deleted, contents, modified) {
	    // Silently updates person's attributes
	    debug("Updating person in database: "+id);
	    debug(created);
	    debug(edited);
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql(
		                                   'INSERT OR REPLACE INTO person ' + this_.properties + ' VALUES' + this_.values + ';', 
                                           [id, version, created, edited, deleted, modified, name, nickname, email1, email2, email3, photourl, source, fbid, url, priority, tag],
		                                   function(tx, rs) { debug("SUCCESSFUL PERSON UPSERT to DB"); }
	                                   );
	                               });
    },

    deletePerson:function(id) {
	    var this_ = this;
	    this.getPersonById(id, function (person) {
	                         if (person === null) { return; }
	                         this_.parent.DB.transaction(function(tx) {
		                                                     tx.executeSql(
		                                                         'INSERT OR REPLACE INTO person ' + this_.properties + ' VALUES' + this_.values + ';', 
                                                                 [id, person.version, person.created, person.edited, 1, 1, person.name, person.nickname, person.email1, person.email2, person.email3, person.photourl, person.source, person.fbid, person.url, person.priority, person.tag],
		                                                         function(tx, rs) { debug("DB: person-delete success"); }
		                                                     );
	                                                     }); 
	                     });	
    },

    getPersonById:function(id, continuation) {
	    // Passes person to continuation function if exists.
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql('SELECT * FROM person WHERE id=? LIMIT 1',[id],
			                                         function(tx, rs) {
			                                             if (rs.rows.length === 1) {
				                                             var person = rs.rows.item(0);
				                                             continuation(person);
			                                             } else { // No person
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

    getAllPeople:function(isDeleted, includeOrder, continuation) {
	    // Passes 'person' to continuation
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql('SELECT * FROM person WHERE deleted = ? ORDER BY created DESC',
			                                         [(isDeleted) ? 1 : 0],
			                                         function(tx, rs) {
			                                             debug("DB: Starting to grab person");                                    
			                                             var people = [];
			                                             for (var i=0;i<rs.rows.length;i++) {
				                                             var person = rs.rows.item(i);
				                                             if (person.id === -1 && !includeOrder) {
				                                                 continue; // Skip special person
				                                             }
                                                             //[id, version, created, edited, deleted, modified, name, nickname, email1, email2, email3, photourl, source, fbid, url, priority, tag],
				                                             people.push({
                                                                             id:person.id,
					                                                         name:person.name,
                                                                             photourl:person.photourl,
                                                                             fbid:person.fbid,
                                                                             tag:person.tag,
                                                                             type:'person'
                                                                         });
			                                             }
			                                             debug("DB: Finished grabbing person.");
			                                             // Pass person along
			                                             continuation(people);
			                                         });
	                               });

    },

    putAllPeopleInDB:function(people) { 
	    // Put/update all person items into database
	    var sqlQuery = 'INSERT OR REPLACE INTO person ' + this.properties + ' VALUES' + this.values + ';';

        var attributes = people.map(function(n){
	                                    var del = 0;
	                                    if (n.deleted === true || n.deleted === 'true' || n.deleted === 1) {del=1;}
	                                    return  [
                                           //[id, version, created, edited, deleted, modified, name, nickname, email1, email2, email3, photourl, source, fbid, url, priority, tag],
		                                    parseInt(n.id, 10),
		                                    parseInt(n.version, 10),
		                                    parseInt(n.created, 10),
		                                    parseInt(n.edited, 10),
		                                    del,
		                                    parseInt(n.modified, 10),
                                            n.name,
                                            n.nickname,
                                            n.email1,
                                            n.email2,
                                            n.email3,
                                            n.photourl,
                                            n.source,
                                            parseInt(n.fbid, 10),
                                            n.url,
                                            n.priority,
                                            n.tag
                                        ];
                                    });
	    // MUCH FASTER THIS WAY, ~ 1000 times faster (no seek time for each transaction!)
	    this.updateBatchPerson(sqlQuery, attributes);
    },

    updateBatchPerson:function(sqlQuery, personAttributes) {
	    //debug("Batch Updating "+personAttributes.length+" person.");
	    this.parent.DB.transaction(function(tx) {
	                                   for (var i=0;i<personAttributes.length;i++) {
		                                   tx.executeSql(sqlQuery, personAttributes[i],
			                                             function(tx, rs) { // Successful row update
			                                             }, function(tx, error) {
                                                             debug(error);
				                                             debug("BAD _updatePerson");
			                                             });
	                                   }
	                               });
    }
};


/**
 * unused: 
 *    addExistingPerson:function(person, modified) {
	    // not called...
	    var id = person.jid;
	    var created = parseInt(person.created, 10);
	    var edited = parseInt(person.edited, 10);
	    var deleted = 0;
	    if (person.deleted === true || person.deleted === "true" || person.deleted === 1) {
	        deleted = 1;
	    }
	    var contents = person.contents;
	    var version = parseInt(person.version, 10);
	    // Adds PRE-EXISTING person to DB, passes unique JID to continuation 
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql('INSERT INTO person VALUES' + this_.values + ';',
                                                     [jid, version, created, edited, deleted, modified, name, nickname, email1, email2, email3, photourl, source, fbid, url, priority, tag],
			                                         function(tx, rs) { debug("PERSON INSERT - person DB"); }
			                                        );
	                               });
    },

 
   // UPDATE
    getAllPersonDict:function(continuation) {
	    // Passes 'person' to continuation
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql(
		                                   'SELECT * FROM person',[],
		                                   function(tx, rs) {
		                                       var people = {};
		                                       for (var i=0;i<rs.rows.length;i++) {
			                                       var person = rs.rows.item(i);
			                                       people[person.jid] = {
                                                       created:person.created,
					                                   edited:person.edited,
					                                   deleted:person.deleted,
					                                   contents:person.contents,
					                                   version:person.version,
					                                   modified:person.modified,
                                                       tags: person.tags,
                                                       type: person.type,
                                                       reminder: person.reminder                                                       
                                                   };
		                                       }
		                                       // Pass person along
		                                       continuation(people);
		                                   }
	                                   );
	                               });
    },

    // UPDATE
    getModifiedPerson:function(continuation) {
	    // Passes 'person' to continuation
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql(
		                                   'SELECT * FROM person WHERE modified = ?',[1],
		                                   function(tx, rs) {
		                                       var people= [];
		                                       for (var i=0;i<rs.rows.length;i++) {
			                                       var person = rs.rows.item(i);
			                                       person.push({jid:person.jid,
				                                               created:person.created,
				                                               edited:person.edited,
				                                               deleted:person.deleted,
				                                               contents:person.contents,
				                                               version:person.version,
					                                           modified:person.modified,
                                                               tags: person.tags,
                                                               type: person.type,
                                                               reminder: person.reminder                                                                                                                      
                                                              });
		                                       } // Then pass person along
		                                       continuation(people);
		                                   }
	                                   );
	                               });
    },

    getUnmodifiedPersonDict:function(continuation) {
	    // Passes 'person' to continuation
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql(
		                                   'SELECT * FROM person WHERE modified = ?',[0],
		                                   function(tx, rs) {
		                                       var people = {};
		                                       for (var i=0;i<rs.rows.length;i++) {
			                                       var person = rs.rows.item(i);
			                                       person[person.jid] = person.version;
		                                       } // Then pass person along
		                                       continuation(people);
		                                   }
	                                   );
	                               });
    },
 */