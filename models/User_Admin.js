var keystone	= require( 'keystone' ),
	Types		= keystone.Field.Types,
	User		= require( './User' ),
	Validators  = require( '../routes/middleware/validators' );

// Create model
var Admin = new keystone.List( 'Admin', {
	inherits: User,
	map: { name: 'name.full' },
	defaultSort: 'name.full',
	hidden: false,
	label: 'Admin'
});

// Create fields
Admin.add( 'Permissions', {

	isActive: { type: Boolean, label: 'is active' },

	permissions: {
		isVerified: { type: Boolean, label: 'has a verified email address', noedit: true, hidden: true },
		canMigrate: { type: Boolean, label: 'can migrate data', default: false, noedit: true, hidden: true }
	}

}, 'General Information', {

	name: {
		first: { type: Types.Text, label: 'first name', required: true, initial: true },
		last: { type: Types.Text, label: 'last name', required: true, initial: true },
		full: { type: Types.Text, label: 'name', hidden: true, noedit: true, initial: false }
	},

	avatar: {
		type: Types.CloudinaryImage,
		label: 'avatar',
		folder: `${ process.env.CLOUDINARY_DIRECTORY }/users/admin`,
		select: true,
		selectPrefix: `${ process.env.CLOUDINARY_DIRECTORY }/users/admin`,
		autoCleanup: true,
		whenExists: 'overwrite',
		filenameAsPublicID: true
	}

}, 'Contact Information', {

	phone: {
		work: { type: Types.Text, label: 'work phone number', initial: true, validate: Validators.phoneValidator },
		home: { type: Types.Text, label: 'home phone number', initial: true, validate: Validators.phoneValidator },
		mobile: { type: Types.Text, label: 'mobile phone number', initial: true, validate: Validators.phoneValidator },
		preferred: { type: Types.Select, label: 'preferred phone', options: 'work, home, mobile', initial: true }
	},

	address: {
	    street1: { type: Types.Text, label: 'street 1', initial: true },
		street2: { type: Types.Text, label: 'street 2', initial: true },
		city: { type: Types.Text, label: 'city', initial: true },
		state: { type: Types.Relationship, label: 'state', ref: 'State', initial: true },
		zipCode: { type: Types.Text, label: 'zip code', initial: true, validate: Validators.zipValidator }
    }

/* Container for data migration fields ( these should be kept until after phase 2 and the old system is phased out completely ) */
}, {

	oldId: { type: Types.Text, hidden: true }

});

// Set up relationship values to show up at the bottom of the model if any exist
Admin.relationship( { ref: 'CSC Region Contact', refPath: 'cscRegionContact', path: 'cscRegionContact', label: 'contact for the following regions' } );
Admin.relationship( { ref: 'Event', refPath: 'staffAttendees', path: 'events', label: 'events' } );
Admin.relationship( { ref: 'Donation', refPath: 'admin', path: 'donations', label: 'donations' } );

/* TODO: VERY IMPORTANT:  Need to fix this to provide the link to access the keystone admin panel again */
/* 						  Changing names or reworking this file changed the check in node_modules/keystone/templates/views/signin.jade
/*						  for user.isAdmin on line 14 */
// Provide access to Keystone
User.schema.virtual( 'canAccessKeystone' ).get( () => {
	'use strict';

	return true;
});

Admin.schema.virtual( 'displayName' ).get( function() {
	'use strict';

	return `${ this.name.first } ${ this.name.last }`;
});

// Pre Save
Admin.schema.pre( 'save', function( next ) {
	'use strict';
	// trim whitespace characters from any type.Text fields
	this.trimTextFields();
	// Populate the full name string for better identification when linking through Relationship field types
	this.name.full = this.name.first + ' ' + this.name.last;
	// Set the userType for role based page rendering
	this.userType = 'admin';

	next();
});

/* text fields don't automatically trim(), this is to ensure no leading or trailing whitespace gets saved into url, text, or text area fields */
Admin.schema.methods.trimTextFields = function() {

	if( this.get( 'name.first' ) ) {
		this.set( 'name.first', this.get( 'name.first' ).trim() );
	}

	if( this.get( 'name.last' ) ) {
		this.set( 'name.last', this.get( 'name.last' ).trim() );
	}

	if( this.get( 'name.full' ) ) {
		this.set( 'name.full', this.get( 'name.full' ).trim() );
	}

	if( this.get( 'phone.work' ) ) {
		this.set( 'phone.work', this.get( 'phone.work' ).trim() );
	}

	if( this.get( 'phone.home' ) ) {
		this.set( 'phone.home', this.get( 'phone.home' ).trim() );
	}

	if( this.get( 'phone.mobile' ) ) {
		this.set( 'phone.mobile', this.get( 'phone.mobile' ).trim() );
	}

	if( this.get( 'address.street1' ) ) {
		this.set( 'address.street1', this.get( 'address.street1' ).trim() );
	}

	if( this.get( 'address.street2' ) ) {
		this.set( 'address.street2', this.get( 'address.street2' ).trim() );
	}

	if( this.get( 'address.city' ) ) {
		this.set( 'address.city', this.get( 'address.city' ).trim() );
	}

	if( this.get( 'address.zipCode' ) ) {
		this.set( 'address.zipCode', this.get( 'address.zipCode' ).trim() );
	}
};

// Define default columns in the admin interface and register the model
Admin.defaultColumns = 'name.full, email, phone.work, isActive';
Admin.register();

// Export to make it available using require.  The keystone.list import throws a ReferenceError when importing a list
// that comes later when sorting alphabetically
exports = module.exports = Admin;
