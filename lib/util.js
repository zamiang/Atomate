"use strict";
/**
 * GENERAL UTLS
 * extensions to javascript
 */

UTIL =  {
    sentenceCase: function() {
        return this.toLowerCase().replace(/^(.)|\s(.)/g, function(s) { return s.toUpperCase(); });
    },
    
    capitalize: function(text){
        return text.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
    },

    str_trim : function(stringToTrim) {
        if (stringToTrim !== undefined) {
            return stringToTrim.replace(/^\s+|\s+$/g,"");
        }
        return stringToTrim;
    },

    trim : function(string) {
        if (!string){
            return "";
        } else if (string.trim !== undefined) {
            return string.trim();
        } else {
            return JUMO.Util.str_trim(string);
        }
    },
 
    /**
     * modified from http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     */
    areObjectsEquivalent: function(x, y) {
        for (var p in x) {
            if(typeof(y[p]) == 'undefined') { return false; }
        }

        for (p in x) {
            if (x[p]) {
                switch(typeof(x[p])) {
                case 'object':
                    if (!this.areObjectsEquivalent(x[p], y[p])) { return false; }; break;
                case 'function':
                    if (typeof(y[p]) == 'undefined' || (p != 'equals' && x[p].toString() != y[p].toString())) { return false; }; break;
                default:
                    if (x[p] != y[p]) { return false; }
                }
            } else {
                if (y[p]) {  return false;  }
            }
        }

        for (p in y) {
            if (typeof(x[p]) == 'undefined') { return false; }
        }

        return true;
    },

    clone:function(c,dest,except) {
	    if (dest === undefined) { dest = {}; }
	    for (var v in c) {
	        if (except === undefined || except.indexOf(v) < 0) {
		        dest[v] = c[v];
	        }
	    }
	    return dest;
    },
    uniqueArray: function(a) {
        /**
         * uniques elements in an array
         * reguards 1st encountered element as original
         */
        var r = [];
        o:for(var i = 0, n = a.length; i < n; i++) {
            for(var x = 0, y = r.length; x < y; x++){
                if(r[x]==a[i]) continue o;
            }
            r[r.length] = a[i];
        }
        return r;
    },

    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]
    isPointInPoly: function(poly, pt){
        for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
            && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
            && (c = !c);
        return c;
    },

    jObjToPoly: function(jObj){
        var p = jObj.offset();
        var width = jObj.width();
        var height = jObj.height();

        if (p && p.left) {
            return [{
		                x: p.left - 1,
		                y: p.top
	                }, {
		                x: p.left + width + 15,
		                y: p.top
	                }, {
		                x: p.left + width + 15,
		                y: p.top + height
	                }, {
		                x: p.left - 1,
		                y: p.top + height
	                }, {
		                x: p.left - 1,
		                y: p.top
	                }];
        } return [{}];
    },

    replaceAll:function(str,what,withwhat) {
        var lastidx = 0;
        while (lastidx >= 0) {
            lastidx = str.indexOf(what,lastidx + withwhat.length);
            str = str.substring(0,lastidx)+str.substring(lastidx).replace(what,withwhat);
        }
        return str;
    },

    isDateLike: function () {
        for (var i = 0; i < arguments.length; i++) {
            var o = arguments[i];
            if (typeof(o) != "object" || o === null || typeof(o.getTime) != 'function') {
                return false;
            }
        }
        return true;
    },

    isArrayLike: function () {
        for (var i = 0; i < arguments.length; i++) {
            var o = arguments[i];
            var typ = typeof(o);
            if ((typ != 'object' && !(typ == 'function' && typeof(o.item) == 'function')) || o === null || typeof(o.length) != 'number' ) {
                return false;
            }
        }
        return true;
    },

    isNumeric: function(input){
        var val = String(input).replace('\n', "").replace('\r', "").replace('\t', "").replace(' ', '');
        return ((input - 0) == input && input.length > 0);
    },

    sum:function(lst) {
        var add = function(x,y) { if (!y) { return x; } return x + y; };
        return lst.reduce(add,0);
    },

    reverse: function(strToReverse) {
        var strRev = new String;
        var i = strToReverse.length;
        while (i--)
            strRev += strToReverse.charAt(i);
        return strRev;
    },

    resizeIt: function(jObj) {
        var str = jObj.val();
        var cols = jObj.attr('cols');
        var linecount = 0;

        str.split("\n").map(function(l) {
					            linecount += 1 + Math.floor( l.length / cols ); // take into account long lines
                            });

        jObj.attr({rows: linecount > 3 ? linecount : 3 });
    },

    resizeItSmall: function(jObj) {
        var str = jObj.val();
        var cols = jObj.attr('cols');
        var linecount = 0;

        str.split("\n").map(function(l) {
					            linecount += 1 + Math.floor( l.length / cols ); // take into account long lines
                            });

        jObj.attr({rows: linecount });
    },

    makeCharCountDiv: function(jObj, counter, max) {
        var minCharactersBeforeWarning = 50;
        var shown = false;

        jObj.bind('keyup click blur focus change paste', function() {
                      var num = max - jQuery(this).val().length;
                      if (num < minCharactersBeforeWarning) {
                          if (!shown) { counter.show(); }

                          shown = true;
                          counter.html(num);
                          return;
                      } else if (shown) {
                          counter.hide();
                      }

                      shown = false;
                  });
    },

    /** Begin Comment form validation
     * note: modified subset of forms.js so that we dont have to import all of forms.js into all pages
     */

    _stripHtml: function(text) {
        return jQuery('<div>' + text + '</div>').text();
    },

    stripHtml: function(text) {
        var t = this._stripHtml(text);

        if (this._stripHtml('<\n>') !== '&lt;\n&gt;') {
            return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        }
        return t;
    },

    formatString: function(val) {
        return this.stripHtml(val)
            .replace("\n", " ")
            .replace("\r", " ")
            .replace("<", "(")
            .replace(">", ")")
            .replace(">", ")")
            .replace("\\", "/")
            .replace(/"(?=\w|$)/g, "&#8220;")
            .replace(/\b"/g, "&#8221;");
    },

    isValidString: function(value) {
        // the last character here is weird non ascii (’) -- it appears when copying and pasting from websites
        return /^[\w \d \. \, \' \" \: \@ \; \? \- \# \– \& \( \) \! \s \: \; \- \! \r \+ \/ \* \— \’]+$/i.test(value);
    },

    getUrlVars: function(){
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var ii = 0; ii < hashes.length; ii++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },

    /* todo -- make work for textarea, input and contenteditabledivs  */
    getInputVal: function(jObj) {
        return this.trim(jObj.val());
    },

    getUrlVar: function(name){
        return this.getUrlVars()[name];
    },

    getHash: function(){
        return (window.location.hash !== undefined && window.location.hash.length > 0) ? window.location.hash.slice().replace("#", "") : undefined;
    }
};
