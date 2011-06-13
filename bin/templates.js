/*
 * functions for building items
 * this way is faster than having it in html (in theory)
 * 
 * 
 */

Atomate.templates = {
    getItemHtml: function(n) {
        if (!n.type) { // is a note -- temporary
            return this.getNoteHtml(n);
        } else if (n.type == "schemas.Person") {
            return this.getPersonHtml(n);
        } else if (n.type == "schemas.Event") {
            return this.getEventHtml(n);                                                                 
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
    
    getTabHtml: function(tab, startingTab) { 
        return "<li data-type=\"" + tab.type + "\""
            + " data-name=\"" + this.getTabName(tab) + "\" class=\"tab_" + this.getTabName(tab)
            + (startingTab.name.toLowerCase() == tab.name.toLowerCase() ? ' selected' : "")
            + "\">" 
            + "<a href=\"#" + tab.name.toLowerCase() + "\">" + tab.name + "</a>"
            + "<img class=\"remove\" src=\"../img/remove.png\" />"
            + "</li>";        
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
            + "<img class=\"profile_photo\" src=\"" + this.getPersonPhotoUrl(item) + "\" />"
            + "<div class=\"text\"><a class=\"at_link\" data-id=\"" + item.searchTxt + "\">"  + item['first name'] + " " + item['last name'] + "</a></div>"
            + "</li>";
    },

    getEventHtml: function(item) {
        var link = item.source == "Facebook" ? "http://www.facebook.com/event.php?eid=" + item.id : "";

        return "<li class=\"" + this.getItemType(item.type) + "\">"
            + this.getActionsHtml(item)
            + "<div class=\"text\">"
            + (link ? "<a href=\"" + link + "\" target=\"_blank\">" : "")
            + item.name
            + (link ? "</a>" : "")
            + "</div>"
            + "<div class=\"context\">"
            + "<span class=\"context_item\"><img src=\"../img/location.png\" /><a class=\"at_link\" data-id=\"" + item.location.toLowerCase() + "\">" + item.location + "</a></span>"
            + "<span class=\"context_item\"><img src=\"../img/calendar.png\" />From <b>" + Atomate.util.getNaturalDate(item['start time'].val)
            + "</b> to <b>" + Atomate.util.getNaturalDate(item['end time'].val) + "</b></span>"
            + "</div>"
            + "</li>";       
    },

    getNoteHtml: function(item) {
        return "<li class=\"note " + this.getItemType(item.category) + "\">"
            + this.getActionsHtml(item)
            + "<div class=\"text\">"  + this.linkifyNote(item.contents) + "</div>"
            + "<div class=\"context\">"
            + "<span class=\"context_item\"><img src=\"../img/location.png\" />New York, NY</span>"
            + "<span class=\"context_item\"><img src=\"../img/calendar.png\" />Tomorrow 5:30pm</span>"
            + "</div>"
            + "</li>";       
    }
};