const keystone					= require( 'keystone' ),
	  listService				= require( '../components/lists/list.controllers' ),
	  pageService				= require( '../components/pages/page.controllers' );

exports = module.exports = ( req, res ) => {
	'use strict';

	const view 		= new keystone.View( req, res ),
		  locals 	= res.locals;

	// objects with additional search parameters
	const raceOptions		= { other: true },
		  stateOptions		= { default: 'Massachusetts' },
		  waysToHearOptions	= { other: true };

	// fetch all data needed to render this page
	let fetchChildTypes				= listService.getChildTypesForWebsite(),
		fetchCitiesAndTowns			= listService.getAllCitiesAndTowns(),
		fetchGenders				= listService.getAllGenders(),
		fetchLanguages				= listService.getAllLanguages(),
		fetchLegalStatuses			= listService.getAllLegalStatuses(),
		fetchRaces					= listService.getAllRaces( raceOptions ),
		fetchRegions				= listService.getAllRegions(),
		fetchSocialWorkerPositions	= listService.getAllSocialWorkerPositions(),
		fetchStates					= listService.getAllStates( stateOptions ),
		fetchWaysToHearAboutMARE	= listService.getAllWaysToHearAboutMARE( waysToHearOptions ),
		fetchSidebarItems			= pageService.getSidebarItems();

	Promise.all( [ fetchChildTypes, fetchCitiesAndTowns, fetchGenders, fetchLanguages,
				   fetchLegalStatuses, fetchRaces, fetchRegions, fetchSocialWorkerPositions,
				   fetchStates, fetchWaysToHearAboutMARE, fetchSidebarItems ] )
		.then( values => {
			// assign local variables to the values returned by the promises
			const [ childTypes, citiesAndTowns, genders, languages,
					legalStatuses, races, regions, socialWorkerPositions,
					states, waysToHearAboutMARE, sidebarItems ] = values;
			// the sidebar items are a success story and event in an array, assign local variables to the two objects
			const [ randomSuccessStory, randomEvent ] = sidebarItems;

			// assign properties to locals for access during templating
			locals.childTypes				= childTypes;
			locals.citiesAndTowns			= citiesAndTowns;
			locals.genders					= genders;
			locals.languages				= languages;
			locals.legalStatuses			= legalStatuses;
			locals.races					= races;
			locals.regions					= regions;
			locals.socialWorkerPositions	= socialWorkerPositions;
			locals.states					= states;
			locals.waysToHearAboutMARE		= waysToHearAboutMARE;
			locals.randomSuccessStory		= randomSuccessStory;
			locals.randomEvent				= randomEvent;

			if (typeof req.headers.referer !== 'undefined') {
				let recognizedReferers = ['/page/register-update-a-child', '/page/register-a-familys-homestudy', '/events/adoption-parties/', '/events/fundraising-events/'];
				recognizedReferers.forEach(path => {
					if (req.headers.referer.includes(path)) {
						locals.redirectUrl = req.headers.referer;
					}
				});
			}

			// set the layout to render with the right sidebar
			locals[ 'render-with-sidebar' ] = false;
			// render the view using the register.hbs template
			view.render( 'register' );
		})
		.catch( err => {
			// log an error for debugging purposes
			console.error( `error loading data for the registration page`, err );
			// render the view using the register.hbs template
			view.render( 'register' );
		});
};
