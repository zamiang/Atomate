package com.listomate;

import java.util.List;

import android.app.Activity;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.location.LocationProvider;
import android.os.Bundle;
import android.widget.TextView;

public class LocationInterface extends Activity implements LocationListener {
	// Define human readable names
	private static final String[] A = { "invalid", "n/a", "fine", "coarse" };
	private static final String[] P = { "invalid", "n/a", "low", "medium","high" };
	private static final String[] S = { "out of service","temporarily unavailable", "available" };

	private LocationManager mgr;
	private TextView output;
	private String best;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);

		mgr = (LocationManager) getSystemService(LOCATION_SERVICE);
		output = (TextView) findViewById(R.id.output);

		log("Location providers:");
		dumpProviders();

		Criteria criteria = new Criteria();
		best = mgr.getBestProvider(criteria, true);
		log("\nBest provider is: " + best);

		log("\nLocations (starting with last known):");
		Location location = mgr.getLastKnownLocation(best);
		dumpLocation(location);
	}

	@Override
	protected void onResume() {
		super.onResume();
		// Start updates (doc recommends delay >= 60000 ms)
		mgr.requestLocationUpdates(best, 15000, 1, this);
	}

	@Override
	protected void onPause() {
		super.onPause();
		// Stop updates to save power while app paused
		mgr.removeUpdates(this);
	}

	public void onLocationChanged(Location location) {
		dumpLocation(location);
	}

	public void onProviderDisabled(String provider) {
		log("\nProvider disabled: " + provider);
	}

	public void onProviderEnabled(String provider) {
		log("\nProvider enabled: " + provider);
	}

	public void onStatusChanged(String provider, int status, Bundle extras) {
		log("\nProvider status changed: " + provider + ", status=" + S[status]
				+ ", extras=" + extras);
	}

	/** Write a string to the output window */
	private void log(String string) {
		output.append(string + "\n");
	}

	/** Write information from all location providers */
	private void dumpProviders() {
		List<String> providers = mgr.getAllProviders();
		for (String provider : providers) {
			dumpProvider(provider);
		}
	}

	/** Write information from a single location provider */
	private void dumpProvider(String provider) {
		LocationProvider info = mgr.getProvider(provider);
		StringBuilder builder = new StringBuilder();
		builder.append("LocationProvider[").append("name=")
				.append(info.getName()).append(",enabled=")
				.append(mgr.isProviderEnabled(provider))
				.append(",getAccuracy=").append(A[info.getAccuracy() + 1])
				.append(",getPowerRequirement=")
				.append(P[info.getPowerRequirement() + 1])
				.append(",hasMonetaryCost=").append(info.hasMonetaryCost())
				.append(",requiresCell=").append(info.requiresCell())
				.append(",requiresNetwork=").append(info.requiresNetwork())
				.append(",requiresSatellite=").append(info.requiresSatellite())
				.append(",supportsAltitude=").append(info.supportsAltitude())
				.append(",supportsBearing=").append(info.supportsBearing())
				.append(",supportsSpeed=").append(info.supportsSpeed())
				.append("]");
		log(builder.toString());
	}

	/** Describe the given location, which might be null */
	private void dumpLocation(Location location) {
		if (location == null)
			log("\nLocation[unknown]");
		else
			log("\n" + location.toString());
	}
}
