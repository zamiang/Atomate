package com.listomate.shared;

import java.util.List;

import com.google.web.bindery.requestfactory.shared.Request;
import com.google.web.bindery.requestfactory.shared.RequestContext;
import com.google.web.bindery.requestfactory.shared.ServiceName;

@ServiceName("com.listomate.server.CloudTasksService")
public interface NoteRequest extends RequestContext {

	Request<NoteProxy> createNote();

	Request<NoteProxy> readNote(Long id);

	Request<NoteProxy> updateNote(NoteProxy task);

	Request<Void> deleteNote(NoteProxy task);

	Request<List<NoteProxy>> queryNotes();
}
