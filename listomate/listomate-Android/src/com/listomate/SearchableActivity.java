package com.listomate;

import android.app.Activity;
import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.provider.SearchRecentSuggestions;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;

public class SearchableActivity extends Activity {

	// UI elements
	Button mStartSearch;
	Spinner mMenuMode;
	EditText mQueryPrefill;
	EditText mQueryAppData;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.search);

		// forces the keyboard open
		InputMethodManager imm = (InputMethodManager) this.getBaseContext()
				.getSystemService(Context.INPUT_METHOD_SERVICE);
		imm.toggleSoftInput(InputMethodManager.SHOW_FORCED, 0);

		handleIntent(getIntent());
	}

	@Override
	protected void onNewIntent(Intent intent) {
		setIntent(intent);
		handleIntent(intent);
	}

	private void handleIntent(Intent intent) {
		if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
			String query = intent.getStringExtra(SearchManager.QUERY);

			// TODO
			// doMySearch(query);
		}
	}

	/**
	 * This hook is called when the user signals the desire to start a search.
	 * 
	 * By overriding this hook we can insert local or context-specific data.
	 * 
	 * @return Returns true if search launched, false if activity blocks it
	 */
	@Override
	public boolean onSearchRequested() {
		// It's possible to prefill the query string
		// before launching the search
		// UI. For this demo, we simply copy it
		// from the user input field.
		// For most applications, you can simply pass
		// null to startSearch() to
		// open the UI with an empty query string.
		final String queryPrefill = mQueryPrefill.getText().toString();

		// Next, set up a bundle to send context-specific
		// search data (if any)
		// The bundle can contain any number of elements,
		// sing any number of keys;
		// For this Api Demo we copy a string from the user
		// input field, and store
		// it in the bundle as a string with the key "demo_key".
		// For most applications, you can simply pass
		// null to startSearch().
		Bundle appDataBundle = null;
		final String queryAppDataString = mQueryAppData.getText().toString();
		if (queryAppDataString != null) {
			appDataBundle = new Bundle();
			appDataBundle.putString("demo_key", queryAppDataString);
		}

		// Now call the Activity member function that
		// invokes the Search Manager UI.
		startSearch(queryPrefill, false, appDataBundle, false);

		// Returning true indicates that we did launch
		// the search, instead of blocking it.
		return true;
	}

	/**
	 * Any application that implements search suggestions based on previous
	 * actions (such as recent queries, page/items viewed, etc.) should provide
	 * a way for the user to clear the history. This gives the user a measure of
	 * privacy, if they do not wish for their recent searches to be replayed by
	 * other users of the device (via suggestions).
	 * 
	 * This example shows how to clear the search history for apps that use
	 * android.provider.SearchRecentSuggestions. If you have developed a custom
	 * suggestions provider, you'll need to provide a similar API for clearing
	 * history.
	 * 
	 * In this sample app we call this method from a "Clear History" menu item.
	 * You could also implement the UI in your preferences, or any other logical
	 * place in your UI.
	 */
	private void clearSearchHistory() {
		SearchRecentSuggestions suggestions = new SearchRecentSuggestions(this,
				SearchSuggestionSampleProvider.AUTHORITY,
				SearchSuggestionSampleProvider.MODE);
		suggestions.clearHistory();
	}

}