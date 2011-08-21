package com.listomate.server;

import com.google.gdata.client.*;
import com.google.gdata.client.authn.oauth.GoogleOAuthParameters;
import com.google.gdata.client.calendar.*;
import com.google.gdata.data.*;
import com.google.gdata.data.acl.*;
import com.google.gdata.data.calendar.*;
import com.google.gdata.data.extensions.*;
import com.google.gdata.util.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

import javax.servlet.http.HttpServletResponse;

public class GcalInterface extends GdataInterface {
	
	static void update(GoogleOAuthParameters oauthParameters, HttpServletResponse resp) throws IOException, ServiceException {

		URL feedUrl = null;
		try {
			feedUrl = new URL(CALENDAR_URL);
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		// Mark the feed as an Event feed:
		new EventFeed().declareExtensions(myService.getExtensionProfile());

		// Send the request and receive the response:
		Feed myFeed = myService.getFeed(feedUrl, Feed.class);
	}

	static void postCalendarEvent() throws IOException, ServiceException {
		URL postUrl = new URL(
				"http://www.google.com/calendar/feeds/liz@gmail.com/private/full");
		EventEntry myEntry = new EventEntry();

		myEntry.setTitle(new PlainTextConstruct("Tennis with Darcy"));
		myEntry.setContent(new PlainTextConstruct("Meet for a quick lesson."));

		Person author = new Person("Elizabeth Bennet", null, "liz@gmail.com");
		myEntry.getAuthors().add(author);

		DateTime startTime = DateTime
				.parseDateTime("2006-04-17T15:00:00-08:00");
		DateTime endTime = DateTime.parseDateTime("2006-04-17T17:00:00-08:00");
		When eventTimes = new When();
		eventTimes.setStartTime(startTime);
		eventTimes.setEndTime(endTime);
		myEntry.addTime(eventTimes);

		// Send the request and receive the response:
		EventEntry insertedEntry = myService.insert(postUrl, myEntry);
	}
}
