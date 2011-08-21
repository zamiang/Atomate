package com.listomate.server;

import com.google.gdata.client.GoogleService;

public class GdataInterface {
	public static String CONSUMER_KEY = "listomate.appspot.com";
	public static String CONSUMER_SECRET = "ZFl4A2x7pzrO7nebG1dLTGMj";
	public static String APPNAME = "Atomate-server";

	public static String DOCS_URL = "https://docs.google.com/feeds/default/private/full";
	public static String CONTACTS_URL = "https://www.google.com/m8/feeds/contacts/full";
	public static String CALENDAR_URL = "http://www.google.com/calendar/feeds/private/full";

	public static String OAUTH_CALLBACK = "http://listomate.appspot.com/step2";
	
	public static String SCOPE = "https://docs.google.com/feeds/ "
			+ "http://www.google.com/calendar/feeds/ "
			+ "http://www.google.com/calendar/feeds/default/allcalendars/full "
			+ "https://www.google.com/m8/feeds/ "
			+ "https://www.google.com/m8/feeds/contacts/default/full";
	
	public static GoogleService myService = new GoogleService("cl", APPNAME);
}
