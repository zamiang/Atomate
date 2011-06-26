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
    notesList: jQuery("#notes"),
    tabsList: jQuery('#tabs'),
    searchDiv: jQuery('#main_input'),
    settingsDiv: jQuery('#settings'),
    inputControlsDiv: jQuery('#input .controls'),
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
                      name:'People',
                      type:'native'
                  }, {
                      name:'javascript',
                      type:'search',
                      search:'#javascript'
                  }],
    initialize: function(params) {
        this.database.initialize();
        this.notes = params.redactedNotes.slice(0, 200);
        this.people = this.getPeople();
        this.events = this.getEvents();
        this.tabs = params.tabs || this.defaultTabs;
        var startingTab = this.getStartingTab();

        this.buildTabs(this.tabs, startingTab);
        this.setupSearch(this.searchDiv, this.notes);
        this.setupMouseEvents();
        this.updateNotesDisplay(startingTab.name.toLowerCase(), startingTab.type);
        this.auth.initialize();
        this.tracking.initialize(params);
        this.autocomplete.initialize();
    },

    setupMouseEvents: function(){
        var this_ = this;
        this.tabsList.find('li').live('click',
                                      function(item) {
                                          var jObj = jQuery(this);
                                          var name = jObj.attr('data-name').toLowerCase();
                                          var type = jObj.attr('data-type').toLowerCase();

                                          Atomate.changeTab(name, type);
                                          return false;
                                      });

        this.notesList.find('li').live('click',
                                       function(evt) {
                                           var jObj = jQuery(this);
                                           jObj.toggleClass('selected');
                                       });

        this.notesList.find('li .hash_link, li .at_link').live('click',
                                                               function(evt) {
                                                                   var search = jQuery(this).attr('data-id');
                                                                   this_.searchString = search;
                                                                   this_.updateNotesDisplay(undefined, undefined, true);
                                                               });

        this.notesList.find('li .remove_custom_search').live('click',
                                                             function(evt){
                                                                 evt.stopPropagation();
                                                                 jQuery(this).parent().parent().remove();
                                                                 this_.removeCustomSearch();
                                                                 return false;
                                                             });

        this.notesList.find('li.note').live('dblclick',
                                            function(evt) {
                                                var jObj = jQuery(this);
                                                this_.makeNoteEditable(jObj);
                                            });

        this.notesList.find('li .actions .item_remove').live('click',
                                                             function(evt){
                                                                 evt.stopPropagation();
                                                                 jQuery(this).parent().parent().slideUp();
                                                                 // todo - intersect w/ data and call delete on those items
                                                                 return false;
                                                             });

        this.notesList.find('li .actions .item_edit').live('click',
                                                           function(evt){
                                                               evt.stopPropagation();
                                                               // todo - intersect w/ data and call delete on those items
                                                               return false;
                                                           });
	    /*
         jQuery('#delete_notes').click(function() {
         var notes = this_.notesList.find('li.selected');
         // todo - intersect w/ data and call delete on those items
         notes.slideUp();
         });

         jQuery('#tag_notes').click(function() {
         alert('about to tag some notes');
         var notes = this_.notesList.find('li.selected');
         // todo - intersect w/ data and allow the user to tag those items
         });
	     */

        jQuery('.popup .remove').live('click', function(item) { this_.hidePopup(); });
    },

    resizeIt: function(jObj) {
        var str = jObj.val();
        var cols = jObj.attr('cols');
        var linecount = 0;

        str.split("\n").map(function(l) {
		                        linecount += 1 + Math.floor( l.length / cols ); // take into account long lines
	                        });

        jObj.attr({rows: linecount });
    },

    changeTab: function(name, type){
        this.searhchString = undefined;
        
        if (type == "add") {
            this.showAddPopup();
            
        } else if (type == 'settings') {
            this.tabsList.find('li').removeClass('selected');
            jQuery('#notes, #main_input').hide();
            this.settingsDiv.show();

        } else {
            jQuery('#notes, #main_input').show();
            this.settingsDiv.hide();

            this.updateNotesDisplay(name, type);
            this.tabsList.find('li').removeClass('selected');
            this.tabsList.find('.tab_' + name).addClass('selected');
        }
    },

    showAddPopup: function() {
        this.showPopup('add_tab');
    },

    buildTabs: function(tabs, startingTab) {
        var this_ = this;

        jQuery.fn.append.apply(jQuery('#sort_tabs'), tabs.map(function(tab){
                                                                  return this_.templates.getTabHtml(tab, startingTab, true);
                                                              }));

        tabs.push({name:'+', type:'add'});

        jQuery.fn.append.apply(this.tabsList, tabs.map(function(tab){
                                                           return this_.templates.getTabHtml(tab, startingTab, false);
                                                       }));
        //todo make draggable / sortable
    },

    updateNotesDisplay: function(name, type, hashAtSearch) {
        if (name == this.name){ return; }

        type = type || this.type;
        name = name || this.name;

        this.type = type;
        this.name = name;

        var notes;

        if (!this.searchString || !this.searchString.trim()) {
            this.searchString = undefined;
        }

        if (this.searchString) {
            // search only current tab
            notes = this.getNotesForType(name, type);
            notes = this.searchNotesSimple(this.searchString, notes, notes);

        } else {
            notes = this.getNotesForType(name, type);
        }

        this.notesList.html('');
        if (hashAtSearch && this.searchString) {
            this.addCustomSearchDisplay(this.searchString);
        }

        this.addNotes(notes);
        this.notesList.scrollTop(0);
    },

    addCustomSearchDisplay: function(name){
        this.notesList.append(this.templates.getCustomSearchHtml(name));
    },

    removeCustomSearch: function() {
        this.searchString = "";
        this.updateNotesDisplay();
    },

    getNotesForType: function(name, type) {
        type = type || this.type;
        name = name || this.name;

        if (type == 'native') {
            if (name == 'people') {
                return this.people;
            } else if (name == 'events') {
                return this.events;
            } else if (name == 'now') {
                return this.notes.filter(function(n){
                                             return n.contents.indexOf('http') < 0 && n.category != "Journal" && n.category != "Reference";
                                         });
            } else if (name == 'todo') {
                return this.notes.filter(function(n){
                                             return n.contents.indexOf('todo') > -1;
                                         });
            } else if (name == 'notes') {
                return this.notes.filter(function(n){
                                             return n.category == 'Reference' || n.category == 'Journal';
                                         });
            }

            // todo
            return this.notes;
        } else if (type == "search") {

            var search = this.getTabForTabName(name).search;
            return this.searchNotesSimple(search, this.notes, this.notes);
        }
    },

    getTabForTabName:function(name){
        return this.tabs.filter(function(tab){ return tab.name.toLowerCase() == name.toLowerCase(); })[0];
    },

    getLocationHash: function(){
        return window.location.hash.replace('#', '');
    },

    setupSearch: function(searchDiv, notes) {
        var this_ = this;
        searchDiv.keyup(function(evt) {
                            try {
                                this_.resizeIt(searchDiv);
                                var keycode = evt.which;
                                var val = jQuery(this).val();
                                this_.searchString = val ? val.trim() : undefined;

                                if (keycode == 39 || keycode == 37 || keycode == 190){ return; }

                                if (!val || val.replace(/\n/g,'').length < 1) {
                                    this_.inputControlsDiv.hide();

                                } else if (this_.inputControlsDiv.is(':hidden')) {
                                    this_.inputControlsDiv.show();
                                }

				                // this searches the notes
                                // this_.updateNotesDisplay();
                            } catch (x) {
                                console.log(x);
                            }
                        });
    },

    searchNotesSimple: function(word, notes) {
        var this_ = this;
        return notes.filter(function(note){
                                var txt = note.contents ? note.contents : note.searchTxt;
                                if (txt && txt.indexOf(word) > -1){
                                    return true;
                                }
                                return false;
                            });
    },

    getPeople: function(){
        return FBDATA.filter(function(d){ if (d.type === 'schemas.Person') { return true ;} return false;  })
	        .map(function(d){ d.searchTxt = "@" + (d['first name'] + d['last name']).toLowerCase(); d.searchTxt = d.searchTxt.split(' ').join(''); return d; })
            .sort(function(a, b) { return a.searchTxt[1] > b.searchTxt[1]; });
    },

    getEvents: function(){
        return FBDATA.filter(function(d){
                                 if (d.type == 'schemas.Event') {return true;} return false;
                             }).map(function(d){ d.searchTxt = d.name.toLowerCase() + " " + d.location.toLowerCase(); return d; });
    },

    showPopup: function(id) {
        jQuery("#" + id).show();
        jQuery('#container, header').css('opacity', 0.2);
    },

    hidePopup: function() {
        jQuery('.popup').hide();

        jQuery('#container, header').css('opacity', 1);
    },

    getStartingTab: function() {
        var startingTabName = this.getLocationHash();
        var startingTab = startingTabName.length > 1 ? this.getTabForTabName(startingTabName) : this.tabs[0];
	    if (!startingTab){ startingTab = this.tabs[0]; } // incase the url gets screwy w/ all the redirects
	    return startingTab;
    },

    setLocationFromGeocode: function(loc, queryLatLng) {
	    this.currentLocation = {
	        lat: loc.geometry.location.lat(),
            lng: loc.geometry.location.lng(),
	        qlat: queryLatLng.lat(),
            qlng: queryLatLng.lng(),
	        name: loc.formatted_address,
	        type: loc.type
	    };

        jQuery('.location_input select').prepend('<option>' + Atomate.currentLocation.name + '</option>');
    },

    addNotes: function(notes) {
        var this_ = this;
        if (!notes) { return; }
        jQuery.fn.append.apply(this.notesList, notes.map(function(n){ return this_.templates.getItemHtml(n); }));
    }
};


/**
 *
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


 */