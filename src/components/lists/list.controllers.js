const keystone	= require( 'keystone' ),
	  _			= require( 'underscore' );

exports.getAllRegions = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all region models
		keystone.list( 'Region' ).model
			.find()
			.exec()
			.then( regions => {
				// if no regions could not be found
				if( regions.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no regions could be found` );
					// reject the promise
					return reject();
				}
				// if regions were successfully returned, resolve with the array
				resolve( regions );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all regions`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getRegionByName = name => {

	return new Promise( ( resolve, reject ) => {
		// query the database for the region with the matching name
		keystone.list( 'Region' ).model
			.findOne()
			.where( 'region', name )
			.exec()
			.then( region => {
				// if no region could not be found
				if( !region ) {
					// reject the promise with an error message
					return reject( new Error( `region could not be found by name: ${ name }` ) );
				}
				// if the region was successfully returned, resolve with the model
				resolve( region );
			// if an error was encountered fetching from the database
			}, err => {
				// reject the promise
				reject( err );
			});
	});
};

exports.getRegionById = id => {

	return new Promise( ( resolve, reject ) => {
		// if no id value was passed into the function
		if ( !id ) {
			// reject the promise with a description of the error
			return reject( 'getRegionById cannot execute - no region ID provided' );
		}
		// query the database for the region with the matching _id
		keystone.list( 'Region' ).model
			.findById( id )
			.exec()
			.then( region => {
				// if no region could not be found
				if( !region ) {
					// reject the promise with an error message
					return reject( new Error( `region could not be found` ) );
				}
				// if the region was successfully returned, resolve with the model
				resolve( region );
			// if an error was encountered fetching from the database
			}, err => {
				// reject the promise
				reject( err );
			});
	});
};

exports.getAllSocialWorkerPositions = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all social worker position models
		keystone.list( 'Social Worker Position' ).model
			.find()
			.exec()
			.then( positions => {
				// if no social worker positions could not be found
				if( positions.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no social worker positions could be found` );
					// reject the promise
					return reject();
				}
				// if positions were successfully returned, resolve with the array
				resolve( positions );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging putposes
				console.error( `error fetching the list of all social worker positions`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getAllRaces = options => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all race models
		keystone.list( 'Race' ).model
			.find()
			.exec()
			.then( races => {
				// if no races could not be found
				if( races.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no races could be found` );
					// reject the promise
					return reject();
				}
				// if there is a value of 'other' in the list, which should appear at the bottom of any
				// dropdown lists on the site, add an appropriate attribute
				if( options && options.other ) {
					// loop through the returned races array
					for( let race of races ) {
						// and if a value of 'other' is encountered
						if( race.race === 'other' ) {
							// add an attribute to the model object showing that it represents the 'other' value
							race.other = true;
						}
					};
				}
				// resolve with the returned array of races
				resolve( races );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of races`, err );
				// reject the promise
				reject();
			});
	});
};

// TODO: setting the default state doesn't make sense here, this should be a pure fetch function
exports.getAllStates = options => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all states models
		keystone.list( 'State' ).model
			.find()
			.exec()
			.then( states => {
				// if no states could not be found
				if( states.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no states could be found` );
					// reject the promise
					return reject();
				}
				// if there is a default value which should appear selected when a dropdown menu is first rendered add an appropriate attribute
				if( options && options.default ) {
					// loop through the returned states array
					for( let state of states ) {
						// and if one matches the text of the default option
						if( state.state === options.default ) {
							// add an attribute to the model object showing that it represents the default option
							state.defaultSelection = true;
						}
					};
				}
				// resolve with the returned array of states
				resolve( states );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all states`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getStateById = id => {

	return new Promise( ( resolve, reject ) => {
		// if no id value was passed into the function
		if ( !id ) {
			// reject the promise with a description of the error
			return reject( 'no id provided' );
		}
		// query the database for the state with the matching _id
		keystone.list( 'State' ).model
			.findById( id )
			.exec()
			.then( state => {
				// if no state could not be found
				if( !state ) {
					// reject the promise with an error message
					return reject( new Error( `state could not be found` ) );
				}
				// if the state was successfully returned, resolve with the model
				resolve( state );
			// if an error was encountered fetching from the database
			}, err => {
				// reject the promise
				reject( err );
			});
	});
};

exports.getAllGenders = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all gender models
		keystone.list( 'Gender' ).model
			.find()
			.exec()
			.then( genders => {
				// if no genders could not be found
				if( genders.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no genders could be found` );
					// reject the promise
					return reject();
				}
				// if genders were successfully returned, resolve with the array
				resolve( genders );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all genders`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getAllLegalStatuses = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all legal status models
		keystone.list( 'Legal Status' ).model
			.find()
			.exec()
			.then( legalStatuses => {
				// if no legal statuses could not be found
				if( legalStatuses.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no legal statuses could be found` );
					// reject the promise
					return reject();
				}
				// if legal statuses were successfully returned, resolve with the array
				resolve( legalStatuses );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all legal statuses`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getAllLanguages = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all language models
		keystone.list( 'Language' ).model
			.find()
			.exec()
			.then( languages => {
				// if no languages could not be found
				if( languages.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no languages could be found` );
					// reject the promise
					return reject();
				}
				// if languages were successfully returned, resolve with the array
				resolve( languages );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all languages`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getAllFamilyConstellations = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all family constellation models
		keystone.list( 'Family Constellation' ).model
			.find()
			.exec()
			.then( familyConstellations => {
				// if no family constellations could not be found
				if( familyConstellations.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no family constellations could be found` );
					// reject the promise
					return reject();
				}
				// if family constellations were successfully returned, resolve with the array
				resolve( familyConstellations );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all family constellations`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getAllMatchingExclusions = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all matching exclusion models
		keystone.list( 'Matching Exclusion' ).model
			.find()
			.lean()
			.exec()
			.then( matchingExclusions => {
				// if no matching exclusions could not be found
				if( matchingExclusions.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no matching exclusions could be found` );
					// reject the promise
					return reject();
				}
				// if matching exclusions were successfully returned, resolve with the array
				resolve( matchingExclusions );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all matching exclusions`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getAllDisabilities = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all disability models
		keystone.list( 'Disability' ).model
			.find()
			.exec()
			.then( disabilities => {
				// if no disabilities could not be found
				if( disabilities.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no disabilities could be found` );
					// reject the promise
					return reject();
				}
				// if disabilities were successfully returned, resolve with the array
				resolve( disabilities );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all disabilities`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getAllOtherConsiderations = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all other consideration models
		keystone.list( 'Other Consideration' ).model
			.find()
			.exec()
			.then( otherConsiderations => {
				// if no other considerations could not be found
				if( otherConsiderations.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no other considerations could be found` );
					// reject the promise
					return reject();
				}
				// if other considerations were successfully returned, resolve with the array
				resolve( otherConsiderations );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all other considerations`, err );
				// reject the promise
				reject();

			});
	});
};

exports.getAllChildStatuses = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all child statuses
		keystone.list( 'Child Status' ).model
			.find()
			.exec()
			.then( childStatuses => {
				// if no child statuses could not be found
				if( childStatuses.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no child statuses could be found` );
					// reject the promise
					return reject();
				}
				// if child statuses were successfully returned, resolve with the array
				resolve( childStatuses );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all child statuses`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getAllFamilyStatuses = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all family statuses
		keystone.list( 'Family Status' ).model
			.find()
			.exec()
			.then( familyStatuses => {
				// if no child statuses could not be found
				if( familyStatuses.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no family statuses could be found` );
					// reject the promise
					return reject();
				}
				// if child statuses were successfully returned, resolve with the array
				resolve( familyStatuses );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all family statuses`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getChildStatusByName = ( name ) => {

	return new Promise( ( resolve, reject ) => {

		// if no status name was passed in
		if( !name ) {
			// reject the promise with details about the error
			return reject( new Error( `no status name provided` ) );
		}

		keystone.list( 'Child Status' ).model
			.findOne()
			.where( 'childStatus' ).equals( name )
			.lean()
			.exec()
			.then( childStatus => {
				if( !childStatus ) {
					// log an error for debugging purposes
					console.error( `child status  ${ name } could not be found` );
					// reject the promise
					return reject( new Error( `child status  ${ name } could not be found` ) );
				}
				
				resolve( childStatus );
			}, err => {
				// log an error for debugging purposes
				console.error( `error fetching the child status by name ${ name }`, err );
				// reject the promise
				reject( new Error( `error fetching the child status by name ${ name } - ${ err }` ) );
			});
	});
};

exports.getChildTypesForWebsite = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all child types marked for display on the website
		keystone.list( 'Child Type' ).model
			.find()
			.where( 'availableOnWebsite', true )
			.exec()
			.then( childTypes => {
				// if no child types could not be found
				if( childTypes.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no child types could be found` );
					// reject the promise
					return reject();
				}
				// if child types were successfully returned, resolve with the array
				resolve( childTypes );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all child types meant for website display`, err );
				// reject the promise
				reject();

			});
	});
};

exports.getEventTypesForWebsite = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all event types marked for display on the website
		keystone.list( 'Event Type' ).model
			.find()
			.where( 'availableOnWebsite', true )
			.exec()
			.then( eventTypes => {
				// if no event types meant for the website could not be found
				if( eventTypes.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no event types meant for website display could be found` );
					// reject the promise
					return reject();
				}
				// if event types were successfully returned, resolve with the array
				resolve( eventTypes );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all event types meant for website display`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getAllWaysToHearAboutMARE = options => {

	return new Promise( ( resolve, reject ) => {
	// query the database for all ways to hear about MARE
	keystone.list( 'Way To Hear About MARE' ).model
		.find()
		.exec()
		.then( waysToHearAboutMARE => {
			// if no ways to hear about MARE could not be found
			if( waysToHearAboutMARE.length === 0 ) {
				// log an error for debugging purposes
				console.error( `no ways to hear about MARE could be found` );
				// reject the promise
				return reject();
			}
			// if there is a value of 'other' in the list, which should appear at the bottom of any
			// dropdown lists on the site, add an appropriate attribute
			if( options && options.other ) {
				// loop through the returned ways to hear about MARE array
				for( let wayToHearAboutMARE of waysToHearAboutMARE ) {
					// and if a value of 'other' is encountered
					if( wayToHearAboutMARE.wayToHearAboutMARE === 'other' ) {
						// add an attribute to the model object showing that it represents the 'other' value
						wayToHearAboutMARE.other = true;
					}
				};
			}
			// resolve with the returned array of ways to hear about MARE
			resolve( waysToHearAboutMARE );
		// if an error was encountered fetching from the database
		}, err => {
			// log the error for debugging purposes
			console.error( `error fetching the list of ways to hear about MARE`, err );
			// reject the promise
			reject();
		});
	});
};

exports.getAllResidences = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all residences
		keystone.list( 'Residence' ).model
			.find()
			.exec()
			.then( residences => {
				// if no residences could not be found
				if( residences.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no residences could be found` );
					// reject the promise
					return reject();
				}
				// if residences were successfully returned, resolve with the array
				resolve( residences );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of residences`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getAllOtherFamilyConstellationConsiderations = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all other family constellation considerations
		keystone.list( 'Other Family Constellation Consideration' ).model
			.find()
			.sort( 'sortOrder' )
			.exec()
			.then( otherFamilyConstellationConsiderations => {
				// if no other family constellation considerations could not be found
				if( otherFamilyConstellationConsiderations.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no other family constellation considerations could be found` );
					// reject the promise
					return reject();
				}
				// if other family constellation considerations were successfully returned, resolve with the array
				resolve( otherFamilyConstellationConsiderations );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of other family constellation considerations`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getAllCitiesAndTowns = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all cities and towns
		keystone.list( 'City or Town' ).model
			.find()
			.sort( { cityOrTown: 1 } ) // TODO: should this be handled in the model?
			.exec()
			.then( citiesAndTowns => {
				// if no cities or towns could not be found
				if( citiesAndTowns.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no cities or towns could be found` );
					// reject the promise
					return reject();
				}
				// if cities and towns were successfully returned, resolve with the array
				resolve( citiesAndTowns );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of cities and towns`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getCityOrTownById = id => {

	return new Promise( ( resolve, reject ) => {

		if( !id ) {
			return reject( 'no id provided' );
		}
		
		// query the database for the city or town with the matching _id
		keystone.list( 'City or Town' ).model
			.findById( id )
			.exec()
			.then( city => {
				// if no city or town could not be found
				if( !city ) {
					// reject the promise with an error message
					return reject( new Error( `city or town could not be found` ) );
				}
				// if the city or town was successfully returned, resolve with the model
				resolve( city );
			// if an error was encountered fetching from the database
			}, err => {
				// reject the promise
				reject( err );
			});
	});
};

/* get all cities and towns that match the query in the name field and sort them by name */
exports.getCitiesAndTownsByName = ( nameQuery, maxResults ) => {

	return new Promise( ( resolve, reject ) => {
		// if no maxResults was passed in
		if( !maxResults ) {
			// return control to the calling context
			return reject( new Error( `error fetching cities and towns by name - no maxResults passed in` ) );
		}
		
		// fetch the city and town records
		keystone.list( 'City or Town' ).model
			.find( {
				'cityOrTown' : new RegExp( nameQuery, 'i' )
			})
			.sort( {
				'cityOrTown' : 'asc'
			})
			.limit( maxResults )
			.exec()
			.then( citiesOrTowns => {
				// resolve the promise with the returned cities and towns
				resolve( citiesOrTowns );
			}, err => {
				// log an error for debugging purposes
				console.error( `error fetching cities and towns by name ${ nameQuery } and max results ${ maxResults }`, err );
				// reject the promise with details about the error
				reject( new Error( `error fetching cities and towns by name ${ nameQuery } and max results ${ maxResults } - ${ err }` ) );
			});
	});
};

// TODO: this needs to be un-async'ed
exports.getChildStatusIdByName = ( req, res, done, name ) => {

	let locals = res.locals;

	keystone.list( 'Child Status' ).model
		.findOne()
		.where( 'childStatus' ).equals( name )
		.lean()
		.exec()
		.then( status => {

			locals.activeChildStatusId = status._id;
			// execute done function if async is used to continue the flow of execution
			done()

		}, err => {

			console.log( err );
			done();

		});
};

exports.getAllInquiryMethods = () => {
	
	return new Promise( ( resolve, reject ) => {

		keystone.list( 'Inquiry Method').model
			.find()
			.lean()
			.exec()
			.then( inquiryMethods => {
				// if no inquiry methods could be found
				if ( !inquiryMethods || inquiryMethods.length === 0 ) {
					// log an error for debugging purposes
					console.error( 'no inquiry methods could be found' );
					// reject the promise
					return reject();
				}
				// otherwise, resolve with inquiry methods
				resolve( inquiryMethods );
			})
			.catch( err => {
				// log an error for debugging purposes
				console.error( 'error fetching inquiry methods', err );
				// and reject the promise
				reject();
			});
	});
};

exports.getInquiryMethodByName = name => {

	return new Promise( ( resolve, reject ) => {
		// attempt to find a single inquiry method matching the passed in name
		keystone.list( 'Inquiry Method' ).model
			.findOne()
			.where( 'inquiryMethod' ).equals( name )
			.exec()
			.then( inquiryMethod => {
				// if the target inquiry method could not be found
				if( !inquiryMethod ) {
					// log an error for debugging purposes
					console.error( `no inquiry method matching '${ name } could be found` );
					// reject the promise
					return reject();
				}
				// if the target inquiry method was found, resolve the promise with the lean version of the object
				resolve( inquiryMethod );
			// if there was an error fetching from the database
			}, err => {
				// log an error for debugging purposes
				console.error( `error fetching inquiry method matching ${ name }`, err );
				// and reject the promise
				reject();
			});
	});
};

