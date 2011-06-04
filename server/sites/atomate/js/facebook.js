
/**
 * Serverside feeder for grabbing facebook data and saving it into local storage
 *
 * @see extended permissions docs: http://developers.facebook.com/docs/authentication/permissions
 * this is what gets passed as 'perms' in FB.login
 *
 * @see graph api docs: http://developers.facebook.com/docs/api
 * used in the FB.api('/me/*...   
*/

var client_id = 122681067752275;
var redir_url = "http://atomate.me/facebook/";
var div = jQuery('#loading').find('ul');
var THISDOCUMENT = self;

window.fbAsyncInit = function() {
    FB.init({
	    appId: '122681067752275', 
	    status: true, 
	    cookie: true, 
	    xfbml: true, 
	    scope:"user_events,user_photos,user_status,friends_status,user_birthday,friends_birthday,user_relationships,friends_relationships,read_stream"});

    FB.login(function(response) {
		 if (response.session) {
		     if (response.perms) {
			 div.append('<li>logged in and about to start saving from Facebook</li>');
			 //console.log("logged in perms", response.perms);

			 FB.api('/me/friends', function(response) {
				    if (response.data !== undefined){
					let toSave = response.data.length;
					let saved = 0;
					
					interval_map(response.data, function(entry) { 
							 FB.api('/' + entry.id, function(response) {
								    if (response !== undefined){
									div.append('<li>saving ' + response.name + '\'s facebook profile</li>');
									saveFriend(response); 
								    }
								    saved++;
								});
						     });
				    }				    
				});
			 FB.api('/me/events', function(response) {
				    if (response.data !== undefined){
					try {
					    div.append('<li>saving ' + response.data.length + ' facebook events</li>');

					    interval_map(response.data, function(entry) { saveEvent(entry); });
					} catch(x) { console.log(x); }
				    }
				});
			 
			 FB.api('/me/inbox', function(response) {
				    if (response.data !== undefined){
					div.append('<li>saving ' + response.data.length + ' facebook messages</li>');
					
					interval_map(response.data, function(entry) { saveMessage(entry); });
				    }
				});
			 
			 FB.api('/me/feed', function(response) {
				    if (response.data !== undefined){
					div.append('<li>saving ' + response.data.length + ' facebook feed items</li>');
					
					interval_map(response.data, function(entry) { saveFeedEntry(entry); });
				    }
				});
			 
			 FB.api('/me/albums', function(response) {
				    /* 
				     * still looking into how to save facebook photos
				     console.log("your albums",response); 
				     response.data.map(function(entry){ 
				     FB.api('/' + entry.id, function(response) {
				     if (response !== undefined){
				     //console.log(response);
				     div.append('<li>saving ' + response.data.length + ' facebook photos from album ' + entry.id + '</li>');
				     //interval_map(response.data, function(entry) { savePhoto(entry); });
				     }
				     });
				     });
				     */
				});
		     } else {
			 // user is logged in, but did not grant any permissions
			 div.append('<li>you did not grant permission for the Feeder</li>');
		     }
		 } else {
		     console.log("not logged in ");		
		 }
	     }, {perms:'user_events,read_mailbox,read_stream,offline_access,read_friendlists ,user_events, user_status,friends_status, user_birthday,friends_birthday, user_photos'});
};

let savePhoto = function(entry) {
    // STILL TESTING
    console.log(entry);
    let start = entry.updated_time ? new Date(entry.updated_time.substring(0,entry.updated_time.length - 5)).valueOf() : new Date().valueOf();    

    JV3.Atomate.save({
			 type:"schemas.Photo",
			 id : p.id,
			 name: p.title._content,
			 source: "facebook",
			 'date uploaded':makeSpecificDateTime(start),
			 'created time': makeSpecificDateTime(start),
			 'user id': p.owner.nsid,
			 username: p.owner.username,
			 location: p.owner.location,
			 description: p.description._content,
			 person: {fbid: entry.from.id }
		     });

};

let saveFeedEntry = function(entry) {
    let start = entry.updated_time ? new Date(entry.updated_time.substring(0,entry.updated_time.length - 5)).valueOf() : new Date().valueOf();
    JV3.Atomate.save({
			 id: "facebook_status" + entry.id,
		         type:"schemas.StatusUpdate",
			 text: entry.description,
			 sender: {fbid: entry.from.id},
			 link: entry.link,
			 icon: entry.icon,
			 name: entry.name,
			 picture: entry.picture,
		         'status type': entry.type,
			 'created time': makeSpecificDateTime(start)					  
		     });

};


let saveFriend = function(entry) {
    let start = entry.updated_time ? new Date(entry.updated_time.substring(0,entry.updated_time.length - 5)).valueOf() : new Date().valueOf();
    JV3.Atomate.save({
			 type:'schemas.Person',
			 id: entry.id,
			 fbid: entry.id,
			 'first name': entry.first_name,
			 'last name': entry.last_name,
			 about: entry.about,
			 gender: entry.gender,
			 'facebook url': entry.link,
			 url: entry.website,
			 timezone: entry.timezone,
			 'relationship status': entry.relationship_status,			 
			 'last updated': makeSpecificDateTime(start),
			 birthday: entry.birthday // NOTE: this needs to be parsed -- issue: it seems to return inconsistent date formats

			 // TODO: add location, hometown, work, education and relationships
		     });
};


let saveEvent = function(entry) {
    let start = new Date(entry.start_time.substring(0,entry.end_time.length - 5)).valueOf();
    let end = new Date(entry.end_time.substring(0,entry.end_time.length - 5)).valueOf();

    JV3.Atomate.save({
			 type:"schemas.Event",
			 id: entry.id,
			 name: entry.name,
			 source: 'Facebook',
			 "start time": makeSpecificDateTime(start),
			 "end time": makeSpecificDateTime(end),
			 location: entry.location
		     });
};

let saveMessage = function(entry) {
    // filtering out messages from facebook events
    if (entry.from.start_time !== undefined){ return; }

    let start = new Date(entry.updated_time.substring(0,entry.updated_time.length - 5)).valueOf();

    JV3.Atomate.save({
			 type:"schemas.Email",
			 id: entry.id,
			 source: 'Facebook',
			 subject: entry.subject, 
			 message: entry.message, 
			 "sent time": makeSpecificDateTime(start),
			 sender: {fbid: entry.from.id }
		     });
};

// Facebook initialize
(function() {
     var e = document.createElement('script');
     e.type = 'text/javascript';
     e.src = document.location.protocol +
	 '//connect.facebook.net/en_GB/all.js';
     e.async = true;
     document.getElementById('fb-root').appendChild(e);
 }());

