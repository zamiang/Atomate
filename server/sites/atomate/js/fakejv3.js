
/**
   fakejv3 is a drop-in replacement for JV3/Atomate for feeders
   that uses localstorage

   @see chrome fakejv3-feeder for details on how this is then
   xferred into the main entity store
**/

self.JV3 = {
    newify:function() {
	var C = arguments[0];
	var args = plumutil.arguments2array(arguments);
	var f = function () { } ;
	f.prototype = C;
	var fi = new f();
	fi.initialize.apply(fi,args.slice(1));
	return fi;
    },
    plumutil:plumutil,
    log:function() { try { 
	    //alert(arguments[0]);
	    //console.log.apply(console,arguments);
	    
	    
	    //plumutil.objkeys(arguments).map(function(a){ 
	    // this will display the message in the ui
	    //    showMessage(arguments(a));
	    //});
	} catch(e) { } },
    Atomate: {
	getEntity:function(templ) {
	    if (templ.id !== undefined && templ.type !== undefined) {
		return this._storage().getItem(this._get_key(templ));
	    }
	    return undefined;
	},
	getEntities:function(templ) {
	    // do more sophisticated template matching? .. but could be really slow
	    var byid = this.getEntity(templ);
	    var hits = [];
	    if (byid !== undefined) { return [byid]; }
	    for (var ii = 0; ii < this._storage().length; ii++) {
		var vvjs = this._storage().getItem(this._storage().key(ii));
		try {
		    var vv = plumutil.fromJSON(vvjs);
		    var templkeys = plumutil.objKeys(templ);
		    if (templkeys.filter(function(k) { return templ[k] == vv[k]; }).length == templkeys.length) {
			hits.push(vv);
		    }
		} catch(E) { this.log(E); }
	    }
	    return hits;
	},
	save:function(ent) {
	    this._storage().setItem(this._get_key(ent),plumutil.toJSON(ent));
	    this._storage().setItem("_last_update_time", new Date().valueOf());
	    return ent;
	},
	_get_key:function(ent) {
	    return plumutil.toJSON({id:ent.id,type:ent.type});
	},
	_storage:function() {
           return globalStorage[document.location.host];
	}
    }
};