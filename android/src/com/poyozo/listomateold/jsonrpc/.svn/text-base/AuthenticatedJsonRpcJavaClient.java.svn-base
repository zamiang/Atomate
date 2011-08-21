/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.example.jumpnote.android.jsonrpc;

import com.example.jumpnote.android.Config;

import org.apache.http.HttpResponse;
import org.apache.http.auth.AuthenticationException;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.cookie.Cookie;
import org.apache.http.impl.cookie.BasicClientCookie;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.accounts.AccountManagerCallback;
import android.accounts.AccountManagerFuture;
import android.accounts.AuthenticatorException;
import android.accounts.OperationCanceledException;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.os.Bundle;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

/**
 * An Android/App Engine JSON-RPC client, complete with AccountManager-based auth.
 */
public class AuthenticatedJsonRpcJavaClient extends JsonRpcJavaClient {
    public static final String APPENGINE_SERVICE_NAME = "ah";

    public static final int NEED_AUTH_NOTIFICATION = 1;
    public static final int NEED_AUTH_INTENT = 2;

    private Context mContext;

    private TokenStoreHelper mTokenStoreHelper;

    private final String mAuthUrlTemplate;

    public AuthenticatedJsonRpcJavaClient(Context context, String authUrlTemplate, String rpcUrl) {
        super(rpcUrl);
        mContext = context;
        mAuthUrlTemplate = authUrlTemplate;
        mTokenStoreHelper = new TokenStoreHelper(context);
    }

    @SuppressWarnings("serial")
    public static class RequestedUserAuthenticationException extends Exception {}

    @SuppressWarnings("serial")
    public static class InvalidAuthTokenException extends Exception {
        public InvalidAuthTokenException() {
            super();
        }

        public InvalidAuthTokenException(String message) {
            super(message);
        }
    }

    public void blockingAuthenticateAccount(final Account account, final int needAuthAction,
            boolean forceReauthenticate) throws AuthenticationException, OperationCanceledException,
            RequestedUserAuthenticationException, InvalidAuthTokenException {

        String existingToken = mTokenStoreHelper.getToken(account);
        if (!forceReauthenticate && existingToken != null) {
            BasicClientCookie c = new BasicClientCookie("ACSID", existingToken);
            try {
                c.setDomain(new URI(Config.SERVER_BASE_URL).getHost());
                mHttpClient.getCookieStore().addCookie(c);
                return;
            } catch (URISyntaxException e) {
            }
        }

        // Get an auth token for this account.
        AccountManager am = AccountManager.get(mContext);
        Bundle authBundle = null;
        String authToken = null;

        // Block on getting the auth token result.
        try {
            authBundle = am.getAuthToken(account, APPENGINE_SERVICE_NAME,
                    needAuthAction == NEED_AUTH_NOTIFICATION, null, null).getResult();
        } catch (IOException e) {
            throw new AuthenticationException("IOException while getting auth token.", e);
        } catch (AuthenticatorException e) {
            throw new AuthenticationException("AuthenticatorException while getting auth token.", e);
        }

        if (authBundle.containsKey(AccountManager.KEY_INTENT) &&
                needAuthAction == NEED_AUTH_INTENT) {
            Intent authRequestIntent = (Intent) authBundle.get(AccountManager.KEY_INTENT);
            mContext.startActivity(authRequestIntent);
            throw new RequestedUserAuthenticationException();
        } else if (authBundle.containsKey(AccountManager.KEY_AUTHTOKEN)) {
            authToken = authBundle.getString(AccountManager.KEY_AUTHTOKEN);
        }

        if (authToken == null) {
            throw new AuthenticationException("Retrieved auth token was null.");
        }

        try {
            blockingAuthenticateWithToken(account, authToken);
        } catch (InvalidAuthTokenException e) {
            am.invalidateAuthToken(account.type, authToken);
            throw e;
        }
    }

