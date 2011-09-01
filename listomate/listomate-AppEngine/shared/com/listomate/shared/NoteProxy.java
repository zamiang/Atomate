package com.listomate.shared;

import java.util.Date;

import com.google.web.bindery.requestfactory.shared.ProxyForName;
import com.google.web.bindery.requestfactory.shared.ValueProxy;

@ProxyForName(value = "com.listomate.server.Task", locator = "com.listomate.server.TaskLocator")
public interface NoteProxy extends ValueProxy {

	Date getDueDate();

	String getEmailAddress();

	Long getId();

	String getName();

	Boolean isDone();

	String getUserId();

	String getNote();

	void setDueDate(Date dueDate);

	void setEmailAddress(String emailAddress);

	void setName(String name);

	void setNote(String note);

	void setDone(Boolean done);

	void setUserId(String userId);

}
