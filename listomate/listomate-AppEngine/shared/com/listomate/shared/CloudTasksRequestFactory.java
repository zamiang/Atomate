package com.listomate.shared;

import com.google.web.bindery.requestfactory.shared.RequestFactory;


public interface CloudTasksRequestFactory extends RequestFactory {

	NoteRequest taskRequest();

}
