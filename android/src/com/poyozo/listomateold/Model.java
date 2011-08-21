package com.poyozo.listomateold;

import java.util.Date;

/**
 * Data model interface definitions for Atomate; these should be implemented in
 * relevant server and client code.
 */
public interface Model {
    public static interface Timestamped {
        public Date getCreatedDate();
        public Date getModifiedDate();
    }

    public static interface Syncable extends Timestamped {
        public boolean isPendingDelete();
    }

    public static interface Note extends Syncable {
        public String getId();
        public String getOwnerId();
        public String getTitle();
        public void setTitle(String title);
        public String getBody();
        public void setBody(String body);
    }

    public static interface UserInfo {
        public String getId();
        public String getEmail();
    }

    public static interface DeviceRegistration {
        public String getDeviceId();
        public String getOwnerId();
        public String getDeviceType();
        public String getRegistrationToken();
        public void setRegistrationToken(String registrationToken);
    }
}
