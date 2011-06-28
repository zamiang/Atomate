/*
 * functions for building items
 * this way is faster than having it in html (in theory)
 * 
 * 
 */

Atomate.templates = {
    parent: Atomate,
    getItemHtml: function(n) {
        if (!n.type) { // is a note -- temporary
            return this.getNoteHtml(n);
        } else if (n.type == "person") {
            return this.getPersonHtml(n);
        } else if (n.type == "event") {
            return this.getNoteHtml(n);                                                                 
        } else {
            return this.getNoteHtml(n);
        }
    },
    
    getCustomSearchHtml: function(name){
        return "<li class=\"custom_search\">"
            + "<div class=\"text\">Searching for: <b>"  + name + "</b> <a class=\"remove_custom_search\">remove</a></div>"
            + "</li>";
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

    getTabName: function(tab) {
        if (tab.name == "+") {
            return 'plus'; 
        }
        return tab.name.toLowerCase();
    },
    
    getTabHtml: function(tab, startingTab, showRemove) { 
	    if (tab && tab.name !== undefined) {
            return "<li data-type=\"" + tab.type + "\""
                + " data-name=\"" + this.getTabName(tab) + "\" class=\"tab_" + this.getTabName(tab)
                + (startingTab.name.toLowerCase() == tab.name.toLowerCase() ? ' selected' : "")
                + "\">" 
                + "<a href=\"#" + tab.name.toLowerCase() + "\">" + tab.name + "</a>"
                + (showRemove ? "<img class=\"remove\" src=\"../img/remove.png\" />" : "")
                + "</li>";        
	    }
    },

    getItemType: function(type){
        return type.toLowerCase().replace('schemas.', '');
    },

    getActionsHtml: function(item) {
        // may eventually want to have different actions depending on the type of item
        return "<div class=\"actions\"><img class=\"item_remove\" src=\"../img/remove.png\" /><img class=\"item_edit\" src=\"../img/settings_16.png\" /></div>";  
    },
    
    getPersonHtml: function(item) {
        return "<li class=\"type_" + this.getItemType(item.type) + "\">"
            + this.getActionsHtml(item)
            + "<img class=\"profile_photo\" src=\"" + item.photourl + "\" />"
            + "<div class=\"text\">"
            + "<a class=\"at_link\" data-id=\"" + item.tag + "\">"  + item.name + "</a>"
            + (item.fbid ? "<br /><a class=\"external\" href=\"http://www.facebook.com/profile.php?id=" + item.fbid + "\" target=\"_blank\">Facebook</a>" : "")
            + "</div>"
            + "</li>";
    },
    
    getNoteEditorHtml: function(id, text, date, location) {
        return "<div class=\"note_input\" data-id=\"" + id + "\">" +
            "<textarea rows=\"1\" cols=\"52\"></textarea><div class=\"controls clearfix\">" +
            "<input type=\"submit\" value=\"Save\" class=\"notes_save_btn\" />" +
            "<div class=\"location_input\"><label>Location:</label>" +
            "<select>" +
            "<option val=\"none\">None</option>" + // TODO: add location
            "</select>" +         
            "<label>Time:</label>" + 
            "<input type=\"text\" placeholder=\"6/25/2011\" class=\"picker_date\" val=\"" + (date ? date.format("m/dd/yy") : "") +"\" />" + 
            "<input type=\"text\" placeholder=\"10:30pm\" class=\"picker_time\" val=\"" + (date ? date.format('h:MM TT') : "") +"\" />" +
            "</div></div></div>";
    },

    getNoteHtml: function(item) {
        return "<li id=\"note_" + item.id + "\" class=\"note type_" + this.getItemType(item.type) + "\">"
            + this.getActionsHtml(item)
            + "<div class=\"text\">"  + this.linkifyNote(item.contents) + "</div>"
            + "<div class=\"context\">"
            + (item.location ? "<span class=\"context_item location\"><img src=\"../img/location.png\" />" + item.location + "</span>" : "")
            + (item.reminder ? "<span class=\"context_item date\" data-val=\"" + item.reminder + "\"><img src=\"../img/calendar.png\" />" + this.parent.util.getNaturalDate(item.reminder) + "</span>" : "")
            + (item.type && item.type !== "note" && item.type !== "event" ? "<span>" + item.type + "</span>" : "")
            + "</div>"
            + "</li>";       
    }
};