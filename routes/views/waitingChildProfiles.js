var keystone		= require('keystone'),
	async			= require('async'),
	_				= require('underscore'),
	childService	= require('../middleware/service_child'),
	familyService	= require('../middleware/service_family'),
	listsService	= require('../middleware/service_lists'),
	pageService		= require('../middleware/service_page');

exports = module.exports = function(req, res) {
	'use strict';

	var view		= new keystone.View(req, res),
		locals		= res.locals;

	// Set local variables
	locals.userType	= req.user ? req.user.get('userType') : 'anonymous';
	// Anonymous users and site users have access only to unrestricted children, registered families and social workers have access to all children
	locals.targetChildren = locals.userType === 'anonymous' || locals.userType === 'site visitor' ? 'unrestricted' : 'all';

	async.series([
		function(done) { familyService.setGalleryPermissions(req, res, done); },
		function(done) { pageService.populateSidebar(req, res, done); },
		function(done) { pageService.getSectionHeader(req, res, done, 'Meet the Children'); }

	], function() {
		// Set the layout to render without the right sidebar
		locals['render-with-sidebar'] = false;
		// Render the view once all the data has been retrieved
		view.render('waiting-child-profiles');

	});

};
