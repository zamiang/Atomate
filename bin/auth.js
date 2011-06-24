/*
 * 
 * auths with facebook, google calendar and google contacts
 * based on atomate feeder
 */

Atomate.auth = {
    parent:Atomate,
    initialize: function(params) {
        this.progressDiv = jQuery('#progress');
        this.me = this.getMe();
        this.data = [];
        
        this.displayServices();
        //this.updateFromServices();
    },
    
    getMe: function() {
        // todo
        return {
            id: 'self',
            name: 'me'
        };
    },

    displayServices: function() {


    },
  
    interval_map_lite: function(list, fn, cont) {
        var this_ = this;
		// current interval is derived by:
		// est_max_num_items = 3000;
		// est_max_time = est_max_num_items / interval; // 600;        
		return this.parent.util.interval_map(list, fn, cont !== undefined ? cont : function(){ }, function(x) { this_.parent.log(x); }, 600, this.parent);
	},	
	makeSpecificDateTime: function(d){ return {id:"specificdatetime-"+d.toString(),type:"schemas.SpecificDateTime",val:d.valueOf()}; },
	makeSpecificDate: function(d){ return {id:"specificdate-"+d.toString(),type:"schemas.SpecificDate",val:d.valueOf()}; },
    
    logProgress: function(text){
        if (!this.progressDiv) {
            this.progressDiv = jQuery('#progress');
        }
        console.log(text);
        this.progressDiv.append("<li><span>" + text + "</span><img src=\"../img/remove.png\" class=\"remove\" />");        
    },

    logError: function(text) {
        if (!this.progressDiv) {
            this.progressDiv = jQuery('#progress');
        }

        console.log(text);
        this.progressDiv.append("<li><span>ERROR: " + text + "</span><img src=\"../img/remove.png\" class=\"remove\" />");        
    },

    saveItem: function(item) {
	if (!this.data) { this.data = []; }
        this.data.push(item);
    }  
};