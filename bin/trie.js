/**
 * A Simple JavaScript Trie Generator
 * 
 * 
 * MUCH could be added to this:
 * - stop words 
 * - character formatting -- normalizing unicode stuff
 * - somehow placing more importance on hash tags
 * - parsing out the various permutations of dates and times
 *  -- someone writes tomorrow at 5 and tomorrow is wednesday it would be fun to show it in a search for wed
 * 
 * https://github.com/jeresig/trie-js
 * http://ejohn.org/blog/javascript-trie-performance-analysis/
 */

Atomate.trie = {
    parent: Atomate,
    buildTrie: function(words) { 
        var trie = {};

        // Build a simple Trie structure
        for ( var i = 0, l = words.length; i < l; i++ ) {
	        var word = words[i], letters = word.split(""), cur = trie;

	        for ( var j = 0; j < letters.length; j++ ) {
		        var letter = letters[j], pos = cur[ letter ];

		        if ( pos == null ) {
			        cur = cur[ letter ] = j === letters.length - 1 ? 0 : {};

		        } else if ( pos === 0 ) {
			        cur = cur[ letter ] = { $: 0 };

		        } else {
			        cur = cur[ letter ];
		        }
	        }
        }
        return trie;
    },

    optimizeTrie: function(cur) {
	    var num = 0, last;

	    for ( var node in cur ) {
		    if ( typeof cur[ node ] === "object" ) {
			    var ret = this.optimizeTrie( cur[ node ] );

			    if ( ret ) {
				    delete cur[ node ];
				    cur[ node + ret.name ] = ret.value;
				    node = node + ret.name;
			    }
		    }

		    last = node;
		    num++;
	    }

	    if ( num === 1 ) {
		    return { name: last, value: cur[ last ] };
	    }
        return cur;
    },

    // cant get this to work -- not sure what dict is supposed to be
    findTrieWord: function(word, cur, dict) {
	    cur = cur || dict;

	    for ( var node in cur ) {
		    if ( word.indexOf( node ) === 0 ) {
			    var val = typeof cur[ node ] === "number" && cur[ node ] ?
				    dict.$[ cur[ node ] ] :
				    cur[ node ];

			    if ( node.length === word.length ) {
				    return val === 0 || val.$ === 0;

			    } else {
				    return this.findTrieWord( word.slice( node.length ), val, dict );
			    }
		    }
	    }

	    return false;
    }
};