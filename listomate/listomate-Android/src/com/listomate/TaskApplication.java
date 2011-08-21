package com.listomate;

import java.util.regex.Pattern;

import com.listomate.shared.TaskChange;

import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

public class TaskApplication extends Application {

    interface TaskListener {
        void onTaskUpdated(String message, long id);
    }

    private TaskListener listener;
    private TaskAdapter adapter;

    public void setTaskListener(TaskListener listener) {
        this.listener = listener;
    }

    public TaskAdapter getAdapter(Context context) {
        if (adapter == null) {
            adapter = new TaskAdapter(context);
        }

        return adapter;
    }

    public void notifyListener(Intent intent) {
        if (listener != null) {
            Bundle extras = intent.getExtras();
            if (extras != null) {
                String message = (String) extras.get("message");
                String[] messages = message.split(Pattern
                        .quote(TaskChange.SEPARATOR));
                listener.onTaskUpdated(messages[0], Long.parseLong(messages[1]));
            }
        }
    }
}
