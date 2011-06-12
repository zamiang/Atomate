"strict mode";
/*
 * Atomate base
 * needs to be loaded 1st and initialized on document ready
 * 
 * tabs are either a special native type
 * 'native' == something more than a simple search query that we define (eventually it would be great to expose some way of adding these)
 * 'search' == a string that is searched for
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
        this.searchDiv = jQuery('#main_input');

        this.buildTabs();
        this.setupSearch(this.searchDiv, this.notes);
        this.setupMouseEvents();
    },

    setupMouseEvents: function(){
        var this_ = this;
        this.tabsList.find('li').live('click', 
                                      function(item) {
                                          var jObj = jQuery(this);
                                          var type = jObj.attr('class');
                                          type = type.replace('tab_', '');
                                          
                                          Atomate.changeTab(type);
                                          return false;
                                      });                        

        jQuery('.popup .remove').live('click', 
                              function(item) {
                                  this_.hidePopup();
                              });                        

    },
    
    changeTab: function(type){
        if (type == "plus") {
            this.showAddPopup();
        } else if (type == 'settings') {
            this.tabsList.find('li').removeClass('selected');
            jQuery('#stats, #notes, #main_input').hide();
            jQuery('#settings').show();
        } else {
            jQuery('#stats, #notes, #main_input').show();
            jQuery('#settings').hide();

            this.updateNotesDisplay(type);            
            this.tabsList.find('li').removeClass('selected');
            this.tabsList.find('.tab_' + type).addClass('selected');        
        }
    },

    showAddPopup: function() {
        this.showPopup('add_tab');
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
            this.changeTab(locationHash);
        }        
    },

    updateNotesDisplay: function(type) {
        var notes = this.notes;
        var searchString = this.searchDiv.val();

        if (searchString && firstTabSelected) {
            notes = this.searchNotesSimple(searchString, notes, notes);
                                 
        } else if (searchString) {
            notes = this.getNotesForType(type);                
            notes = this.searchNotesSimple(searchString, notes, notes);
            
        } else {
            notes = this.getNotesForType(type); 
        }

        this.addNotes(notes);
    },
    
    getNotesForType: function(type) {
        return this.notes;
    },

    getLocationHash: function(){
        return window.location.hash.replace('#', '');        
    },
    
    getTabClass: function(tab){
        if (tab.name == "+") {
            return 'plus'; 
        }
        return tab.name.toLowerCase();
    },

    getTabHtml: function(tab) { 
        var this_ = this;
        return "<li class=\"tab_" + this_.getTabClass(tab)
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

    showPopup: function(id) {
        jQuery("#" + id).show();    
        jQuery('#container, header').css('opacity', 0.2);
    },
    hidePopup: function() {
        jQuery('.popup').hide();    
        
        jQuery('#container, header').css('opacity', 1);
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