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

package com.poyozo.listomateold.jsonrpc;

@SuppressWarnings("serial")
public class JsonRpcException extends Exception {
    private int httpCode;
    private String methodName;

    public JsonRpcException(int httpCode, String methodName, String message, Throwable cause) {
        super(message, cause);
        this.httpCode = httpCode;
        this.methodName = methodName;
    }

    public JsonRpcException(int httpCode, String methodName, String message) {
        this(httpCode, methodName, message, null);
    }

    public JsonRpcException(int httpCode, String message, Throwable cause) {
        this(httpCode, null, message, cause);
    }

    public JsonRpcException(int httpCode, String message) {
        this(httpCode, null, message, null);
    }

    public int getHttpCode() {
        return httpCode;
    }

    public String getMethodName() {
        return methodName;
    }

    public void setMethodName(String methodName) {
        this.methodName = methodName;
    }

    @Override
    public String getMessage() {
        return super.getMessage();
    }
}
