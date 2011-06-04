#!/bin/bash
java -jar compiler.jar --js=bin/forms.js --js=bin/builder.js --js=bin/placemaker.js --js=bin/checker.js --js=bin/helpers.js --js=bin/validator.js --js=lib/util.js --js=lib/lib.js --js=lib/json2.js --js_output_file=forms.js
