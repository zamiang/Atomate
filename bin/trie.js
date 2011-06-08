/**
 * A Simple JavaScript Trie Generator
 * 
 * 
 * https://github.com/jeresig/trie-js
 * http://ejohn.org/blog/javascript-trie-performance-analysis/
 * 
 */

Atomate.trie = {
    buildTrie: function(words) { 
        var trie = {};
        // Go through all the words in the dictionary
        for ( var i = 0, l = words.length; i < l; i++ ) {
            // Get all the letters that we need
            var word = words[i], letters = word.split(""), cur = trie;
            // Loop through the letters
            for ( var j = 0; j < letters.length; j++ ) {
                var letter = letters[j], pos = cur[ letter ];
                
                // If nothing exists for this letter, create a leaf
                if ( pos == null ) {
                    // If it's the end of the word, set a 0,
                    // otherwise make an object so we can continue
                    cur = cur[ letter ] = j === letters.length - 1 ? 0 : {};
                    
                    // If a final leaf already exists we need to turn it
                    // into an object to continue traversing
                } else if ( pos === 0 ) {
                    cur = cur[ letter ] = { $: 0 };
                    
                    // Otherwise there is nothing to be set, so continue on
                } else {
                    cur = cur[ letter ];
                }
            }
        }
        return trie;
    },
    optimizeTrie: function( cur ) {
        var num = 0;
        // Go through all the leaves in this branch
        for ( var node in cur ) {
            // If the leaf has children
            if ( typeof cur[ node ] === "object" ) {
                // Continue the optimization even deeper
                var ret = this.optimizeTrie( cur[ node ] );

                // The child leaf only had one child
                // and was "compressed" as a result
                if ( ret ) {
                    // Thus remove the current leaf
                    delete cur[ node ];
                    
                    // Remember the new name
                    node = node + ret.name;
                    
                    // And replace it with the revised one
                    cur[ node ] = ret.value;
                }
            }

            // Keep track of how many leaf nodes there are
            num++;
        }

        // If only one leaf is present, compress it
        if ( num === 1 ) {
            return { name: node, value: cur[ node ] };
        }
        return cur;
    },

    findTrieWord: function findTrieWord( word, cur ) {
	    cur = cur || dict;

	    for ( var node in cur ) {
		    if ( word.indexOf( node ) === 0 ) {
			    var val = typeof cur[ node ] === "number" && cur[ node ] ?
				    dict.$[ cur[ node ] ] :
				    cur[ node ];

			    if ( node.length === word.length ) {
				    return val === 0 || val.$ === 0;

			    } else {
				    return findTrieWord( word.slice( node.length ), val );
			    }
		    }
	    }

	    return false;
    }
};