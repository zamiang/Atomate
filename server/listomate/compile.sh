#!/bin/bash
java -jar compiler.jar --js=js/atomate.js --js=js/util.js --js=js/detector.js --js=js/validator.js --js=js/tracking.js --js=js/templates.js --js=js/autocomplete.js --js=js/notes.js --js=js/database.js --js=js/database.notes.js --js=js/database.person.js --js=js/auth.js --js=js/auth.fb.js --js_output_file=js/base.js
