var keystone = require('keystone'),
    Types = keystone.Field.Types;

// Create model. Additional options allow menu name to be used what auto-generating URLs
var InternalNotes = new keystone.List('Internal Note', {
    track: true,
    autokey: { path: 'key', from: 'slug', unique: true },
    defaultSort: 'date'
});

// Create fields
InternalNotes.add({

    child: { type: Types.Relationship, label: 'child', ref: 'Child', initial: true, },
    family: { type: Types.Relationship, label: 'family', ref: 'Family', initial: true },
    date: { type: Types.Text, label: 'note date', note: 'mm/dd/yyyy', required: true, noedit: true, initial: true, },
    employee: { type: Types.Relationship, label: 'note creator', ref: 'Admin', required: true, noedit: true, initial: true, },
    note: { type: Types.Textarea, label: 'note', required: true, initial: true, }

});

// Pre Save
InternalNotes.schema.pre('save', function(next) {
    'use strict';

    // generate an internal ID based on the current highest internal ID
    // get the employee who is currently logged in and save ID to employee

    // TODO: Assign a registration number if one isn't assigned
    next();
});

// Define default columns in the admin interface and register the model
InternalNotes.defaultColumns = 'date, child, family, note';
InternalNotes.register();