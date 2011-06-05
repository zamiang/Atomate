/*
 * Atomate base
 * needs to be loaded 1st and initialized on document ready
 * 
 */

Atomate = {
    initialize: function(params) {
        this.tracking.initialize(params);
        this.notesList = jQuery("#notes");
        this.addRedactedNotes(params.redactedNotes.slice(0, 100));
    },
    addRedactedNotes: function(notes) {
        var this_ = this;
        jQuery.fn.append.apply(this.notesList, notes.map(function(n){ return this_.getItemHtml(n); }));
        //this.notesList.html(notes.map(function(n){ return this_.getItemHtml(n); }).join(''));
    },

    getItemHtml: function(item) {
        return "<li class=\"" +  item.category.toLowerCase() + "\">"
            + item.contents + "</li>";
            

    }




};