package com.listomate;

import android.app.TabActivity;
import android.content.Intent;
import android.content.res.Resources;
import android.os.Bundle;
import android.widget.TabHost;

public class TabWidget extends TabActivity {
	public void createTab(TabHost tabHost, TabHost.TabSpec spec, Class<ListomateActivity> class1, String name, int icon) {
		Resources res = getResources(); // Resource object to get Drawables
		Intent intent;

		intent = new Intent().setClass(this, class1);
		spec = tabHost
				.newTabSpec(name)
				.setIndicator(name,
						res.getDrawable(icon))
				.setContent(intent);
		tabHost.addTab(spec);

	}

	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);

		TabHost tabHost = getTabHost(); // The activity TabHost
		TabHost.TabSpec spec = null; // Resusable TabSpec for each tab
		
		createTab(tabHost, spec, ListomateActivity.class, getString(R.string.today), R.drawable.ic_mailboxes_accounts);
		createTab(tabHost, spec, ListomateActivity.class, getString(R.string.notes), R.drawable.ic_mailboxes_accounts);
		createTab(tabHost, spec, ListomateActivity.class, getString(R.string.events), R.drawable.ic_mailboxes_accounts);
		createTab(tabHost, spec, ListomateActivity.class, getString(R.string.contacts), R.drawable.ic_mailboxes_accounts);

	    tabHost.setCurrentTab(2);
	
	}
}
