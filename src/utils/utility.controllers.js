/* a place for generic utility functions for data processing and other common tasks */

const _			= require( 'underscore' ),
	  crypto	= require( 'crypto' );

/* remove any HTML style tags from text */
exports.stripTags = text => {
	// if the text is empty, return an empty string
	if( !text || text.length === 0 ) {
		return '';
	}

	return text.replace( /(<([^>]+)>)/ig, '' );
}

/* replace all HTML entities by corresponding Unicode characters */
exports.unescapeHTML = ( html ) => {
	const htmlEntities = {
		nbsp: ' ',
		cent: '¢',
		pound: '£',
		yen: '¥',
		euro: '€',
		copy: '©',
		reg: '®',
		lt: '<',
		gt: '>',
		quot: '"',
		amp: '&',
		apos: '\''
	};

	// find all HTML entities and replace them by Unicode characters
	return html.replace( /\&([^;]+);/g, ( entity, entityCode ) => {
		let matchesDecimalEntityNumber = entityCode.match( /^#(\d+)$/ ),
			matchesHexadecimalEntityNumber = entityCode.match( /^#x([\da-fA-F]+)$/ );

		if ( entityCode in htmlEntities ) {
			// if the entity code is given by its name
			return htmlEntities[ entityCode ];
		} else if ( matchesHexadecimalEntityNumber ) {
			// if the entity code is given in hexadecimal format
			return String.fromCharCode( parseInt( matchesHexadecimalEntityNumber[ 1 ], 16 ) );
		} else if ( matchesDecimalEntityNumber ) {
			// if the entity code is given in decimal format
			return String.fromCharCode( ~~matchesDecimalEntityNumber[ 1 ] );
		} else {
			// otherwise return the entity untouched
			return entity;
		}
	});
}

// TODO: add in a failure case similar to getReadableStringFromArray()
exports.truncateText = ( { text = '', options = {} } ) => {
	// if the text is empty, return an empty string
	if( !text || text.length === 0 ) {
		return '';
	}
	// remove leading and trailing whitespace
	var trimmedText = text.trim();

	// if the trimmed text is <= options.targetLength characters, return it.
	if( trimmedText.length <= options.targetLength ) {
		return trimmedText;
	}
	// if the character at options.targetLength is a space, return the clean character substring
	if( trimmedText.charAt( options.targetLength ) === ' ' ) {
		return trimmedText.substr( 0, options.targetLength ) + '&#8230;';
	}
	// if the character at options.targetLength is not a space, return the longest substring ending in a space
	if( trimmedText.charAt( options.targetLength ) !== ' ' ) {
		var lastSpace = trimmedText.substr(0, options.targetLength).lastIndexOf(' ');
		return trimmedText.substr( 0, lastSpace ) + '&#8230;';
	}
};

// TODO: match the destructured parameters and default values in all server-side functions

/* convert an array into a readable comma separated string */
/* ['Bob'] => 'Bob'
   ['Bob', 'Sam'], delimiter = 'and' => 'Bob and Sam'
   ['Bob', 'Sam', 'John'], delimiter = 'or' => 'Bob, Sam, or John' */

/* if it is indicated that the contents of the array are email addresses, wrap them in <a> tags */
/* ['admin@mareinc.org'] => <a href="mailto:admin@mareinc.org">admin@mareinc.org</a>
   ['admin@mareinc.org'], subject = 'subject' => <a href="mailto:admin@mareinc.org?Subject=subject">admin@mareinc.org</a> */
exports.getReadableStringFromArray = ( { array, delimiter = 'and' } ) => {
	// if the passed in array is not an array, or delimiter isn't a string, return and log a message
	if( !Array.isArray( array ) || typeof delimiter !== 'string' ) {
		console.log( `invalid arguments passed to getReadableStringFromArray(). array: ${ array }, delimiter: ${ delimiter }, returning ''` );
		return '';
	}
	// if we were passed an empty array, return and log a message
	if( array.length === 0 ) {
		console.log( `empty array passed in to getReadableStringFromArray(), returning ''` );
		return '';
	}
	// converts the array into a comma separated string
	let string = array.join(', ');
	// if there was only one element in the array, no more work is needed
	if( array.length === 1 ) {
		return string;
	}
	// get the indices of the first and last comma
	const firstCommaIndex = string.indexOf(',');
	const lastCommaIndex = string.lastIndexOf(',');
	// if there's only one comma, replace it with the delimiter
	if( firstCommaIndex === lastCommaIndex ) {
		return string.replace( `, `, ` ${ delimiter } ` );
	// if there is more than one comma, replace the last one with the delimiter
	} else {
		// lastCommaIndex + 2 comes from ignoring the last comma and the single space after it
		return `${ string.slice( 0, lastCommaIndex ) } ${ delimiter } ${ string.slice( lastCommaIndex + 2, string.length ) }`;
	}
};

/* takes in the object containing the field to be modified, the name of the content field, and any modification specification */
exports.modifyWYSIWYGContent = ( object, content, options ) => {

	options.forEach( option => {

		switch( option.action ) {

			case 'add more links': break; // TODO: finish coding this section

			case 'add classes':

				const matchString		= new RegExp( `<${ option.element }>` );
				const globalMatchString	= new RegExp( `<${ option.element }>`, 'g' );
				// NOTE: this will fail when confronted with WYSIWYG content that already has ids/classes/attributes attached.  To handle
				// more complex cases, this will need to be changed to a regular expression match
				if( option.targetAll ) {
					object[ content ] = object[ content ].replace( globalMatchString, `<${ option.element } class="${ option.classesToAdd }">` );
				} else {
					object[ content ] = object[ content ].replace( matchString, `<${ option.element } class="${ option.classesToAdd }">` );
				}

				break;
		}
	});
};
/* generates a random string to be used as a temporary password */
exports.generateAlphanumericHash = length => {
	// because it's a hex encoding, each unit will be two characters long, so we must divide by 2
	return crypto.randomBytes( Math.ceil( length / 2 ) ).toString( 'hex' );
};

/* generates a random number of the specified length, and ensures it will never have a leading 0 */
exports.generateNumber = length => {

	return Math.floor( Math.pow( 10, length - 1 ) + Math.random() * 9 * Math.pow( 10,  length - 1 ) );
};

/* add functionality to ES6 Set type for finding the union of two sets */
/* { a, b, c }, { b, c, d } => { a, b, c, d } */
Set.prototype.union = function( setB ) {
	var union = new Set( this );
	for ( var elem of setB ) {
		union.add( elem );
	}
	return union;
}

/* add functionality to ES6 Set type for finding the intersection of two sets */
/* { a, b, c }, { b, c, d } => { b, c } */
Set.prototype.intersection = function( setB ) {
	var intersection = new Set();
	for ( var elem of setB ) {
		if ( this.has( elem ) ) {
			intersection.add( elem );
		}
	}
	return intersection;
}

// TODO: ensure this actually returns the difference of two sets
/* add functionality to ES6 Set type for finding the difference between two sets */
/* { a, b, c }, { b, c, d } => { a, d } */
Set.prototype.difference = function( setB ) {
	var difference = new Set();

	for ( var elem of this ) {
		if( !setB.has( elem ) ) {
			difference.add( elem );
		}
	}

	for ( var elem of setB ) {
		if( !this.has( elem ) ) {
			difference.add( elem );
		}
	}
	return difference;
}

/* add functionality to ES6 Set type for finding the items that are exclusively in the first Set */
/* { a, b, c }, { b, c, d } => { a } */
Set.prototype.leftOuterJoin = function( setB ) {
	var difference = new Set( this );
	for( item of this ) {
		if( setB.has( item ) ) {
			difference.delete( item );
		}
	};
	return difference;
}

/* add functionality to ES6 Set type for finding the items that are exclusively in the second Set */
/* { a, b, c }, { b, c, d } => { d } */
Set.prototype.rightOuterJoin = function( setB ) {
	var difference = new Set( setB );
	for( item of setB ) {
		if( this.has( item ) ) {
			difference.delete( item );
		}
	};
	return difference;
}

// TODO: these were moved from other files when everything was reorganized from a monolith to component directories.  Review of each is needed

/* date objects are easily compared for sorting purposes when converted to milliseconds */
exports.convertDate = function convertDate( date ) {
	return new Date( date ).getTime();
};

exports.getAge = function getAge( dateOfBirth ) {

	var today = new Date();
	var birthDate = new Date( dateOfBirth );
	var age = today.getFullYear() - birthDate.getFullYear();
	var month = today.getMonth() - birthDate.getMonth();

	if ( month < 0 || ( month === 0 && today.getDate() < birthDate.getDate() ) ) {
		age--;
	}

	return age;
};

/* cut the array starting from startElement to endElement, if startElement is undefined or is an empty string then the array is cut beginning from the first element */
exports.arrayCut = ( array, startElement, endElement ) => {
	let isInRange = typeof startElement === 'undefined' || startElement.length === 0;
	let isOutOfRange = false;
	let results = [];
	
	array.forEach( ( item ) => {
		if ( item === startElement && ! isOutOfRange ) {
			isInRange = true;
		}
		if ( isInRange ) {
			results.push( item );
		}
		if ( item === endElement ) {
			isInRange = false;
			isOutOfRange = true;
		}
	});
	
	return results;
}

exports.isNil = valueToTest => {
	return valueToTest === null || valueToTest === undefined;
};