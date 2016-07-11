var keystone = require('keystone'),
Types = keystone.Field.Types;

// Create model
var SectionHeader = new keystone.List('Section Header', {
	track: true,
	autokey: { path: 'key', from: 'target', unique: true },
	map: { name: 'target' }
});

// Create fields
SectionHeader.add('Site Area', {

    target: { type: Types.Select, label: 'header for site area', options: 'Considering Adoption, Meet the Children, Family Support Services, For Social Workers, Events, Ways to Help, About Us', unique: true, required: true, initial: true }

}, 'Details', {
	// TODO: The image isn't being saved with the fileName value, instead it's a random hash.  This needs to be fixed
    originalImage: { type: Types.CloudinaryImage, label: 'family name', note: '644px by 166px', folder: 'sectionHeaders/', publicId: 'fileName', autoCleanup: true },
	headerImage: {type: Types.Url, hidden: true },
	header: { type: Types.Text, label: 'header text', required: true, initial: true }

/* Container for all system fields (add a heading if any are meant to be visible through the admin UI) */
}, {

	// system field to store an appropriate file prefix
	fileName: { type: Types.Text, hidden: true }

});

// Pre Save
SectionHeader.schema.pre('save', function(next) {
	'use strict';

	// TODO: Play with lowering quality to 0 and doubling the image size as an optimization technique
	this.headerImage = this._.originalImage.thumbnail(644,166,{ quality: 80 });
	// Create an identifying name for file uploads
	this.fileName = this.key.replace(/-/g, '_');
console.log(this);
	next();
});

// Define default columns in the admin interface and register the model
SectionHeader.defaultColumns = 'target, header, headerImage';
SectionHeader.register();
