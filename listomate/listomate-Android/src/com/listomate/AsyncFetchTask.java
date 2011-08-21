package com.listomate;

import java.util.ArrayList;
import java.util.List;

import android.os.AsyncTask;

import com.listomate.shared.CloudTasksRequestFactory;
import com.listomate.shared.TaskProxy;
import com.google.web.bindery.requestfactory.shared.Receiver;

public class AsyncFetchTask extends AsyncTask<Long, Void, List<TaskProxy>> {

    private final CloudTasksActivity activity;
    private boolean newTask = false;

    public AsyncFetchTask(CloudTasksActivity activity) {
        super();
        this.activity = activity;
    }

    @Override
    protected List<TaskProxy> doInBackground(Long... arguments) {
        final List<TaskProxy> list = new ArrayList<TaskProxy>();

        // INSERT RPC HERE!
        CloudTasksRequestFactory factory = Util.getRequestFactory(activity,
        		CloudTasksRequestFactory.class);
        
        if (arguments.length == 0 || arguments[0] == -1) {
	        factory.taskRequest().queryTasks().fire(new Receiver<List<TaskProxy>>() {
				@Override
				public void onSuccess(List<TaskProxy> arg0) {
					list.addAll(arg0);
				}
	        });
        } else {
        	newTask = true;
        	factory.taskRequest().readTask(arguments[0]).fire(new Receiver<TaskProxy>() {

				@Override
				public void onSuccess(TaskProxy arg0) {
					list.add(arg0);
				}
			});
        }

        return list;
    }

    @Override
    protected void onPostExecute(List<TaskProxy> result) {
    	if (newTask) {
    		activity.addTasks(result);
    	} else {
    		activity.setTasks(result);
    	}
    }
}