exports.getAllInquiryTypes = () => {
	
	return new Promise( ( resolve, reject ) => {

		keystone.list( 'Inquiry Type').model
			.find()
			.lean()
			.exec()
			.then( inquiryTypes => {
				// if no inquiry types could be found
				if ( !inquiryTypes || inquiryTypes.length === 0 ) {
					// log an error for debugging purposes
					console.error( 'no inquiry types could be found' );
					// reject the promise
					return reject();
				}
				// otherwise, resolve with inquiry types
				resolve( inquiryTypes );
			})
			.catch( err => {
				// log an error for debugging purposes
				console.error( 'error fetching inquiry types', err );
				// and reject the promise
				reject();
			});
	});
};

exports.getSourceByName = name => {

	return new Promise( ( resolve, reject ) => {
		// attempt to find a single source matching the passed in name
		keystone.list( 'Source' ).model
			.findOne()
			.where( 'source' ).equals( name )
			.exec()
			.then( source => {
				// if the target source could not be found
				if( !source ) {
					// log an error for debugging purposes
					console.error( `no source matching name '${ name } could be found` );
					// reject the promise
					return reject();
				}
				// if the target source was found, resolve the promise with the lean version of the object
				resolve( source );
			// if there was an error fetching from the database
			}, err => {
				// log an error for debugging purposes
				console.error( `error fetching source matching ${ name }`, err );
				// and reject the promise
				reject();
			});
	});
};

