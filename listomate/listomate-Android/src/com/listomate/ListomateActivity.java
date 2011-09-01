/*
 * Copyright 2010 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package com.listomate;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.View;
import android.widget.AdapterView;
import android.widget.TabHost;
import android.widget.TextView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.TabHost.TabContentFactory;
import android.widget.TabHost.TabSpec;
import android.widget.ListView;

import com.listomate.NoteApplication.TaskListener;
import com.listomate.shared.CloudTasksRequestFactory;
import com.listomate.shared.NoteChange;
import com.listomate.shared.NoteProxy;
import com.listomate.shared.NoteRequest;

/**
 * Main activity - requests "Hello, World" messages from the server and provides
 * a menu item to invoke the accounts activity.
 */
public class ListomateActivity extends Activity implements OnItemClickListener {
	/**
	 * Tag for logging.
	 */
	private static final String TAG = "ListomateActivity";
	private Context mContext = this;

	// inits the tabs
	private TabHost mTabHost;

	private void setupTabHost() {
		mTabHost = (TabHost) findViewById(android.R.id.tabhost);
		mTabHost.setup();
	}

	private void setupTab(final View view, final String tag) {
		View tabview = createTabView(mTabHost.getContext(), tag);

		TabSpec setContent = mTabHost.newTabSpec(tag).setIndicator(tabview)
				.setContent(new TabContentFactory() {
					public View createTabContent(String tag) {
						return view;
					}
				});
		mTabHost.addTab(setContent);

	}

	private static View createTabView(final Context context, final String text) {
		View view = LayoutInflater.from(context)
				.inflate(R.layout.tabs_bg, null);
		TextView tv = (TextView) view.findViewById(R.id.tabsText);
		tv.setText(text);
		return view;
	}

	/**
	 * A {@link BroadcastReceiver} to receive the response from a register or
	 * unregister request, and to update the UI.
	 */
	private final BroadcastReceiver mUpdateUIReceiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			int status = intent.getIntExtra(DeviceRegistrar.STATUS_EXTRA,
					DeviceRegistrar.ERROR_STATUS);
			String message = null;
			if (status == DeviceRegistrar.REGISTERED_STATUS) {
				message = getResources().getString(
						R.string.registration_succeeded);
			} else if (status == DeviceRegistrar.UNREGISTERED_STATUS) {
				message = getResources().getString(
						R.string.unregistration_succeeded);
			} else {
				message = getResources().getString(R.string.registration_error);
			}

