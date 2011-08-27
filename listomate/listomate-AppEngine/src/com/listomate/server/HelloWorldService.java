package com.listomate.server;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

import java.util.Date;
import java.util.logging.Logger;

public class HelloWorldService {

	private static final Logger log = Logger.getLogger(HelloWorldService.class.getName());

	public HelloWorldService() {}

	public static String getMessage() {
		UserService userService = UserServiceFactory.getUserService();
		User user = userService.getCurrentUser();
		String message;
		if (user == null) {
			message = "No one is logged in!\nSent from App Engine at "
					+ new Date();
		} else {
			message = "Hello, " + user.getEmail()
					+ "!\nSent from App Engine at " + new Date();
		}
		log.info("Returning message \"" + message + "\"");
		return message;
	}
}
