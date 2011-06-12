"strict mode";
/*
 * Atomate base
 * needs to be loaded 1st and initialized on document ready
 * 
 * tabs are either a special native type
 * 'native' == something more than a simple search query
 * eventually it would be great to expose some way of adding these
 * 
 * something can be 'native' + have a search query
 * 
 */

Atomate = {
    defaultTabs: [{
                      name:'Now',
                      type:'native',
                      default: true
                  }, {
                      name:'Notes',
                      type:'native'
                  }, {
                      name:'Todo',
                      type:'native'
                  }, {
                      name:'Events',
                      type:'native'
                  }, {
                      name:'Contacts',
                      type:'native'
                  }, {
                      name:'Foobar',
                      type:'search',
                      search:'foobar'
                  }],
    initialize: function(params) {
        this.notes = this.buildTrieForNotes(params.redactedNotes.slice(0, 100));

        this.tracking.initialize(params);
        this.notesList = jQuery("#notes");
        this.tabsList = jQuery('#tabs');
        this.addNotes(this.notes);

        this.buildTabs();
        this.setupSearch(jQuery('#main_input'), this.notes);
    },
    
    buildTabs: function(tabs) {
        var this_ = this;
        var locationHash = this.getLocationHash();
        if (!tabs) {
            tabs = this.defaultTabs;
        }         

        tabs.push({
                      name:'+',
                      type:'add'
                  });

        jQuery.fn.append.apply(this.tabsList, tabs.map(function(tab){
                                                             return this_.getTabHtml(tab);
                                                         }));        
        //todo make draggable
        if (locationHash) {
            this.initNotesDisplay(locationHash);            
            this.tabsList.find('li').removeClass('selected');
            this.tabsList.find('.tab_' + locationHash).addClass('selected');
        }        
    },

    initNotesDisplay: function(t) {
        if (t == 'settings') {
            jQuery('#stats, #notes, #main_input').hide();
            jQuery('#settings').show();

        }
    },
    
    getLocationHash: function(){
        return window.location.hash.replace('#', '');        
    },

    getTabHtml: function(tab) { 
            return "<li class=\"tab_" + tab.name.toLowerCase()
            + (tab.default ? ' selected' : "")
            + "\">" 
            + "<a href=\"#" + tab.name.toLowerCase() + "\">" + tab.name + "</a>"
            + "<img class=\"remove\" src=\"../img/remove.png\" />"
            + "</li>";
        
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

                                this_.addNotes(this_.searchNotesSimple(val, notes, notes));
                            } else {
                                this_.notesList.html('');
                                this_.addNotes(notes);
                            }
                        });  
    },


    searchNotesSimple: function(word, notes) {
        var this_ = this;
        return notes.filter(function(note){  
                                if (note.contents.indexOf(word) > -1){
                                    return true;
                                }
                                return false;
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