/*
 * This detects what type of data the user is entering
 * 
 * User entered data types: note, todo, address, contact, website, reminder, event, private message (email, DM), public message(tweet, FB status)
 * 
 * 
 */

Atomate.detector = {
    parent: Atomate,
    initialize: function(params) {


    },
    isNote: function(text, splitText) {

        
    },
    isTodo: function(text, splitText) {
        return text.substring(0, 4) == 'todo';
    },
    isNote: function(text, splitText) {

        
    },
    containsUrl: function(splitText) {
        let containsURL = false;
        splitText.map(function(txt) {
                  // todo -- sloppy matching
                  if (Atomate.validator.isValidUrl(txt)) {
                      containsURL = true;                      
                  }
              });

        return containsURL;
    },
    isWebsite: function(text, splitText) {
        return containsUrl(splitText);
    },
    
    


};