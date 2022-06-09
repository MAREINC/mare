const keystone = require( 'keystone' );

/* fetch the featured items */
exports.fetchFeaturedItems = () => {
	// return a promise for cleaner asynchronous processing
	return new Promise( ( resolve, reject ) => {
		// fetch the model specified in the field using it's _id value
		keystone.list( 'Featured Item' ).model
			.find()
			.exec()
			.then( featuredItems => {
				// if we can't find the featured items, abort execution and resolve with an undefined value
				if( !featuredItems ) {
					console.log( `unable to load the featured items` );
					return resolve();
				}					
				// resolve with the featured items for easy access furthur down the line
				resolve( featuredItems );

			}, err => {
				// if there was an error while fetching the model, reject the promise and return the error 
				reject( err );
			});
	});
};