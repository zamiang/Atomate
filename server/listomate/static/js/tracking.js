/**
 * The module for tracking user actions
 * currently it uses Mixpanel's ASYNC api for tracking
 * 
 * @requires mixpanel
 * @requires base.js
 * 
 * compiled with base.js
 * 
 * @see http://mixpanel.com/api/docs/guides/integration/js
 * 
 * @param trackingmodule - array that we push to for ASYNC tracking
 * @param mixPanelInit - function that returns instance of mixpanel
 * @param doNotTrackPageload
 */

Atomate.tracking = {
    parent: Atomate,
    initialize: function(params) {
        var this_ = this;
        var trackingmodule = params.trackingmodule;
        var mixPanelInit = params.mixPanelInit;

        if (!trackingmodule || !mixPanelInit) {
            return;
        }

        /**
         * example params for mix panel
         * 
         * @param name   string
         * @param action string
         * @param step   number
         * @param values obj {gender: 'hacker'}
        */
        this.trackAction = function(action, values, cont) {
            trackingmodule.push(["track", action, values]);
            if (cont) { cont(); }
        };

        this.trackActionSYNC = function(action, values, cont) {
            if (!this_.mixPanel) {
                this_.mixPanel = mixPanelInit();
            }
            
            this_.mixPanel.track(action, values, cont);
        };

        this.trackFunnel = function(step, values) {
            trackingmodule.push(["track", step, values]);
        };
        
        this.registerUser = function(user) {
            if (user.id) {
                trackingmodule.push(['identify', user.id]);                
            }

            trackingmodule.push(["register", { 
                                     "signed in":  user.signedIn,
                                     gender:       user.gender,
                                     "age group":  user.ageGroup
                                 }]);
        };
        
        if (!params.doNotTrackPageload) {
            var location = window.location ? window.location.pathname : "";
            this.registerUser({
                                  id:       params.userId,
                                  gender:   params.userGender,
                                  ageGroup: params.userAgeGroup,
                                  signedIn: params.signedIn
                              });
            
            trackingmodule.push(["track", "Page Load", {
                                     location: location
                                 }]);
        }
        
        this.initialized = true;  
    }
};