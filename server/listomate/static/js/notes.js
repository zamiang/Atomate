/**
 * attaches mouse listeners for note interaction
 * does not include autocomplte for tags
 * listeners are done via jquery.live so that they do not have to be re-initialized 
 * when a note is being edited
 * 
 */

Atomate.noteEdit = {
    parent: Atomate,
    initialize: function(){
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        var this_ = this;

        jQuery('.notes_save_btn').live('click',
                                       function(evt) {
                                           evt.stopPropagation();
                                          
                                           var noteDiv = jQuery(this).parent().parent();
                                           this_.editOrCreateNoteForDiv(noteDiv);
                                       });   

        // setup edit
        this.parent.notesList.find('li.note').live('dblclick',
                                            function(evt) {
                                                var jObj = jQuery(this);
                                                this_.editNote(jObj);
                                            });

        // setup remove
        this.parent.notesList.find('li .actions .item_remove').live('click',
                                                             function(evt){
                                                                 evt.stopPropagation();
                                                                 var jObj = jQuery(this).parent().parent();
                                                                 this_.parent.database.notes.deleteNote(jObj.attr('data-id'), function() {
                                                                                                            jObj.slideUp();
                                                                                                        });
                                                             });

        // edit pt 2
        this.parent.notesList.find('li .actions .item_edit').live('click',
                                                           function(evt){
                                                               evt.stopPropagation();
                                                               var jObj = jQuery(this).parent().parent();
                                                               this_.editNote(jObj);
                                                           });

        //jQuery('.)
    },

    editOrCreateNoteForDiv: function(noteDiv) {
        var this_ = this;
        var id = noteDiv.attr('data-id');
        var contents = noteDiv.find('textarea').val().trim(); // todo escape/remove html
        var created = new Date().valueOf();
        var reminder = this.getDateForNoteCreationDateTime(noteDiv.find('.picker_date').val(), noteDiv.find('.picker_time').val());
        var type = this.getNoteType(contents);
        var tags = this.getTagsForNote(contents);
        var locationid = this.getLocationIdForNote(noteDiv); // TODO: when i add locations
        
        // it is a new note
        if (noteDiv.attr('id') == 'input') {                       
            debug('adding a new note');
            this.parent.database.notes.addNewNote(created, contents, tags, type, reminder, locationid,
                                                   function(id) {  
                                                       debug('adding a new note');
                                                       this_.parent.database.notes.getNoteById(id, 
                                                                                               function(n) {
                                                                                                   debug(n + ' foo')
                                                                                                   this_.parent.notes.push(n);
                                                                                                   debug(n + ' boo')
                                                                                                   noteDiv.find('textarea, input[type="text"]').val('');                                                   
                                                                                                   debug(n + ' doo')
                                                                                                   this_.appendNote(n, true);  
                                                                                               });
                                                   });                                
        } else {
            // this is a note that is being edited
            this.parent.database.notes.getNoteById(id, 
                                                    function(n) {
                                                        this_.parent.database.notes.editNote(
                                                            id, n.version++, n.created, new Date().valueOf(), 0, contents, n.modified++, tags, type, reminder, n.source, n.locationid, 
                                                            function(newNote) {
                                                                this_.appendNote(newNote, false);   
                                                                this_.parent.database.replaceNoteInLocalCache(newNote);
                                                            });
                                                    });
        }        
    },
    
    getNoteType: function(contents, reminder){
        // VERYYYYYYYYYY basic
        var c = contents.toLowerCase();

        if (c.indexOf('remind me') > -1) {
            return "reminder";
        } else if (c.indexOf('http://') > -1) {
            return 'bookmark';
        } else if (c.indexOf('todo') > -1) {
            return 'todo';
        } else {
            return 'note';
        }
    },

    getLocationIdForNote: function(jObj) {
        // todo -handle adding new locations
        return jObj.find('.location').attr('data-id') || 0;  
    },

    getDateForNoteCreationDateTime: function(date, time) {
        try {
            return Date.parse(date + " " + time);
        } catch (x) {
            debug(x);
            return 0;
        }
    },  

    getTagsForNote: function(contents){
        var tags =  contents.toLowerCase().match(/[#]+[A-Za-z0-9-_]+/g);
        return tags ? tags.join(' ') : "";        
    },    

    createNoteEditor: function(jObj, id, text, date, location) {
        jObj.html(this.parent.templates.getNoteEditorHtml(id, text, date, location));
    }, 

    editNote: function(div) {
        var jObj = jQuery(div);
        var id = jObj.attr('id').replace('note_', '').replace('#', '');
        var text = jObj.find('.text').text();
        var location = jObj.find('.location').text(); // NOT IMPLEMENTED
        var date = parseInt(jObj.find('.date').attr('data-val'), 10);
        date = date ? new Date(date) : undefined;

        this.createNoteEditor(jObj, id, text, date, location);  
    },  

    appendNote: function(note, prepend) {        
        if (prepend) {
            var html = this.parent.templates.getNoteHtml(note);
            this.parent.notesList.prepend(html);

        } else {
            var html = this.parent.templates._getNoteHtml(note);
            jQuery('#note_' + note.id).html(html);
        }
    }
};