/**
 * This module controls the autocomplete search for people and tags
 * it is initially sets up to work with the main input but extends to work with editing individual note editing
 *
 */

Atomate.autocomplete = {
    parent: Atomate,
    initialize: function() { 
	    var data = this.parent.people.map(function(p){ return p.tag; });
	    var tags = this.parent.notes.map(function(n){ return n.tags.split(' '); }).reduce(function(a,b) { return a.concat(b); });   
        //.toLowerCase().match(/[#]+[A-Za-z0-9-_]+/g); // looks for hash tags in text
	    
	    this.data = this.parent.util.uniq(data.concat(tags));	
	    this.autocompleteDiv = this.setupAutocompleteDiv(this.parent.searchDiv, this.setAutocompleteVal);
    },
    
    setupAutocompleteDiv: function(searchDiv, cont) {
        var this_ = this;

        function split(val) {      
            return val.split(' ');
        }
        
        function extractLast(term) {            
            return split(term).pop();
        }
        
	    return searchDiv
            .bind("keydown", function(event) {
                      if (event.keyCode === $.ui.keyCode.TAB && $(this).data("autocomplete").menu.active) {
                          event.preventDefault();
                      }
                  })
            .autocomplete({
		                      minLength: 3,
                              source: function(request, response) {                                              
                                  var term = request.term;
                                  var results = [];
                                  
                                  if (term.indexOf("@") >= 0 || term.indexOf("#") >= 0) {                                                  
                                      term = extractLast(request.term);
                                      
                                      if (term && term.length > 0 && (term.indexOf("@") == 0 || term.indexOf("#") == 0)) {                                                      
                                          results = jQuery.ui.autocomplete.filter(this_.data, term);
                                      } 
                                  }
                                  response(results);
                              },
		                      focus: function( event, ui ) {
                                  // focus is weird
                                  return false;
		                      },
                              select: function(event, ui) {                                              
                                  var terms = split(this.value);
                                  
                                  // remove the current input
                                  terms.pop();
                                  // add the selected item
                                  terms.push(ui.item.value);
                                  // add placeholder to get the comma-and-space at the end
                                  terms.push("");
                                  this.value = terms.join(" ");
                                  return false;
                              }
                          });
    }
};

