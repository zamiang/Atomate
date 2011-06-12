// helper functions for the facebook and google calendar feeder

let makeSpecificDateTime = function(d) { 
    return {id:"specificdatetime-"+d.toString(),type:"schemas.SpecificDateTime",val:d.valueOf()}; 
};

let interval_map = function(list, fn, cont) {
    return plumutil.interval_map(list, fn, cont !== undefined ? cont : function(){ }, function(x) { JV3.log(x); }, 23); 
};

