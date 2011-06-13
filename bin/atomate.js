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
                      name:'People',
                      type:'native'
                  }, {
                      name:'javascript',
                      type:'search',
                      search:'#javascript'
                  }],
    initialize: function(params) {
        this.notes = this.buildTrieForNotes(params.redactedNotes.slice(0, 1000));
        this.people = this.getPeople();
        this.events = this.getEvents();

        this.tracking.initialize(params);
        this.tabs = params.tabs || this.defaultTabs;
        this.notesList = jQuery("#notes");
        this.tabsList = jQuery('#tabs');
        this.searchDiv = jQuery('#main_input');
        this.notesCount = jQuery('#stats .num_notes .num');

        var startingTabName = this.getLocationHash();
        var startingTab = startingTabName.length > 1 ? this.getTabForTabName(startingTabName) : this.tabs[0]; 
        
        this.buildTabs(this.tabs, startingTab);
        this.setupSearch(this.searchDiv, this.notes);
        this.setupMouseEvents();
        this.updateNotesDisplay(startingTab.name.toLowerCase(), startingTab.type);
        this.auth.initialize();
    },

    getPeople: function(){
        return FBDATA.filter(function(d){
                                       if (d.type == 'schemas.Person') { return true ;}
                                       return false;                           
                                  }).sort(function(a, b) {
                        return a['first name'][0].toLowerCase() > b['first name'][0].toLowerCase();
                    }).map(function(d){ d.searchTxt = "@" + (d['first name'] + d['last name']).toLowerCase(); return d; });
    },

    getEvents: function(){
        return FBDATA.filter(function(d){
                                 if (d.type == 'schemas.Event') {return true;} return false;                           
                             }).map(function(d){ d.searchTxt = d.name.toLowerCase(); return d; });        
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

        this.tabsList.find('li .remove').live('click', 
                                      function(evt) {
                                          evt.stopPropagation();
                                          var jObj = jQuery(this).parent();
                                          var type = jObj.attr('class');
                                          type = type.replace('tab_', '');

                                          jObj.hide();
                                          return false;
                                          // todo - SAVE that the user removed this
                                      });                        

        this.notesList.find('li').live('click', 
                                      function(evt) {
                                          var jObj = jQuery(this);
                                          jObj.toggleClass('selected');
                                          
                                          this_.updateSelectedCount(this_.notesList.find('.selected').length);
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

        this.notesList.find('li').live('dblclick', 
                                      function(evt) {
                                          var jObj = jQuery(this);
                                          this_.makeNoteEditable(jObj);
                                      });                        


        jQuery('.popup .remove').live('click', 
                              function(item) {
                                  this_.hidePopup();
                              });                        

    },
    
    changeTab: function(name, type){
        if (type == "add") {
            this.showAddPopup();
        } else if (type == 'settings') {
            this.tabsList.find('li').removeClass('selected');
            jQuery('#stats, #notes, #main_input').hide();
            jQuery('#settings').show();
        } else {
            jQuery('#stats, #notes, #main_input').show();
            jQuery('#settings').hide();

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

        tabs.push({
                      name:'+',
                      type:'add'
                  });
        
        jQuery.fn.append.apply(this.tabsList, tabs.map(function(tab){
                                                           return this_.getTabHtml(tab, startingTab);
                                                       }));        
        //todo make draggable
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
        this.updateNotesCount(notes);
        this.notesList.scrollTop(0); 
    },

    addCustomSearchDisplay: function(name){
        this.notesList.append("<li class=\"custom_search\">"
                              + "<div class=\"text\">Searching for: <b>"  + name + "</b> <a class=\"remove_custom_search\">remove</a></div>"
                              + "</li>");
    },
    
    removeCustomSearch: function() {
        this.searchString = "";
        this.updateNotesDisplay();
    },

    updateSelectedCount: function(num){
      jQuery('#stats .actions .num').text(num);  
    },
    
    updateNotesCount: function(notes){
        if (!notes) {
            return this.notesCount.text(0);
        }
        var num = notes.length;
        this.notesCount.text(num);
    },

    getNotesForType: function(name, type) {
        type = type || this.type;
        name = name || this.name;

        if (type == 'native') {
            if (name == 'people') {
                return this.people;
            } else if (name == 'events') {
                return this.events;
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
    
    getTabName: function(tab) {
        if (tab.name == "+") {
            return 'plus'; 
        }
        return tab.name.toLowerCase();
    },

    getTabHtml: function(tab, startingTab) { 
        return "<li data-type=\"" + tab.type + "\""
            + " data-name=\"" + this.getTabName(tab) + "\" class=\"tab_" + this.getTabName(tab)
            + (startingTab.name.toLowerCase() == tab.name.toLowerCase() ? ' selected' : "")
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
                            this_.searchString = val;
                            
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

                            try {                                
                                this_.updateNotesDisplay();
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
        if (!notes) {
            return;
        }
        jQuery.fn.append.apply(this.notesList, notes.map(function(n){ 
                                                             if (!n.type) { // is a note -- temporary
                                                                 return this_.getNoteHtml(n);
                                                             } else if (n.type == "schemas.Person") {
                                                                 return this_.getPersonHtml(n);
                                                             } else if (n.type == "schemas.Event") {
                                                                 return this_.getEventHtml(n);                                                                 
                                                             }
                                                         }));
        //this.notesList.html(notes.map(function(n){ return this_.getItemHtml(n); }).join(''));
    },

    linkifyNote: function(text) {
        text = text.replace(
                /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi,
            function(url){
                var full_url = url;
                if (!full_url.match('^https?:\/\/')) {
                    full_url = 'http://' + full_url;
                }
                return '<a href="' + full_url + '" target="_blank">' + url + '</a>';
            });

        text = text.replace(/(^|\s)@(\w+)/g, '$1<a class=\"at_link\" data-id=\"@$2\">@$2</a>');
        return text.replace(/(^|\s)#(\w+)/g, '$1<a class=\"hash_link\" data-id=\"#$2\">#$2</a>');
    },

    getPersonPhotoUrl: function(item) {
        if (item.fbid) {
            return "http://graph.facebook.com/" + item.fbid + "/picture?type=square";
        }
    },

    getItemType: function(type){
      return type.toLowerCase().replace('schemas.', '');
    },

    getPersonHtml: function(item) {
        return "<li class=\"type_" + this.getItemType(item.type) + "\">"
            + "<img class=\"profile_photo\" src=\"" + this.getPersonPhotoUrl(item) + "\" />"
            + "<div class=\"text\"><a class=\"at_link\" data-id=\"" + item.searchTxt + "\">"  + item['first name'] + " " + item['last name'] + "</a></div>"
            + "</li>";
    },

    getEventHtml: function(item) {
        var link = item.source == "Facebook" ? "http://www.facebook.com/event.php?eid=" + item.id : "";

        return "<li class=\"" + this.getItemType(item.type) + "\">"
            + "<div class=\"text\">"
            + (link ? "<a href=\"" + link + "\" target=\"_blank\">" : "")
            + item.name
            + (link ? "</a>" : "")
            + "</div>"
            + "<div class=\"context\">"
            + "<span class=\"context_item\"><img src=\"../img/location.png\" /><a class=\"at_link\" data-id=\"" + item.location + "\">" + item.location + "</a></span>"
            + "<span class=\"context_item\"><img src=\"../img/calendar.png\" />From <b>" + Atomate.util.getNaturalDate(item['start time'].val)
            + "</b> to <b>" + Atomate.util.getNaturalDate(item['end time'].val) + "</b></span>"
            + "</div>"
            + "</li>";       
    },

    getNoteHtml: function(item) {
        return "<li class=\"" + this.getItemType(item.category) + "\">"
            + "<div class=\"text\">"  + this.linkifyNote(item.contents) + "</div>"
            + "<div class=\"context\">"
            + "<span class=\"context_item\"><img src=\"../img/location.png\" />New York, NY</span>"
            + "<span class=\"context_item\"><img src=\"../img/calendar.png\" />Tomorrow 5:30pm</span>"
            + "</div>"
            + "</li>";       
    }
};


