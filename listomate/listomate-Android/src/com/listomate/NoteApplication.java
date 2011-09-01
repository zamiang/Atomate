package com.listomate;

import java.util.regex.Pattern;

import com.listomate.shared.NoteChange;

import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

public class NoteApplication extends Application {

    interface TaskListener {
        void onTaskUpdated(String message, long id);
    }

    private TaskListener listener;
    private NoteAdapter adapter;

    public void setTaskListener(TaskListener listener) {
        this.listener = listener;
    }

    public NoteAdapter getAdapter(Context context) {
        if (adapter == null) {
            adapter = new NoteAdapter(context);
        }

        return adapter;
    }

    public void notifyListener(Intent intent) {
        if (listener != null) {
            Bundle extras = intent.getExtras();
            if (extras != null) {
                String message = (String) extras.get("message");
                String[] messages = message.split(Pattern
                        .quote(NoteChange.SEPARATOR));
                listener.onTaskUpdated(messages[0], Long.parseLong(messages[1]));
            }
        }
    }
}
