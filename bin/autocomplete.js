/**
 * This module controls the autocomplete search for people and tags
 * it is initially sets up to work with the main input but extends to work with editing individual note editing
 *
 */

Atomate.autocomplete = {
    parent: Atomate,
    initialize: function() { 
	    var data = this.parent.people.map(function(p){ return p.searchTxt; });
	    var tags = this.parent.notes.map(function(n){ return n.contents; }).join(' ').match(/[#]+[A-Za-z0-9-_]+/g); // looks for hash tags in text
	    
	    this.data = this.parent.util.uniq(data.concat(tags));	
	    this.autocompleteDiv = this.setupAutocompleteDiv(this.parent.searchDiv, this.setAutocompleteVal);
    },
    
    setupAutocompleteDiv: function(searchDiv, cont) {
	return searchDiv.autocomplete({
		                              minLength: 0,
		                              source: this.data,
		                              search: function() {
		                                  if (this.value[0] === "@" || this.value[0] === "#" ) {
			                                  return true;
		                                  }
		                                  return false;
		                              },
		                              focus: function( event, ui ) {
		                                  console.log('focusing');
		                                  cont(ui.item.value, searchDiv);
		                                  return false;
		                              },
		                              select: function( event, ui ) {
		                                  console.log('select');
		                                  cont(ui.item.value, searchDiv);
		                                  return false;
		                              }
	                              });
    },
    
    setAutocompleteVal: function(val, searchDiv) {
	    console.log(val);
	    searchDiv.val(val);
    }
};

