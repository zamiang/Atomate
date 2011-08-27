package com.listomate.server.gdata;

import java.io.IOException;
import java.net.URL;

import javax.servlet.http.HttpServletResponse;

import com.google.gdata.client.authn.oauth.GoogleOAuthParameters;
import com.google.gdata.client.authn.oauth.OAuthException;
import com.google.gdata.client.authn.oauth.OAuthHmacSha1Signer;
import com.google.gdata.client.docs.DocsService;
import com.google.gdata.data.docs.DocumentListEntry;
import com.google.gdata.data.docs.DocumentListFeed;
import com.google.gdata.util.ServiceException;

public class GdocsInterface extends GdataInterface {	
	static void update(GoogleOAuthParameters oauthParameters, HttpServletResponse resp) throws OAuthException, IOException, ServiceException {

		// Create an instance of the DocsService to make API calls
		DocsService client = new DocsService(APPNAME);

		// Use our newly built oauthParameters
		client.setOAuthCredentials(oauthParameters, new OAuthHmacSha1Signer());

		URL feedUrl = new URL(DOCS_URL);
		DocumentListFeed resultFeed = client.getFeed(feedUrl,
				DocumentListFeed.class);
		for (DocumentListEntry entry : resultFeed.getEntries()) {
			resp.getWriter().println(entry.getTitle().getPlainText());
		}

	}

}
