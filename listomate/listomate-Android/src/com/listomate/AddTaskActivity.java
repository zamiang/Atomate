package com.listomate;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.DatePicker;
import android.widget.TextView;
import android.widget.TimePicker;

public class AddTaskActivity extends Activity {

	private DatePicker datePicker;
	private TimePicker timePicker;
	private TextView detailsTextView;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		setContentView(R.layout.addnote);

		datePicker = (DatePicker) findViewById(R.id.datePicker);
		timePicker = (TimePicker) findViewById(R.id.timePicker);

		detailsTextView = (TextView) findViewById(R.id.detailsText);
	}

	public void onSave(View view) {
		String taskName = detailsTextView.getText().toString();
		if (taskName.length() > 0) {
			Intent t = new Intent();
			t.putExtra("task", taskName);
			t.putExtra("text", detailsTextView.getText().toString());

			t.putExtra("day", datePicker.getDayOfMonth());
			t.putExtra("month", datePicker.getMonth());
			t.putExtra("year", datePicker.getYear());

			t.putExtra("hour", timePicker.getCurrentHour());
			t.putExtra("minute", timePicker.getCurrentMinute());

			setResult(Activity.RESULT_OK, t);
		} else {
			setResult(Activity.RESULT_CANCELED);
		}

		finish();
	}

	public void onCancel(View view) {
		setResult(Activity.RESULT_CANCELED);

		finish();
	}
}
