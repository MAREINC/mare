var keystone = require('keystone'),
	Types = keystone.Field.Types;

// Create model. Additional options allow menu name to be used what auto-generating URLs
var FamilyConstellation = new keystone.List('Family Constellation', {
	autokey: { path: 'key', from: 'familyConstellation', unique: true },
	map: { name: 'familyConstellation' },
	hidden: true
});

// Create fields
FamilyConstellation.add({
	familyConstellation: { type: Types.Text, label: 'family constellation', required: true, initial: true }
});

// Define default columns in the admin interface and register the model
FamilyConstellation.defaultColumns = 'familyConstellation';
FamilyConstellation.register();