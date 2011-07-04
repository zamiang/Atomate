    // it srsly hurts that all this google crap can't be in an external js file
    // gdata initialize
    if (window.google !== undefined) {
        google.load("gdata", "2.x", {packages: ["contacts, calendar"]}); // nice of them not to put this in the docs
        google.load("maps", "3.x", {"callback" : mapsLoaded, "other_params" : "sensor=false"});
    }

// A google.gdata.calendar.CalendarService object that can be used to access
// private feed using AuthSub.
var CalendarService;
var ContactsService;
var EVENT_FEED_URL =  "http://www.google.com/calendar/feeds/";
var EVENT_FEED_URL2 = "http://www.google.com/calendar/feeds/default/allcalendars/full";

var CONTACTS_FEED_URL = "https://www.google.com/m8/feeds/";
var CONTACTS_FEED_URL2 = "https://www.google.com/m8/feeds/contacts/default/full";

function showMessage(e) {
    Atomate.auth.logProgress(e);
}

function error(e) {
    Atomate.auth.logError(e);
}

function handleError(e) {
    error(e);
    console.log(e.cause ? e.cause.statusText : e.message);
}

function init() {
    if (google && google.accounts && !google.accounts.user.checkLogin(EVENT_FEED_URL + " " + CONTACTS_FEED_URL + " " + EVENT_FEED_URL2 + " " + CONTACTS_FEED_URL2)){
        login();
    }

    try {
        if (google && google.gdata && google.gdata.calendar) {
            CalendarService = new google.gdata.calendar.CalendarService('Atomate.0.4');
            Atomate.auth.gcal.initialize();
        }
        if (google && google.gdata && google.gdata.contacts) {
            ContactsService = new google.gdata.contacts.ContactsService('Atomate.0.4');

            //Atomate.auth.gcontacts.initialize(); // TEMPORARY REMOVAL
        }
    }  catch(x){ alert(x); }
}

if (window.google !== undefined) {
    google.setOnLoadCallback(init);
}

function login() {
    token = google.accounts.user.login(EVENT_FEED_URL + " " + CONTACTS_FEED_URL + " " + EVENT_FEED_URL2 + " " + CONTACTS_FEED_URL2);
}
