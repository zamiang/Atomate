Atomate.auth.Flickr = {
    parent:Atomate.auth,
	apiKey: "bc48a1ea39f973aa556aee9057a37374",
    initialize: function(url, username, userid) {
        var this_ = this;
        var useridUrl = "http://api.flickr.com/services/rest/?method=flickr.people.findByUsername&api_key=" +  apiKey + "&username=" + username + "&format=json&jsoncallback=?";
        var flickrurl = "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + apiKey + "&user_id=" + userid + "&format=json&jsoncallback=?";			
		var me = Atomate.getMe();

        if (username === undefined) { return; }
        		
		if (userid === undefined) {
			userid = "";
            jQuery.getJSON(
                useridUrl, {}, 
                function(ph, status200){
					var data = this_.parseResponse(ph);
					if (data.stat != "ok"){					  
						jQuery('#flickr_success').text('something failed please try a different username').show();
						// something broke!
						return;
					}
					userid = data.user.nsid;                    
					this_.parent.saveItem({ id: "Flickr", type:"schemas.Datasource", username: username, userid: data.user.nsid });
				});						 
		}		        
		
        jQuery.getJSON(flickrurl, {}, function(data, status200) {
				           data = this_.parseResponse(data);
                           
				           if (data.stat != "ok"){					  
					           this_.parent.logError('Flickr error');
					           this_.parent.logError(data.stat);
					           // something broke!
					           return;
				           }		
				           processData(data);
			           });						 
	},

    processData: function(data) {
        var this_ = this;
		var url = "http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=" + apiKey + "&format=json&jsoncallback=?&photo_id=";
		this.parent.logProgress('got ' + data.photos.photo.length + ' photos from flickr');
		this.parent.interval_map_lite(data.photos.photo,  function(photo){
									      jQuery.getJSON(
                                              url + photo.id, {}, function(ph, status200){
												  var p = this_.parseResponse(ph).photo;
												  var time = this_.parent.makeSpecificDateTime(dateFromUTC(p.dates.taken, '-').valueOf());
												  this_.parent.saveItem({
																	        type:"schemas.Photo",
																	        id : p.id,
																	        name: p.title._content,
																	        source: "flickr",
																	        'date uploaded': this_.parent.makeSpecificDateTime(Number(p.dateuploaded)*1000),
																	        'created time': time,
																	        'user id': p.owner.nsid,
																	        username: p.owner.username,
																	        location: p.owner.location,
																	        description: p.description._content,
																	        person: me, // need to change this to allow other users flickr accounts
																	        tags: p.tags,
																	        media: p.media,
																	        server: p.server,
																	        secret: p.secret,
																	        farm: p.farm
																	    });
											  });
								      });
	},

    parseResponse: function(ph){
        return JSON.parse(ph.substring(14, ph.length -1)); // ewwwwww
    }
};


