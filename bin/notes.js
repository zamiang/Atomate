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
                                           var jid = noteDiv.attr('data-id');
                                           var contents = noteDiv.find('textarea').val().trim(); // todo escape/remove html
                                           var created = new Date().valueOf();
                                           var reminder = this_.getDateForNoteCreationDateTime(noteDiv.find('input:eq(0)'), noteDiv.find('input:eq(1)'));
                                           var type = this_.getNoteType(contents);
                                           var tags = this_.getTagsForNote(contents);
                                           
                                           // it is a new note
                                           if (noteDiv.attr('id') == 'input') {                                               
                                               this_.parent.database.notes.addNewNote(created, contents, tags, type, reminder,
                                                                                      function(jid){
                                                                                          this_.parent.database.notes.getNoteById(jid, 
                                                                                                                                  function(n) {
                                                                                                                                      this_.parent.notes.push(n);
                                                                                                                                      noteDiv.find('textarea, input[type="text"]').val('');                                                   
                                                                                                                                      this_.appendNote(n, true);  
                                                                                                                                  });
                                                                                      });                                                                                                                                      
                                           } else {
                                               // this is a note tha tis being edited
                                               this_.parent.database.notes.getNoteById(jid, 
                                                                                       function(n) {
                                                                                           n.contents = contents;
                                                                                           n.reminder = reminder;
                                                                                           n.type = type;
                                                                                           n.tags = tags;

                                                                                           // jid, version, created, edited, deleted, contents, modified, tags, type, reminder, source
                                                                                           this_.parent.database.notes.editNote(n.id, n.version++, n.created, new Date().valueOf(), n.deleted, n.contents, n.modified++, n.tags, n.type, n.reminder, n.source);
                                                                                           this_.appendNote(n, false);                                                                                                                           
                                                                                       });
                                           }
                                       });   
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

    getDateForNoteCreationDateTime: function(date, time) {
        // todo: this will be annoying -- check old poyozo code
        return 0;  
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
      
        this.createNoteEditor(jObj,id, text,date,location);  
    },  

    appendNote: function(note, prepend) {
        var html = this.parent.templates.getNoteHtml(note);
        if (prepend) {
            this.parent.notesList.prepend(html);

        } else {
            jQuery('#' + note.id).html(html);
        }
    }
};