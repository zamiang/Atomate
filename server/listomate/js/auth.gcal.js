/*
 * auth with google calendar
 * http://code.google.com/apis/calendar/data/2.0/developers_guide_protocol.html
 * CalendarService is a global
 */

Atomate.auth.gcal = {
    parent: Atomate.auth,
    feedUri: 'http://www.google.com/calendar/feeds/default/allcalendars/full',

    initialize: function() {
		try {
			showMessage('logged in and about to start saving from Google Calendar');
            
			this.getMyFeed();
		} catch (x) {
			showMessage(x);
		}
	},
    
	getMyFeed: function() {
		var query = new google.gdata.calendar.CalendarEventQuery(this.feedUri);
		query.setMaxResults(1000);
		CalendarService.getEventsFeed(query, this.callback, handleError);
	},
    
	callback: function(result) {
		var calendars = result.feed.entry;
        
		calendars.map(function(entry){
			              var query = new google.gdata.calendar.CalendarEventQuery(entry.content.src);
			              query.setMaxResults(1000);
                          
			              CalendarService.getEventsFeed(query, Atomate.auth.gcal.entryCallback, handleError);
		              });
		
	},
    
    // this gets used as the callback for CalendarService.getEventsFeed 
    // it formats and saves each event in that calendar
    entryCallback:  function(result) {        
	    var parent = Atomate.auth;
        var calendarName = result.feed.title.$t;
        var calendarNameTag = calendarName.split(' ').join('').toLowerCase().replace(/[\.,-\/#!$%\^&\*;:{}=\-_@`'~()]/g,"");
	    var calendarLink = result.feed.getLink().href;
	    var now = new Date().valueOf();
        var calendarCache = [];
   	    showMessage('saving upcomming events from: <a href="' + calendarLink + '" target="_blank">' + calendarName + "</a>");    

        if (calendarName == "US Holidays") {
            return;
        }
        
        Atomate.util.interval_map(result.feed.entry, function(entry){
		                              try {
			                              if (entry.getTimes()[0]){
			                                  var start = new Date(entry.getTimes()[0].getStartTime().date).valueOf(); // ewwwwwww
			                                  var end = new Date(entry.getTimes()[0].getEndTime().date).valueOf();
                                              var link = entry.getHtmlLink() ? entry.getHtmlLink().getHref() : undefined;
                                              var contents = entry.getTitle().getText() + " #gcal" + " #" + calendarNameTag;
					                          // do not save events in the past
					                          if (end < now) { return; };
			                           
			                                  calendarCache.push({
			                                                         jid: Atomate.util.Base64.encode(contents).slice(0,30),
                                                                     version:0,
                                                                     created: now, 
                                                                     modified: 0, 
			                                                         contents: contents,
                                                                     tags: "#gcal #" + calendarNameTag,
                                                                     type: 'event',
			                                                         source: 'Google',
							                                         reminder: start
                                                                     
                                                                     // TODO:
                                                                     // link:link,
							                                         //authors: entry.getAuthors().map(function(x){ if(x.email) {return " " + x.email.getValue()} }),
							                                         //participants: entry.getParticipants().map(function(x){ return " " + x.email }) // Feeder will search for people with this email
 							                                         //link: entry.getHtmlLink() ? entry.getHtmlLink().getHref() : undefined,
							                                         //calendarName: calendarName,
							                                         //calendarLink: calendarLink,
							                                         //"end time": parent.makeSpecificDateTime(end),
                                                                     
							                                         // TODO: locations
							                                         //locations: entry.getLocations().map(JV3.schemas.Location.fromGWhere),
							                                         //location: entry.getLocations().map(JV3.schemas.Location.fromGWhere).length > 0 ? entry.getLocations().map(JV3.schemas.Location.fromGWhere)[0] : undefined,
							                                         //geoLocation: entry.getGeoLocation()
							                                        });
			                              }
		                              } catch(e) { handleError(e); }
	                              }, function() {
                                      console.log('about to save gcal events');                                                                     
                                      Atomate.database.notes.putAllNotesInDB(calendarCache);
                                  });
    }
};