    private void blockingAuthenticateWithToken(Account account, String authToken)
            throws AuthenticationException, InvalidAuthTokenException {
        // Promote the given auth token into an App Engine ACSID token.
        HttpGet httpGet = new HttpGet(String.format(mAuthUrlTemplate, authToken));
        String acsidToken = null;

        try {
            HttpResponse response = mHttpClient.execute(httpGet);
            if (response.getStatusLine().getStatusCode() == 403) {
                throw new InvalidAuthTokenException();
            }

            List<Cookie> cookies = mHttpClient.getCookieStore().getCookies();
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("ACSID")) {
                    acsidToken = cookie.getValue();
                    break;
                }
            }

            if (acsidToken == null && response.getStatusLine().getStatusCode() == 500) {
                // If no ACSID cookie was passed, it usually means the auth token was invalid;
                throw new InvalidAuthTokenException("ACSID cookie not found in HTTP response: " +
                        response.getStatusLine().toString() + "; assuming invalid auth token.");
            }

            mTokenStoreHelper.putToken(account, acsidToken);
        } catch (ClientProtocolException e) {
            throw new AuthenticationException("HTTP Protocol error authenticating to App Engine", e);
        } catch (IOException e) {
            throw new AuthenticationException("IOException authenticating to App Engine", e);
        }
    }

    public static void ensureHasTokenWithUI(Activity activity, Account account,
            final EnsureHasTokenWithUICallback callback) {
        AccountManager am = AccountManager.get(activity);
        am.getAuthToken(account, APPENGINE_SERVICE_NAME, null, activity,
                new AccountManagerCallback<Bundle>() {
                    public void run(AccountManagerFuture<Bundle> authBundleFuture) {
                        Bundle authBundle = null;
                        try {
                            authBundle = authBundleFuture.getResult();
                        } catch (OperationCanceledException e) {
                            callback.onAuthDenied();
                            return;
                        } catch (AuthenticatorException e) {
                            callback.onError(e);
                            return;
                        } catch (IOException e) {
                            callback.onError(e);
                            return;
                        }

                        if (authBundle.containsKey(AccountManager.KEY_AUTHTOKEN)) {
                            callback.onHasToken((String) authBundle
                                    .get(AccountManager.KEY_AUTHTOKEN));
                        } else {
                            callback.onError(new IllegalStateException(
                                    "No auth token available, but operation not canceled."));
                        }
                    }
                }, null);
    }

    public void invalidateAccountAcsidToken(Account account) {
        mTokenStoreHelper.invalidateToken(account);
    }

    public static interface EnsureHasTokenWithUICallback {
        public void onAuthDenied();
        public void onHasToken(String authToken);
        public void onError(Throwable e);
    }

    /**
     * This class helps manage stored ACSID tokens.
     * TODO: use a persistent cookie store instead of this intermediate structure
     */
    private static class TokenStoreHelper extends SQLiteOpenHelper {
        private static final String TABLE_NAME = "tokens";
        private static final String[] ALL_COLUMNS = new String[] { "account", "token" };

        TokenStoreHelper(Context context) {
            super(context, "tokens.db", null, 1);
        }

        @Override
        public void onCreate(SQLiteDatabase db) {
            db.execSQL("CREATE TABLE " + TABLE_NAME + " (account TEXT UNIQUE, token TEXT);");
        }

        @Override
        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            db.execSQL("DROP TABLE IF EXISTS " + TABLE_NAME);
            onCreate(db);
        }

        public void putToken(Account account, String token) {
            SQLiteDatabase db = getWritableDatabase();
            ContentValues values = new ContentValues();
            values.put("account", account.name);
            values.put("token", token);
            db.insertWithOnConflict(TABLE_NAME, null, values, SQLiteDatabase.CONFLICT_REPLACE);
            db.close();
        }

        public String getToken(Account account) {
            SQLiteDatabase db = getReadableDatabase();
            Cursor c = db.query(TABLE_NAME, ALL_COLUMNS, "account = ?",
                    new String[]{ account.name }, null, null, null);
            if (!c.moveToNext()) {
                c.close();
                db.close();
                return null;
            }
            String token = c.getString(1);
            c.close();
            db.close();
            return token;
        }

        public void invalidateToken(Account account) {
            SQLiteDatabase db = getWritableDatabase();
            db.delete(TABLE_NAME, "account = ?", new String[]{ account.name });
            db.close();
        }
    }
}
