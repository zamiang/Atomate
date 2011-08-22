package com.listomate.server;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gdata.client.authn.oauth.GoogleOAuthHelper;
import com.google.gdata.client.authn.oauth.GoogleOAuthParameters;
import com.google.gdata.client.authn.oauth.OAuthException;
import com.google.gdata.client.authn.oauth.OAuthHmacSha1Signer;

public class RequestTokenCallbackServlet extends HttpServlet {
	private static final long serialVersionUID = -8714671533268130001L;

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		// Create an instance of GoogleOAuthParameters
		GoogleOAuthParameters oauthParameters = new GoogleOAuthParameters();
		oauthParameters.setOAuthConsumerKey(GdataInterface.CONSUMER_KEY);
		oauthParameters.setOAuthConsumerSecret(GdataInterface.CONSUMER_SECRET);

		GoogleOAuthHelper oauthHelper = new GoogleOAuthHelper(
				new OAuthHmacSha1Signer());

		// Remember the token secret that we stashed? Let's get it back
		// now. We need to add it to oauthParameters
		String oauthTokenSecret = (String) req.getSession().getAttribute(
				"oauthTokenSecret");
		oauthParameters.setOAuthTokenSecret(oauthTokenSecret);

		// The query string should contain the oauth token, so we can just
		// pass the query string to our helper object to correctly
		// parse and add the parameters to our instance of oauthParameters
		oauthHelper.getOAuthParametersFromCallback(req.getQueryString(),
				oauthParameters);

		try {

			// Now that we have all the OAuth parameters we need, we can
			// generate an access token and access token secret. These
			// are the values we want to keep around, as they are
			// valid for all API calls in the future until a user revokes
			// our access.
			String accessToken = oauthHelper.getAccessToken(oauthParameters);
			String accessTokenSecret = oauthParameters.getOAuthTokenSecret();

			// In a real application, we want to redirect the user to a new
			// servlet that makes API calls. For the safe of clarity and
			// simplicity,
			// we'll just reuse this servlet for making API calls.
			oauthParameters = new GoogleOAuthParameters();
			oauthParameters.setOAuthConsumerKey(GdataInterface.CONSUMER_KEY);
			oauthParameters
					.setOAuthConsumerSecret(GdataInterface.CONSUMER_SECRET);

			// This is interesting: we set the OAuth token and the token secret
			// to the values extracted by oauthHelper earlier. These values are
			// already in scope in this example code, but they can be populated
			// from reading from the datastore or some other persistence
			// mechanism.
			oauthParameters.setOAuthToken(accessToken);
			oauthParameters.setOAuthTokenSecret(accessTokenSecret);

			/*
			 * This is where the calls to update google
			 * contacts/calendar/documents come in
			 */
			//GdocsInterface.update(oauthParameters, resp);
			//GcalInterface.update(oauthParameters, resp);
			//GcontactsInterface.update(oauthParameters, resp);

		} catch (OAuthException e) {
			// Something went wrong. Usually, you'll end up here if we have
			// invalid
			// oauth tokens
		}
	}
}