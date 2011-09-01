package com.listomate;

import java.util.Date;

import com.listomate.shared.NoteProxy;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.text.format.DateFormat;
import android.widget.TextView;

public class ViewNoteActivity extends Activity {
	private java.text.DateFormat dateFormat;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		dateFormat = DateFormat.getDateFormat(this);

		setContentView(R.layout.viewtask);

		// get the task to display.
		Intent intent = getIntent();
		int position = intent.getIntExtra("position", -1);

		if (position != -1) {
			NoteApplication taskApplication = (NoteApplication) getApplication();
			NoteAdapter adapter = taskApplication.getAdapter(this);

			NoteProxy task = adapter.get(position);

			if (task != null) {
				String name = task.getName();
				if (name != null) {
					TextView titleText = (TextView) findViewById(R.id.titleText);
					titleText.setText(name);
				}

				String notes = task.getNote();
				if (notes != null) {
					TextView detailsText = (TextView) findViewById(R.id.detailsText);
					detailsText.setText(notes);
				}

				Date dueDate = task.getDueDate();
				if (dueDate != null) {
					TextView dueDateText = (TextView) findViewById(R.id.dateText);
					dueDateText.setText(dateFormat.format(dueDate));
				}
			}
		}
	}
}
