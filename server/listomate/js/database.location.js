/*
 * location interface
 * 
 */

Atomate.database.location = { 
    parent: Atomate.database,
    schema: 'id INT PRIMARY KEY, version INT, created INT, edited INT, deleted INT, nickname TEXT, address TEXT, lat REAL, lon REAL',
    properties: '(id, version, created, edited, deleted, nickname, address, lat, lon)',
    values: '(?,?,?,?,?,?,?,?,?)', //9
    addLocation:function(id, version, created, edited, deleted, nickname, address, lat, lon) {
        // adds location from the server
	    this.parent.DB.transaction(function(tx) {
	                                   var id = parseInt(id, 10);
	                                   var created = parseInt(created, 10);
	                                   var edited = parseInt(edited, 10);
	                                   var latitude = parseInt(lat, 10);
	                                   var longitude = parseInt(lon, 10);                                       
	                                   var del = (deleted === 1 || deleted === true || deleted === "true") ? 1 : 0;
                                       var version = parseInt(version, 10) || 0;
                                       
	                                   tx.executeSql('INSERT INTO location VALUES' + this_.values + ';',
			                                         [id, version, created, edited, del, nickname, address, latitude, longitude],
			                                         function(tx, rs) { debug("LOCATION INSERT - location DB"); }
			                                        );
	                               });
    },
    
    addNewLocation:function(created, nickname, address, lat, lon) {
	    // Adds NEW location to DB, passes unique ID to continuation 
	    var this_ = this;
	    this.parent._getUniqueID('location', function (id) {
	                                  var version = 0;
	                                  var edited = created;
	                                  var deleted = 0;
	                                  // Insert location into database
	                                  this_.parent.DB.transaction(function(tx) {
		                                                              tx.executeSql('INSERT INTO location ' + this_.properties + ' VALUES' + this_.values + ';',
			                                                                        [id, version, created, edited, deleted, nickname, address, lat, lon],
			                                                                        function(tx, rs) { debug("LOCATION INSERT - location DB"); }
			                                                                       );
	                                                              });
	                                  continuation(id);
	                              });
    },

    deleteLocation:function(id) {
	    var this_ = this;
	    this.getLocationById(id, function (location) {
	                         if (location === null) { return; }
	                         this_.parent.DB.transaction(function(tx) {
		                                                     tx.executeSql(
		                                                         'INSERT OR REPLACE INTO location ' + this_.properties + ' VALUES' + this_.values + ';', 
                                                                 [id, location.version, location.created, location.edited, 1, location.nickname, location.address, location.lat, location.lon],
		                                                         function(tx, rs) { debug("DB: location-delete success"); }
		                                                     );
	                                                     }); 
	                     });	
    },

    getLocationById:function(id, continuation) {
	    // Passes location to continuation function if exists.
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql('SELECT * FROM location WHERE id=? LIMIT 1',[id],
			                                         function(tx, rs) {
			                                             if (rs.rows.length === 1) {
                                                             var isFirefox = jQuery.isArray(rs.rows.item);
                                                             if (isFirefox) {
				                                                 var location = rs.rows.item[0];
                                                             } else {
				                                                 var location = rs.rows.item(0);    
                                                             }

				                                             continuation(location);
			                                             } else { // No location
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

    getAllLocations:function(isDeleted, includeOrder, continuation) {
	    // Passes 'locations' to continuation
	    this.parent.DB.transaction(function(tx) {
	                                   tx.executeSql('SELECT * FROM location WHERE deleted = ? ORDER BY created DESC',
			                                         [(isDeleted) ? 1 : 0],
			                                         function(tx, rs) {
			                                             debug("DB: Starting to grab locations");
			                                             var locations = [];                     
                                                         var isFirefox = jQuery.isArray(rs.rows.item);
			                                             for (var i=0;i<rs.rows.length;i++) {
                                                             if (isFirefox) {
                                                                 var location = rs.rows.item[i];                         
                                                             } else {
				                                                 var location = rs.rows.item(i);                                                                 
                                                             }
                                                             
				                                             if (location.id === -1 && !includeOrder) {
				                                                 continue; // Skip special location
				                                             }

				                                             locations.push({
                                                                                id:location.id,
                                                                                version: location.version,
                                                                                edited: location.edited,
					                                                            nickname:location.contents,
                                                                                address: location.address,
                                                                                lat: location.lat,                                                                                
                                                                                lon: location.lon
                                                                        });
			                                             }
			                                             debug("DB: Finished grabbing locations.");
			                                             // Pass locations along 
			                                             continuation(locations);
			                                         });
	                               });
    },

    putAllLocationsInDB:function(locations) { 
	    // Put/update all location items into database
	    var sqlQuery = 'INSERT OR REPLACE INTO location ' + this.properties + ' VALUES' + this.values + ';';

        var attributes = locations.map(function(n){
	                                   var del = (n.deleted === true || n.deleted === 'true' || n.deleted === 1) ? 1 : 0;
	                                   return  [
		                                   n.id,
		                                   parseInt(n.version, 10),
		                                   parseInt(n.created, 10),
		                                   parseInt(n.edited, 10),
		                                   del,
		                                   n.nickname,
                                           n.address,
                                           parseIng(n.lat, 10),
                                           parseInt(n.lon, 10)
                                       ];
                                   });

	    // MUCH FASTER THIS WAY, ~ 1000 times faster (no seek time for each transaction!)
	    this.updateBatchLocations(sqlQuery, attributes);
    },

    updateBatchLocations:function(sqlQuery, locationAttributes) {
	    //debug("Batch Updating "+locationAttributes.length+" locations.");
	    this.parent.DB.transaction(function(tx) {
	                                   for (var i=0;i<locationAttributes.length;i++) {
		                                   tx.executeSql(sqlQuery, locationAttributes[i],
			                                             function(tx, rs) { // Successful row update
			                                             }, function(tx, error) {
				                                             debug("BAD _updateLocations");
			                                             });
	                                   }
	                               });
    }
};

