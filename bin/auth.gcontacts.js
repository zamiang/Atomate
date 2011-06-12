/*
 *  auth with google contacts
 *  http://code.google.com/apis/contacts/docs/1.0/developers_guide_js.html
 * 
 */


Atomate.auth.GoogleContacts = {
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
        var query = new google.gdata.contacts.ContactQuery(this.contactsFeedUri);
        
        query.setMaxResults(500);
        contactsService.getContactFeed(query, this.callback, handleError);
    },
    
	callback: function(result) {
		showMessage('got a contacts callback');

        var entries = result.feed.entry;
     
		entries.map(function(entry){
						saved++;
                        
                        var contactEntry = entries[i];
                        var emailAddresses = contactEntry.getEmailAddresses();
                        
                        for (var j = 0; j < emailAddresses.length; j++) {
                            var emailAddress = emailAddresses[j].getAddress();
                            console.log('email = ' + emailAddress);
                        }  
					  });
	}
};