			// Display a notification
			SharedPreferences prefs = Util.getSharedPreferences(mContext);
			String accountName = prefs.getString(Util.ACCOUNT_NAME, "Unknown");
			Util.generateNotification(mContext,
					String.format(message, accountName));
		}
	};

	private final static int NEW_NOTE_REQUEST = 1;
	private final static int NEW_SEARCH_REQUEST = 2;

	private ListView listView;
	private View progressBar;
	private NoteAdapter adapter;
	private AsyncFetchNote note;

	/**
	 * Begins the activity.
	 */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		Log.i(TAG, "onCreate");
		super.onCreate(savedInstanceState);

		setContentView(R.layout.notelist);

		listView = (ListView) findViewById(R.id.list);
		progressBar = findViewById(R.id.title_refresh_progress);

		// setup tabs
		setupTabHost();
		// mTabHost.getTabWidget().setDividerDrawable(R.drawable.tab_divider);
		// // R.style.TitleBarSeparator);

		setupTab(new TextView(this), "Today");
		setupTab(new TextView(this), "Notes");
		setupTab(new TextView(this), "People");
		setupTab(new TextView(this), "Events");

		// get the Note application to store the adapter which will act as the
		// task storage for this demo.
		NoteApplication noteApplication = (NoteApplication) getApplication();
		adapter = noteApplication.getAdapter(this);
		listView.setAdapter(adapter);

		listView.setOnItemClickListener(this);

		// Register a receiver to provide register/unregister notifications
		registerReceiver(mUpdateUIReceiver, new IntentFilter(
				Util.UPDATE_UI_INTENT));
	}

	/**
	 * Shuts down the activity.
	 */
	@Override
	public void onDestroy() {
		unregisterReceiver(mUpdateUIReceiver);
		super.onDestroy();
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		MenuInflater inflater = getMenuInflater();
		inflater.inflate(R.menu.main_menu, menu);
		// Invoke the Register activity
		// THIS IS SO TERRIBLE -- why do these need to be accessed via an array
		menu.getItem(0).setIntent(new Intent(this, AccountsActivity.class));
		menu.getItem(1).setIntent(new Intent(this, AddNoteActivity.class));
		menu.getItem(2).setIntent(new Intent(this, Preferences.class));
		return true;
	}

	@Override
	protected void onStart() {
		super.onStart();

		// only fetch task on start if the registration has happened.
		SharedPreferences prefs = Util.getSharedPreferences(mContext);
		String deviceRegistrationID = prefs.getString(
				Util.DEVICE_REGISTRATION_ID, null);
		if (deviceRegistrationID != null) {
			fetchTasks(-1);
		}
	}

	@Override
	protected void onResume() {
		super.onResume();
		NoteApplication taskApplication = (NoteApplication) getApplication();
		taskApplication.setTaskListener(new TaskListener() {
			public void onTaskUpdated(final String message, final long id) {
				runOnUiThread(new Runnable() {
					public void run() {
						if (NoteChange.UPDATE.equals(message)) {
							fetchTasks(id);
						}
					}
				});
			}
		});
	}

	@Override
	protected void onPause() {
		super.onPause();
		NoteApplication taskApplication = (NoteApplication) getApplication();
		taskApplication.setTaskListener(null);
	}

	public void fetchTasks(long id) {
		progressBar.setVisibility(View.VISIBLE);
		if (note != null) {
			note.cancel(true);
		}
		note = new AsyncFetchNote(this);
		note.execute(id);
	}

	public void setNotes(List<NoteProxy> notes) {
		progressBar.setVisibility(View.GONE);
		adapter.setNotes(notes);
		adapter.notifyDataSetChanged();
	}

	public void addNotes(List<NoteProxy> notes) {
		progressBar.setVisibility(View.GONE);
		adapter.addNotes(notes);
		adapter.notifyDataSetChanged();
	}

	public void onAddClick(View view) {
		Intent intent = new Intent(this, AddNoteActivity.class);
		startActivityForResult(intent, NEW_NOTE_REQUEST);
	}
	
	public void onSearchClick(View view) {
		Intent intent = new Intent(this, SearchableActivity.class);
		startActivityForResult(intent, NEW_SEARCH_REQUEST);
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		switch (requestCode) {
		//case NEW_SEARCH_REQUEST:
			
		case NEW_NOTE_REQUEST:
			if (resultCode == Activity.RESULT_OK) {
				final String noteName = data.getStringExtra("task");
				final String noteDetails = data.getStringExtra("details");

				Calendar c = Calendar.getInstance();
				c.set(data.getIntExtra("year", 2011),
						data.getIntExtra("month", 12),
						data.getIntExtra("day", 31));
				final Date dueDate = c.getTime();

				new AsyncTask<Void, Void, Void>() {

					@Override
					protected Void doInBackground(Void... arg0) {
						CloudTasksRequestFactory factory = (CloudTasksRequestFactory) Util
								.getRequestFactory(ListomateActivity.this,
										CloudTasksRequestFactory.class);
						NoteRequest request = factory.taskRequest();

						NoteProxy note = request.create(NoteProxy.class);
						note.setName(noteName);
						note.setNote(noteDetails);
						note.setDueDate(dueDate);

						request.updateNote(note).fire();

						return null;
					}

				}.execute();
			}
			break;
		}
	}

	public void onItemClick(AdapterView<?> parent, View view, int position,
			long id) {
		Intent intent = new Intent(this, ViewNoteActivity.class);
		intent.putExtra("position", position);
		startActivity(intent);
	}

}