exports.getSourcesByNameFragment = ( nameQuery, maxResults ) => {

	return new Promise( ( resolve, reject ) => {
		// if no maxResults was passed in
		if( !maxResults ) {
			// return control to the calling context
			return reject( new Error( `error fetching sources by name - no maxResults passed in` ) );
		}
		
		// fetch the sources
		keystone.list( 'Source' ).model
			.find( {
				'source' : new RegExp( nameQuery, 'i' )
			})
			.sort( {
				'source' : 'asc'
			})
			.limit( maxResults )
			.exec()
			.then( sources => resolve( sources ) )
			.catch( err => {
				// log an error for debugging purposes
				console.error( `error fetching sources by name ${ nameQuery } and max results ${ maxResults }`, err );
				// reject the promise with details about the error
				reject( new Error( `error fetching sources by name ${ nameQuery } and max results ${ maxResults } - ${ err }` ) );
			});
	});
};

// TODO: this function isn't written correctly, replace references to it with getEmailTargetByName() below
exports.getEmailTargetId = emailTarget => {

	return new Promise( ( resolve, reject ) => {

		keystone.list( 'Email Target' ).model
			.findOne()
			.select( '_id' )
			.where( 'emailTarget', emailTarget )
			.exec()
			.then( target => {
				// if no target was found in the database
				if( !target ) {
					// reject the promise with the reason for the rejection
					return reject( new Error( `no target found for ${ emailTarget }` ) );
				}
				// resolve the promise the the database id of the email target
				resolve( target.get( '_id' ) );
			// if there was an error fetching data from the database
            }, err => {
                // reject the promise with the reason for the rejection
                reject( new Error( `error fetching email target for ${ emailTarget }` ) );
            });
	});
};

