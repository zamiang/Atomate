package com.listomate;

import java.util.ArrayList;
import java.util.List;

import android.os.AsyncTask;

import com.listomate.activities.ListomateActivity;
import com.listomate.shared.CloudTasksRequestFactory;
import com.listomate.shared.NoteProxy;
import com.google.web.bindery.requestfactory.shared.Receiver;

public class AsyncFetchNote extends AsyncTask<Long, Void, List<NoteProxy>> {

    private final ListomateActivity activity;
    private boolean newTask = false;

    public AsyncFetchNote(ListomateActivity activity) {
        super();
        this.activity = activity;
    }

    @Override
    protected List<NoteProxy> doInBackground(Long... arguments) {
        final List<NoteProxy> list = new ArrayList<NoteProxy>();

        // INSERT RPC HERE!
        CloudTasksRequestFactory factory = Util.getRequestFactory(activity,
        		CloudTasksRequestFactory.class);
        
        if (arguments.length == 0 || arguments[0] == -1) {
	        factory.taskRequest().queryNotes().fire(new Receiver<List<NoteProxy>>() {
				@Override
				public void onSuccess(List<NoteProxy> arg0) {
					list.addAll(arg0);
				}
	        });
        } else {
        	newTask = true;
        	factory.taskRequest().readNote(arguments[0]).fire(new Receiver<NoteProxy>() {

				@Override
				public void onSuccess(NoteProxy arg0) {
					list.add(arg0);
				}
			});
        }

        return list;
    }

    @Override
    protected void onPostExecute(List<NoteProxy> result) {
    	if (newTask) {
    		activity.addNotes(result);
    	} else {
    		activity.setNotes(result);
    	}
    }
}
