package com.listomate.activities;

import com.listomate.NoteAdapter;
import com.listomate.NoteApplication;
import com.listomate.R;
import com.listomate.shared.NoteProxy;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;

public class EditNoteActivity extends Activity {

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		setContentView(R.layout.editnote);

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
			}
		}
	}
}
