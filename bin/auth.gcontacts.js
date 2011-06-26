/*
 *  auth with google contacts
 *  http://code.google.com/apis/contacts/docs/1.0/developers_guide_js.html
 * 
 */

Atomate.auth.gcontacts = {
    parent: Atomate.auth,
    feedUri: 'https://www.google.com/m8/feeds/contacts/default/full',
    initialize: function() {
	    try {
	        showMessage('logged in and about to start saving from Google contacts');
	        this.getMyContacts();
	    } catch (x) {
	        showMessage(x);
	    }
    },
    
    getMyContacts: function() {
        var query = new google.gdata.contacts.ContactQuery(this.feedUri);
        
        query.setMaxResults(500);

	    /*
	     Useful!
	     // Set up the query to retrieve all contacts that has been modifed since today
	     var today = new Date();
	     var updatedMin = new google.gdata.DateTime(today, true);
	     query.setUpdatedMin(updatedMin);
	     // Sort result set with descending order
	     query.setSortOrder('descending');
	     */
        ContactsService.getContactFeed(query, this.callback, handleError);
    },
    
    callback: function(result) {
	    showMessage('got a contacts callback');

	    var now = new Date().valueOf();
	    var parent = Atomate.auth;
        var entries = result.feed.entry;

	    var contacts = entries.map(function(entry){
		                               var start = entry.getUpdated() ? new Date(entry.getUpdated().getValue().getDate().format()).valueOf() : now;
		                               var emailAddresses = entry.getEmailAddresses().map(function(e){ return e.getAddress(); });
		                               var name = entry.getTitle().getText().split(' ');
		                               var photoUrl = entry.getContactPhotoLink() ? entry.getContactPhotoLink().href : undefined; // useless :(
		                               var birthday = entry.getBirthday() ? entry.getBirthday().getWhen() : undefined;
		                               var websites = entry.getWebsites().map(function(w){ return w.href; });
		                               var contact = {
		                                   'type':'schemas.Person',
		                                   'id': entry.id.getValue(),
		                                   'first name': name[0],
		                                   'last name': name[name.length - 1],
		                                   'nickname' :entry.getNickname,
		                                   'email addresses': emailAddresses,
		                                   'photo url': photoUrl,
		                                   'gender': entry.getGender(),
		                                   'url': entry.id.getValue(),
		                                   'websites': websites,
		                                   'priority':entry.getPriority(),
		                                   'last updated': parent.makeSpecificDateTime(start),
		                                   'birthday': birthday
		                               };
		                               parent.saveItem(contact);
		                               return contact;
	                               });
	    showMessage('just saved ' + contacts.length + ' contacts from Google Contacts');
    }
};
