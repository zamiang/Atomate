package com.listomate.activities;

import com.listomate.models.Contact;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.os.Bundle;
import android.provider.ContactsContract;
import android.util.Log;

public class PickContactActivity extends Activity {
	private static final String TAG = "PickContactActivity";

	private static final int PICK_CONTACT = 10;
	private String name;
	private String contactId;
	
	private static int mYear;
	private int mMonth;
	private int mDay;

	private int mHour;
	private int mMinute;
	
	private boolean reminder = false;
	private String text;
	
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		Intent intentContact = new Intent(Intent.ACTION_PICK,
				ContactsContract.Contacts.CONTENT_URI);
		startActivityForResult(intentContact, PICK_CONTACT);
	}
	
	public void onActivityResult(int requestCode, int resultCode, Intent intent) {
		if (requestCode == PICK_CONTACT) {
			if (intent != null && intent.getData() != null) {
				Contact contact = getContactInfo(intent);
				text = addPersonTag(text, contact.getTag());
			}

			Intent myIntent = new Intent(getBaseContext(), AddNoteActivity.class);
	        myIntent.putExtra("mHour", mHour);
	        myIntent.putExtra("mMinute", mMinute);
	        myIntent.putExtra("mYear", mYear);
	        myIntent.putExtra("mDay", mDay);
	        myIntent.putExtra("mMonth", mMonth);
	        myIntent.putExtra("reminder", reminder);
	        myIntent.putExtra("text", text);
			
			startActivityForResult(myIntent, PICK_CONTACT);
		}
	}

	protected Contact getContactInfo(Intent intent) {

		Cursor cursor = managedQuery(intent.getData(), null, null, null, null);
		while (cursor.moveToNext()) {
			contactId = cursor.getString(cursor
					.getColumnIndex(ContactsContract.Contacts._ID));
			name = cursor
					.getString(cursor
							.getColumnIndexOrThrow(ContactsContract.Contacts.DISPLAY_NAME));
		}
		cursor.close();
		
		Contact contact = new Contact();
		contact.setName(name);
		contact.setId(contactId);
		contact.setTag(name);
		return contact;
	}
	
	private String addPersonTag(String text, String tag) {
		if (text == null) {
			return tag;
		}
		return new StringBuilder().append(text).append(" ").append(tag).toString();	
	}
}