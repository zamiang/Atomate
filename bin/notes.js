/**
 * attaches mouse listeners for note interaction
 * does not include autocomplte for tags
 * listeners are done via jquery.live so that they do not have to be re-initialized 
 * when a note is being edited
 * 
 */

Atomate.notes = {
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
                                           var contents = noteDiv.find('textarea').val().trim(); // todo escape/remove html
                                           var created = new Date().valueOf();
                                           var reminder = this_.getDateForNoteCreationDateTime(noteDiv.find('input:eq(0)'), noteDiv.find('input:eq(1)'));
                                           var type = this_.getNoteType(contents);
                                           var tags = this_.getTagsForNote(contents);
                                           
                                           // it is the main input
                                           // prepend the note
                                           this_.parent.database.notes.addNewNote(created, contents, tags, type, reminder,
                                                                           function(jid){
                                                                               this_.parent.database.notes.getNoteById(jid, 
                                                                                                                       function(n){
                                                                                                                           this_.parent.notes.push(n);

                                                                                                                           if (noteDiv.attr('id') == 'input') {
                                                                                                                               // this is a new note
                                                                                                                               noteDiv.find('textarea, input[type="text"]').val('');
                                                                                                                               this_.appendNote(note, true);
                                                                                                                               
                                                                                                                           } else {
                                                                                                                               // this is a note tha tis being edited
                                                                                                                               
                                                                                                                           }
                                                                                                                       });
                                                                           });
                                       });   
    },

    createNoteEditor: function(jObj, text, date, time, location) {
        jObj.html(this.parent.templates.noteEditor(text, date, time, location));
    }, 

    editNote: function(div) {
        var jObj = jQuery(div);
        var id = jObj.attr('id').replace('note_', '').replace('#', '');
        var text = jObj.find('.text').text();
        var location = jObj.find('.location').text(); // NOT IMPLEMENTED
        var date = new Date(parseInt(jObj.find('.date').attr('data-val'), 10));
      
        this.createNoteEditor(jObj,text,date,time,location);  
    },  

    appendNote: function(note, prepend) {
        console.log(note);
        try {
            
        var html = this.parent.templates.getNoteHtml(note);
        if (prepend) {
            this.parent.notesList.prepend(html);

        } else {
            jQuery('#' + note.id).html(html);
        }
        } catch (x) {
            console.log(x);
        }

    }
};