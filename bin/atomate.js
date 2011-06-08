/*
 * Atomate base
 * needs to be loaded 1st and initialized on document ready
 * 
 */

Atomate = {
    initialize: function(params) {
        this.notes = this.buildTrieForNotes(params.redactedNotes.slice(0, 100));

        this.tracking.initialize(params);
        this.notesList = jQuery("#notes");
        this.addNotes(this.notes);


        this.setupSearch(jQuery('#main_input'), this.notes);
    },
    setupSearch: function(searchDiv, notes) {
        var this_ = this;
        searchDiv.keyup(function(evt){ 
                            var keycode = evt.which;
                            var val = searchDiv.val();

                            if (keycode == 39 || keycode == 37 || keycode == 190){ return; }

                            //  up
                            if (keycode == 38) {
                                // select type of entered data
                                return;
                            }

                            // down
                            if (keycode == 40) {
                                // select type of entered data
                                return;
                            }

                            if (val.length > 1) {
                                // oops this doesnt work w/ spaces
                                this_.notesList.html('');
                                this_.addNotes(this_.searchNotes(val, notes, notes));
                            } else {
                                this_.notesList.html('');
                                this_.addNotes(notes);
                            }
                        });  
    },

    searchNotes: function(word, notes) {
        var this_ = this;
        return notes.filter(function(note){  
                                this_.trie.findTrieWord(word, note.trie);
                            });
    },

    buildTrieForNotes: function(notes) {
        return notes.map(function(note) {
                             if (note && note.contents.length > 0) {
                                 var words = note.contents.replace(/\n/g, "").split(" ");
                                 note.trie = Atomate.trie.buildTrie(words);
                                 
                                 //note.trie = Atomate.trie.optimizeTrie(trie);
                             }
                             return note;    
                         });  
    },

    addNotes: function(notes) {
        var this_ = this;
        jQuery.fn.append.apply(this.notesList, notes.map(function(n){ return this_.getItemHtml(n); }));
        //this.notesList.html(notes.map(function(n){ return this_.getItemHtml(n); }).join(''));
    },

    getItemHtml: function(item) {
        return "<li class=\"" +  item.category.toLowerCase() + "\">"
            + item.contents + "</li>";
        

    }




};