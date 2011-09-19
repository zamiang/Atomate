package com.listomate.activities;

import java.util.Calendar;

import com.listomate.R;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DatePickerDialog;
import android.app.DatePickerDialog.OnDateSetListener;
import android.app.Dialog;
import android.app.TimePickerDialog;
import android.app.TimePickerDialog.OnTimeSetListener;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.TextView;
import android.widget.TimePicker;

public class AddNoteActivity extends Activity {
	private static final String TAG = "AddNoteActivity";

	private TextView detailsTextView;

	private static final int ADD_REMINDER_DIALOG_ID = 0;
	private static final int ADD_LOCATION_DIALOG_ID = 1;
	private static final int ADD_TIME_DIALOG_ID = 3;

	protected static final int PICK_CONTACT = 0;

	private static int mYear;
	private String text;

	private int mMonth;
	private int mDay;

	private int mHour;
	private int mMinute;

	private boolean reminder = false;


	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		setContentView(R.layout.addnote);
		
		initializeValues(savedInstanceState, getIntent().getExtras());
		initializeButtons();
		
		if (text != null) {
			Log.d(TAG, text);
		}

		// forces the keyboard open
		InputMethodManager imm = (InputMethodManager) this.getBaseContext()
				.getSystemService(Context.INPUT_METHOD_SERVICE);
		imm.toggleSoftInput(InputMethodManager.SHOW_FORCED, 0);

		detailsTextView = (TextView) findViewById(R.id.detailsText);
	}
	
	public void initializeValues(Bundle savedInstanceState, Bundle extras) {
		if (savedInstanceState != null && savedInstanceState.getBoolean("reminder") == true) {
			mYear = savedInstanceState.getInt("mYear");
			mMonth = savedInstanceState.getInt("mYear");
			mDay = savedInstanceState.getInt("mYear");
			mMinute = savedInstanceState.getInt("mYear");
			mHour = savedInstanceState.getInt("mYear");
			reminder = true;
			
		} else if (extras != null && extras.getBoolean("reminder") == true) {
			mYear = extras.getInt("mYear");
			mMonth = extras.getInt("mYear");
			mDay = extras.getInt("mYear");
			mMinute = extras.getInt("mYear");
			mHour = extras.getInt("mYear");
			reminder = true;
			
		} else {		
			// get the current date
			final Calendar c = Calendar.getInstance();
			mYear = c.get(Calendar.YEAR);
			mMonth = c.get(Calendar.MONTH);
			mDay = c.get(Calendar.DAY_OF_MONTH);
			mMinute = c.get(Calendar.MINUTE);
			mHour = c.get(Calendar.HOUR_OF_DAY);
		}

		if (savedInstanceState != null && savedInstanceState.getString("text") != null) {
			text = savedInstanceState.getString("text");
		} else if (extras!= null && extras.getString("text") != null) {
			text = extras.getString("text");
		}
	}

	public void initializeButtons() {
		// initialize buttons near the keyboard
		Button datePicker = (Button) findViewById(R.id.add_reminder_button);
		datePicker.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				showDialog(ADD_REMINDER_DIALOG_ID);
			}
		});

		Button personPicker = (Button) findViewById(R.id.add_person_button);
		personPicker.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				Intent myIntent = new Intent(getBaseContext(), PickContactActivity.class);
				startActivityForResult(myIntent, PICK_CONTACT);
			}
		});

		Button locationPicker = (Button) findViewById(R.id.add_location_button);
		locationPicker.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				showDialog(ADD_LOCATION_DIALOG_ID);
			}
		});		
	}
	
	@Override
	protected Dialog onCreateDialog(int id) {
		switch (id) {
		case ADD_REMINDER_DIALOG_ID:
			return new DatePickerDialog(this, mDateSetListener, mYear, mMonth,
					mDay);
		case ADD_TIME_DIALOG_ID:
			return new TimePickerDialog(this, mMinSetListener, mHour, mMinute,
					false);

		case ADD_LOCATION_DIALOG_ID:
			final CharSequence[] items = { "Current Location", "Bar", "Baz" };

			AlertDialog.Builder builder = new AlertDialog.Builder(this);

			builder.setTitle(R.string.location_prompt).setItems(items,
					new DialogInterface.OnClickListener() {
						public void onClick(DialogInterface dialog, int item) {
							setLocation(items[item].toString());
						}
					});

			AlertDialog alert = builder.create();
			return alert;
		}
		return null;
	}
	
	public void onSave(View view) {
		String text = detailsTextView.getText().toString();
		if (text.length() > 0) {
			Intent t = new Intent();
			t.putExtra("text", text);

			t.putExtra("day", mDay);
			t.putExtra("month", mMonth);
			t.putExtra("year", mYear);

			t.putExtra("hour", mHour);
			t.putExtra("minute", mMinute);

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

	/**
	 * for the date and time popups
	 */

	// the callback received when the user "sets" the date in the dialog
	private OnDateSetListener mDateSetListener = new DatePickerDialog.OnDateSetListener() {
		public void onDateSet(DatePicker view, int year, int monthOfYear,
				int dayOfMonth) {

			mYear = year;
			mMonth = monthOfYear;
			mDay = dayOfMonth;
			setDate(mYear, mMonth, mDay);

			// dismiss DatePickerDialog, then show TimePickerDialog
			showDialog(ADD_TIME_DIALOG_ID);
		}
	};

	// the callback received when the user "sets" the time in the dialog
	private OnTimeSetListener mMinSetListener = new TimePickerDialog.OnTimeSetListener() {
		public void onTimeSet(TimePicker view, int hour, int min) {
			mHour = hour;
			mMinute = min;
			reminder = true;
			setTime(mHour, mMinute);
		}
	};

	// ON_SAVE_INSTANCE_STATE
	// save instance data on kill
	protected void onSaveInstanceState(Bundle outState) {
		outState.putInt("mHour", mHour);
		outState.putInt("mMinute", mMinute);
		outState.putInt("mYear", mYear);
		outState.putInt("mDay", mDay);
		outState.putInt("mMonth", mMonth);
		outState.putBoolean("reminder", reminder);
		outState.putString("text", detailsTextView.getText().toString());

		// todo add location
		super.onSaveInstanceState(outState); // save view state
	}

	@Override
	protected void onResume() {
		super.onResume();
		populateFields();
	}

	private void populateFields() {
		if (text != null) {
			detailsTextView.setText(new StringBuilder().append(text));
		}
	}

	private void setTime(int hour, int minute) {
		String text = detailsTextView.getText().toString();
		StringBuilder min = new StringBuilder().append(minute);

		if (minute < 10) {
			min = new StringBuilder().append("0").append(minute);
		}

		detailsTextView.setText(new StringBuilder().append(text)
				.append(getString(R.string.tag_start)).append(hour).append(":")
				.append(min).append(" "));
	}

	private void setDate(int year, int month, int day) {
		String text = detailsTextView.getText().toString();
		detailsTextView.setText(new StringBuilder()
				.append(text).append(" ").append(getString(R.string.tag_start))
				.append(month + 1).append("/").append(day).append("/")
				.append(year).append(" "));
	}

	private void setLocation(String locationName) {
		String text = detailsTextView.getText().toString();
		detailsTextView.setText(new StringBuilder().append(text).append(" ")
				.append(locationName));
	}
}
