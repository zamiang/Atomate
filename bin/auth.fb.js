/**
 * Serverside feeder for grabbing facebook data and saving it into local storage
 *
 * @see extended permissions docs: http://developers.facebook.com/docs/authentication/permissions
 * this is what gets passed as 'perms' in FB.login
 *
 * @see graph api docs: http://developers.facebook.com/docs/api
 * used in the FB.api('/me/*...   
 */

window.fbAsyncInit = function() {
    // TEMPORARY
    //return false;

    var parent = Atomate.auth;
    FB.init({
	            appId: 122681067752275, //223573334338274;
		        status: true, 
		        cookie: true, 
		        xfbml: true, 
		        scope:"user_events,read_mailbox,read_friendlists"});

    FB.login(function(response) {
		         if (response.session) {
		             if (response.perms) {

			             parent.logProgress('logged in and about to start saving Facebook data');
			             //console.log("logged in perms", response.perms);

			             FB.api('/me/friends', function(response) {
				                    if (response.data !== undefined){
					                    var toSave = response.data.length;
					                    var saved = 0;
					                    
									    parent.logProgress('saving ' + toSave + ' people\'s Facebook profile');

                                        parent.fb_people_cache = [];
					                    parent.interval_map_lite(response.data, function(entry) { 
							                                         FB.api('/' + entry.id, function(response) {
								                                                if (response !== undefined){
									                                                //parent.logProgress('saving ' + response.name + '\'s Facebook profile');
									                                                Atomate.auth.Facebook.saveFriend(response); 
								                                                }
								                                                saved++;
								                                            });
						                                         }, function(){
                                                                     this.parent.database.person.putAllPeopleInDB(parent.fb_people_cache);
                                                                 });
				                    }				    
				                });

			             FB.api('/me/events', function(response) {
				                    if (response.data !== undefined){
					                    try {
                                            parent.fb_event_cache = [];
					                        parent.logProgress('saving ' + response.data.length + ' facebook events');
					                        parent.interval_map_lite(response.data, 
                                                                     function(entry) { Atomate.auth.Facebook.saveEvent(entry); },                                                                               
                                                                     this.parent.database.note.putAllNotesInDB(parent.fb_event_cache));
					                    } catch(x) { console.log(x); }
				                    }
				                });
			             
                         /*
			             FB.api('/me/inbox', function(response) {
				                    if (response.data !== undefined){
					                    parent.logProgress('saving ' + response.data.length + ' facebook messages');					                    
					                    parent.interval_map_lite(response.data, function(entry) { Atomate.auth.Facebook.saveMessage(entry); });
				                    }
				                });

			              FB.api('/me/feed', function(response) {
				          if (response.data !== undefined){
					      parent.logProgress('saving ' + response.data.length + ' facebook feed items');					                    
					      parent.interval_map_lite(response.data, function(entry) { Atomate.auth.Facebook.saveFeedEntry(entry); });
				          }
				          });

			              FB.api('/me/albums', function(response) {
                          // not working 
				          console.log("your albums", response); 
				          response.data.map(function(album){ 
				          FB.api('/' + album.id, function(photo_response) {
				          if (response !== undefined) {
			              console.log('photo_response');
			              console.log(photo_response);
				          parent.logProgress('saving ' + photo_response + ' facebook photos from album ' + album.id);
				          parent.interval_map_lite(photo_response.data, function(entry) { Atomate.auth.Facebook.savePhoto(entry, album); });
				          }
				          });
				          });
				          });
                          */
		             } else {
			             // user is logged in, but did not grant any permissions
			             parent.logProgress('<li>you did not grant permission for the Feeder</li>');
		             }
		         } else {
		             console.log("not logged in ");		
		         }
                 //user_photos,user_birthday,friends_birthday,user_relationships,friends_relationships, user_status,friends_status,read_stream,
	         }, {perms:'user_events,read_mailbox,read_friendlists'});
};

