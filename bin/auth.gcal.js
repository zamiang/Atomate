/*
 * auth with google calendar
 * http://code.google.com/apis/calendar/data/2.0/developers_guide_protocol.html
 */


showMessage = function(a) {
    console.log(a);
};

Atomate.auth.GoogleCalendar = {
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
		showMessage('about to get feed: ' + this.feedUri);
		
		var query = new google.gdata.calendar.CalendarEventQuery(this.feedUri);
		query.setMaxResults(1000);
		calendarService.getEventsFeed(query, this.callback, handleError);
	},
    
	callback: function(result) {
		showMessage('got a calendar callback');        
		var calendars = result.feed.entry;
        
		calendars.map(function(entry){
						  var query = new google.gdata.calendar.CalendarEventQuery(entry.content.src);
						  query.setMaxResults(1000);
                          
						  calendarService.getEventsFeed(query, Atomate.auth.GoogleCalendar.entryCallback, handleError);
					  });
		
	},

    // this gets used as the callback for calendarService.getEventsFeed 
    // it formats and saves each event in that calendar
    entryCallback:  function(result) {
        showMessage('saving calendar: ' + calendar);    
        
        var calendar = result.feed.title.$t;
        
        interval_map(result.feed.entry, function(entry){
		                 try {
			                 if (entry.getTimes()[0]){
			                     var start = new Date(entry.getTimes()[0].getStartTime().date).valueOf();
			                     var end = new Date(entry.getTimes()[0].getEndTime().date).valueOf();
			                     
			                     showMessage('saving: ' + entry.getTitle().getText());
			                     Atomate.auth.saveItem({
						                                   type:"schemas.Event",
						                                   id: entry.id.$t,
						                                   name: entry.getTitle().getText(),
						                                   link: entry.getHtmlLink() ? entry.getHtmlLink().getHref() : undefined,
						                                   calendar: calendar,
						                                   "start time": makeSpecificDateTime(start),
						                                   "end time": makeSpecificDateTime(end),
						                                   authors: entry.getAuthors().map(function(x){ if(x.email) {return " " + x.email.getValue()} }),
						                                   participants: entry.getParticipants().map(function(x){ return " " + x.email }) // Feeder will search for people with this email
                                                           
						                                   // TODO: locations
						                                   //locations: entry.getLocations().map(JV3.schemas.Location.fromGWhere),
						                                   //location: entry.getLocations().map(JV3.schemas.Location.fromGWhere).length > 0 ? entry.getLocations().map(JV3.schemas.Location.fromGWhere)[0] : undefined,
						                                   //geoLocation: entry.getGeoLocation()
					                                   });
			                 }
		                 } catch(e) { JV3.log(e); }
		             });
    }
};