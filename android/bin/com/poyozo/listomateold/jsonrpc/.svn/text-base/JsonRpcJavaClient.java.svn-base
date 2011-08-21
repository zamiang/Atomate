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

import com.example.jumpnote.allshared.JsonRpcClient;
import com.example.jumpnote.allshared.JsonRpcException;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import android.util.Log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

/**
 * An Android JSON-RPC client, unaware of authentication (left up to extending classes).
 */
public class JsonRpcJavaClient implements JsonRpcClient {
    static final String TAG = JsonRpcJavaClient.class.getSimpleName();

    protected DefaultHttpClient mHttpClient;

    private final String mRpcUrl;

    public JsonRpcJavaClient(String rpcUrl) {
        mRpcUrl = rpcUrl;
        mHttpClient = new DefaultHttpClient();
    }

    public void call(String methodName, Object params, final JsonRpcClient.Callback callback) {
        callBatch(Arrays.asList(new JsonRpcClient.Call[] {
            new JsonRpcClient.Call(methodName, params)
        }), new JsonRpcClient.BatchCallback() {
            public void onError(int callIndex, JsonRpcException caught) {
                callback.onError(caught);
            }

            public void onData(Object[] data) {
                if (data[0] != null)
                    callback.onSuccess(data[0]);
            }
        });
    }

    public void callBatch(final List<JsonRpcClient.Call> calls,
            final JsonRpcClient.BatchCallback callback) {
        HttpPost httpPost = new HttpPost(mRpcUrl);
        JSONObject requestJson = new JSONObject();
        JSONArray callsJson = new JSONArray();
        try {
            for (int i = 0; i < calls.size(); i++) {
                JsonRpcClient.Call call = calls.get(i);

                JSONObject callJson = new JSONObject();

                callJson.put("method", call.getMethodName());

                if (call.getParams() != null) {
                    JSONObject callParams = (JSONObject) call.getParams();
                    @SuppressWarnings("unchecked")
                    Iterator<String> keysIterator = callParams.keys();
                    String key;
                    while (keysIterator.hasNext()) {
                        key = keysIterator.next();
                        callJson.put(key, callParams.get(key));
                    }
                }

                callsJson.put(i, callJson);
            }

            requestJson.put("calls", callsJson);
            httpPost.setEntity(new StringEntity(requestJson.toString(), "UTF-8"));
            if (Log.isLoggable(TAG, Log.VERBOSE)) {
                Log.v(TAG, "POST request: " + requestJson.toString());
            }
        } catch (JSONException e) {
            // throw e;
        } catch (UnsupportedEncodingException e) {
            // throw e;
        }

        try {
            HttpResponse httpResponse = mHttpClient.execute(httpPost);
            final int responseStatusCode = httpResponse.getStatusLine().getStatusCode();
            if (200 <= responseStatusCode && responseStatusCode < 300) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(httpResponse
                        .getEntity().getContent(), "UTF-8"), 8 * 1024);

                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line).append("\n");
                }
                if (Log.isLoggable(TAG, Log.VERBOSE)) {
                    Log.v(TAG, "POST response: " + sb.toString());
                }
                JSONTokener tokener = new JSONTokener(sb.toString());
                JSONObject responseJson = new JSONObject(tokener);
                JSONArray resultsJson = responseJson.getJSONArray("results");
                Object[] resultData = new Object[calls.size()];

                for (int i = 0; i < calls.size(); i++) {
                    JSONObject result = resultsJson.getJSONObject(i);
                    if (result.has("error")) {
                        callback.onError(i, new JsonRpcException((int) result.getInt("error"),
                                calls.get(i).getMethodName(), result.getString("message"), null));
                        resultData[i] = null;
                    } else {
                        resultData[i] = result.get("data");
                    }
                }

                callback.onData(resultData);
            } else {
                callback.onError(-1, new JsonRpcException(-1,
                        "Received HTTP status code other than HTTP 2xx: "
                                + httpResponse.getStatusLine().getReasonPhrase()));
            }
        } catch (IOException e) {
            Log.e("JsonRpcJavaClient", e.getMessage());
            e.printStackTrace();
        } catch (JSONException e) {
            Log.e("JsonRpcJavaClient", "Error parsing server JSON response: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
