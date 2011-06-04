
/**
 * Contains libraries and updates the JS w/ a few things from 1.6
 */

/** 
 * extend prototypes with few things from js 1.6 that are not in ie7/8
 */
if (!Array.prototype.map) {
    Array.prototype.map = function(fun /*, thisp */) {
        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        var res = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in t)
                res[i] = fun.call(thisp, t[i], i, t);
        }

        return res;
    };
}

if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(fun /*, initialValue */) {
        "use strict";
        
        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        // no value to return if no initial value and an empty array
        if (len == 0 && arguments.length == 1)
            throw new TypeError();

        var k = 0;
        var accumulator;
        if (arguments.length >= 2) {
            accumulator = arguments[1];
        } else {
            do {
                if (k in t) {
                    accumulator = t[k++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++k >= len) {
                    throw new TypeError();                    
                }
            }
            while (true);
        }

        while (k < len) {
            if (k in t)
                accumulator = fun.call(undefined, accumulator, t[k], k, t);
            k++;
        }

        return accumulator;
    };
}


if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisp */) {
        "use strict";
        
        if (this === void 0 || this === null)
            throw new TypeError();
        
        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function"){
            throw new TypeError();            
        }

        var res = [];
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, t))
                    res.push(val);
            }
        }

        return res;
    };
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/) {
        var len = this.length;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++){
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}

Object.keys = Object.keys || function(o) {
    var result = [];
    for(var name in o) {
        if (o.hasOwnProperty(name))
            result.push(name);
    }
    return result;
};