Atomate.auth.Facebook =  {
    parent: Atomate.auth,
    saveFriend: function(entry) {
        var start = entry.updated_time ? new Date(entry.updated_time.substring(0,entry.updated_time.length - 5)).valueOf() : new Date().valueOf();
        var id = "@" + (entry['first_name'] + entry['last name']).toLowerCase();
        id = id.split(' ').join('');
        this.parent.fb_person_cache.push({
			                                 jid: id,
			                                 fbid: entry.id,
			                                 name: entry.first_name,
                                             nickname: "",
			                                 modified: start,
                                             deleted: 0,
                                             edited:0,
                                             version:0,
			                                 created: new Date().valueOf(),
                                             url:entry.website,                                             
                                             priority: "",
                                             source:'Facebook',
                                             email1: "",
                                             email2: "",
                                             email3: ""

                                             //'relationship status': entry.relationship_status,			 
			                                 // birthday: entry.birthday // NOTE: this needs to be parsed -- issue: it seems to return inconsistent date formats                                            
			                                 // TODO: add location, hometown, work, education and relationships
		                                });
    },


    saveEvent: function(entry) {
        if (entry && entry.start_time && entry.end_time) {
            var start = new Date(entry.start_time.substring(0,entry.end_time.length - 5)).valueOf();
            var end = new Date(entry.end_time.substring(0,entry.end_time.length - 5)).valueOf();
                        
            this.parent.fb_event_cache.push({
			                                    jid: entry.id,                                                
                                                version:0,
                                                created: new Date().valueOf(),
                                                modified: new Date().valueOf(),
			                                    contents: entry.name + " http://www.facebook.com/event.php?eid=" + entry.id + " #facebook",
                                                tags: "#facebook",
                                                type: 'event',
			                                    source: 'Facebook',
			                                    reminder: this.parent.makeSpecificDateTime(start)
			                                    //"end time": this.parent.makeSpecificDateTime(end),
			                                    //location: entry.location
		                                    });
        }
    }

/**
    savePhoto: function(entry) {
        // STILL TESTING
        console.log(entry);
        var start = entry.updated_time ? new Date(entry.updated_time.substring(0,entry.updated_time.length - 5)).valueOf() : new Date().valueOf();    
        
        this.parent.saveItem({
			                     type:"schemas.Photo",
			                     id : p.id,
			                     name: p.title._content,
			                     source: "facebook",
			                     'date uploaded':this.parent.makeSpecificDateTime(start),
			                     'created time': this.parent.makeSpecificDateTime(start),
			                     'user id': p.owner.nsid,
			                     username: p.owner.username,
			                     //location: p.owner.location,
			                     //description: p.description._content,
			                     person: {fbid: entry.from.id }
		                     });

    },

    saveFeedEntry: function(entry) {
        var start = entry.updated_time ? new Date(entry.updated_time.substring(0,entry.updated_time.length - 5)).valueOf() : new Date().valueOf();
        this.parent.saveItem({
			                     id: "facebook_status" + entry.id,
		                         type:"schemas.StatusUpdate",
			                     text: entry.description,
			                     sender: {fbid: entry.from.id},
			                     link: entry.link,
			                     icon: entry.icon,
			                     name: entry.name,
			                     picture: entry.picture,
		                         'status type': entry.type,
			                     'created time': this.parent.makeSpecificDateTime(start)					  
		                     });
    },

    saveMessage: function(entry) {
        // filtering out messages from facebook events
        if (entry && entry.from && 'star_time' in entry.from){
            var start = new Date(entry.updated_time.substring(0,entry.updated_time.length - 5)).valueOf();
            
            this.parent.saveItem({
			                         type:"schemas.Email",
			                         id: entry.id,
			                         source: 'Facebook',
			                         subject: entry.subject, 
			                         message: entry.message, 
			                         "sent time": this.parent.makeSpecificDateTime(start),
			                         sender: {fbid: entry.from.id }
		                         });
        }    
    }
*/
};