exports.getEmailTargetByName = emailTarget => {

	return new Promise( ( resolve, reject ) => {

		keystone.list( 'Email Target' ).model
			.findOne()
			.where( 'emailTarget', emailTarget )
			.exec()
			.then( emailTarget => {
				// if the email target could not be found
				if( !emailTarget ) {
					// reject the promise with the reason for the rejection
					return reject( new Error( `no email target matching ${ emailTarget } could be found` ) );
				}
				// if the email target was found, resolve the promise with the returned model
				resolve( emailTarget );
			// if there was an error fetching data from the database
            }, err => {
                // reject the promise with the reason for the rejection
                reject( new Error( `error fetching email email target matching ${ emailTarget }` ) );
            });
	});
};

exports.getAllPronouns = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all pronoun models
		keystone.list( 'Pronoun' ).model
			.find()
			.exec()
			.then( pronouns => {
				// if no pronouns could not be found
				if( pronouns.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no pronouns could be found` );
					// reject the promise
					return reject();
				}
				// if pronouns were successfully returned, resolve with the array
				resolve( pronouns );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all pronouns`, err );
				// reject the promise
				reject();
			});
	});
};

exports.getAllMatchingExclusions = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for all matching exclusion models
		keystone.list( 'Matching Exclusion' ).model
			.find()
			.exec()
			.then( matchingExclusions => {
				// if no matching exclusions could not be found
				if( matchingExclusions.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no matching exclusions could be found` );
					// reject the promise
					return reject();
				}
				// if matching exclusions were successfully returned, resolve with the array
				resolve( matchingExclusions );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching the list of all matching exclusions`, err );
				// reject the promise
				reject();
			});
	});
};
