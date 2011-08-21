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

import java.util.List;

public interface JsonRpcClient {
    public void call(String methodName, Object params, Callback callback);

    public void callBatch(List<Call> calls, BatchCallback callback);

    public static interface Callback {
        public void onSuccess(Object data);

        public void onError(JsonRpcException caught);
    }

    public static interface BatchCallback {
        public void onData(Object[] data);

        public void onError(int callIndex, JsonRpcException caught);
    }

    public static final class Call {
        private String methodName;

        private Object params;

        public String getMethodName() {
            return methodName;
        }

        public Object getParams() {
            return params;
        }

        public void setParams(Object params) {
            this.params = params;
        }

        public Call(String methodName) {
            this.methodName = methodName;
        }

        public Call(String methodName, Object params) {
            this.methodName = methodName;
            this.params = params;
        }
    }
}
