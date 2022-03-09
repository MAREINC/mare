// TODO: remove the complexity in this file by breaking out testing and storing of variables into discrete functions, then update .eslintrc

(function () {
	'use strict';

	mare.views.GallerySearchForm = Backbone.View.extend({
		// this view controls everything inside the element with class 'gallery-search-form'
		el: '.gallery-search-form',

		events: {

			'click .gallery-search-form__search-button' : 'displaySearchResults'
		},

		haveDefaultValuesBeenSet: false,

		displaySearchResults: function displaySearchResults() {

			this.getFormFields();
			this.processFormFields();
			this.removeUneededFilters();
			this.updateChildren();
			this.updateSiblingGroups();
			this.saveSearchCriteria(this.formFields);
			// emit an event to allow the gallery to update it's display now that we have all matching models
			this.trigger( 'searchResultsRetrieved' );
		},

		reset: function reset() {
			// check all the gender checkboxes
			$( '.select-gender' ).prop( 'checked', true );
			// set minimum acceptable number of children to 0
			$( '#minimum-number-of-children > option:eq(0)' ).prop( 'selected', true );
			// set maximum acceptable number of children to 8+
			$( '#maximum-number-of-children > option:eq(8)' ).prop( 'selected', true );
			// set minimum acceptable age of children to 0
			$( '#youngest-age > option:eq(0)' ).prop( 'selected', true );
			// set maximum acceptable age of children to 17
			$( '#oldest-age > option:eq(17)' ).prop( 'selected', true );
			// check all the race checkboxes
			$( '.select-race' ).prop( 'checked', true );
			// check all the primary language checkboxes
			$( '.select-primary-language' ).prop( 'checked', true );
			// select the radio to include children who have contact with their biological siblings
			$( '.select-contact-with-biological-siblings[ value = "yes" ]' ).prop( 'checked', true );
			// select the radio to include children who have contact with their biological parents
			$( '.select-contact-with-biological-parents[ value = "yes" ]' ).prop( 'checked', true );
			// uncheck box requiring child to have a video
			$( '.select-video-only' ).prop( 'checked', false );
			// uncheck box requiring child to be legally free
			$( '.select-legally-free-only' ).prop( 'checked', false );
			// remove restrictions on how recently the child's profile was updated
			$( '#updated-within > option:eq(0)' ).prop( 'selected', true );
			// check all social worker region checkboxes
			$( '.select-region' ).prop( 'checked', true );
			// remove selection for number of children in home
			$( '#number-of-children-in-home > option:eq(0)' ).prop( 'selected', true );
			// remove selection for age of youngest child in home
			$( '#youngest-child-age-in-home > option:eq(0)' ).prop( 'selected', true );
			// remove selection for age of oldest child in home
			$( '#oldest-child-age-in-home > option:eq(0)' ).prop( 'selected', true );
			// uncheck the pets in home checkbox
			$( '.select-pets-in-home' ).prop( 'checked', false );
			// set maximum physical needs to severe
			$( '.select-maximum-physical-needs[ value = "3" ]' ).prop( 'checked', true );
			// set maximum emotional needs to severe
			$( '.select-maximum-emotional-needs[ value = "3" ]' ).prop( 'checked', true );
			// set maximum intellectual needs to severe
			$( '.select-maximum-intellectual-needs[ value = "3" ]' ).prop( 'checked', true );
			// allow all developmental needs
			$( '.select-disabilities' ).prop( 'checked', true );
			// uncheck all parent(s) gender(s)
			$( '.select-parent-genders' ).prop( 'checked', false );
			// unset family relationship status
			$( '#parent-relationship-status > option:eq(0)' ).prop( 'selected', true );
		},

		getFormFields: function getFormFields() {

			this.formFields = {
				genders							: $( '.select-gender:checked' ),
				minimumChildren					: $( '#minimum-number-of-children' ).val(),
				maximumChildren					: $( '#maximum-number-of-children' ).val(),
				youngestAge						: $( '#youngest-age' ).val(),
				oldestAge						: $( '#oldest-age' ).val(),
				races							: $( '.select-race:checked' ),
				primaryLanguages				: $( '.select-primary-language:checked' ),
				showSiblingGroups				: $( '.select-show-sibling-groups:checked' ),
				contactWithBiologicalSiblings	: $( '.select-contact-with-biological-siblings:checked' ).val(),
				contactWithBiologicalParents	: $( '.select-contact-with-biological-parents:checked' ).val(),
				videoOnly						: $( '.select-video-only:checked' ).length > 0,
				legallyFreeOnly					: $( '.select-legally-free-only:checked' ).length > 0,
				updatedWithin					: $( '#updated-within' ).val(),
				socialWorkerRegions				: $( '.select-region:checked' ),
				maximumPhysicalNeeds			: $( '.select-maximum-physical-needs:checked' ).val(),
				maximumEmotionalNeeds			: $( '.select-maximum-emotional-needs:checked' ).val(),
				maximumIntellectualNeeds		: $( '.select-maximum-intellectual-needs:checked' ).val(),
				disabilities					: $( '.select-disabilities:checked' ),
				numberOfChildrenInHome			: $( '.select-number-of-children-in-home' ).val(),
				gendersOfChildrenInHome			: $( '.select-genders-of-children-in-home:checked' ),
				youngestChildAgeInHome			: $( '#youngest-child-age-in-home' ).val(),
				oldestChildAgeInHome			: $( '#oldest-child-age-in-home' ).val(),
				petsInHome						: $( '.select-pets-in-home:checked' ).length > 0,
				familyRelationshipStatus		: $( '#parent-relationship-status' ).val(),
				gendersOfParents				: $( '.select-parent-genders:checked' )
			};
		},

		processFormFields: function processFormFields() {

			var gendersArray					= [],
				raceArray						= [],
				primaryLanguagesArray			= [],
				regionsArray					= [],
				disabilityArray					= [],
				gendersOfChildrenInHomeArray	= [],
				gendersOfParentsArray			= [],
				formFields						= this.formFields;

			_.each( formFields.genders, function( gender ) {
				gendersArray.push( gender.getAttribute( 'value' ) );
			});

			_.each( formFields.races, function( race ) {
				raceArray.push( race.getAttribute( 'value' ) );
			});

			_.each( formFields.primaryLanguages, function( language ) {
				primaryLanguagesArray.push( language.getAttribute( 'value' ) );
			});

			_.each( formFields.socialWorkerRegions, function( region ) {
				regionsArray.push( region.getAttribute( 'value' ) );
			});

			_.each( formFields.disabilities, function( disability ) {
				disabilityArray.push( disability.getAttribute( 'value' ) );
			});

			_.each( formFields.gendersOfChildrenInHome, function( gender ) {
				gendersOfChildrenInHomeArray.push( gender.getAttribute( 'value' ) );
			});

			_.each( formFields.gendersOfParents, function( gender ) {
				gendersOfParentsArray.push( gender.getAttribute( 'value' ) );
			});

			formFields.genders					= gendersArray;
			formFields.races					= raceArray;
			formFields.primaryLanguages			= primaryLanguagesArray;
			formFields.socialWorkerRegions		= regionsArray;
			formFields.disabilities				= disabilityArray;
			formFields.gendersOfChildrenInHome	= gendersOfChildrenInHomeArray;
			formFields.gendersOfParents			= gendersOfParentsArray;

			formFields.minimumChildren			= parseInt( formFields.minimumChildren, 10 );
			formFields.maximumChildren			= parseInt( formFields.maximumChildren, 10 );
			formFields.youngestAge				= parseInt( formFields.youngestAge, 10 );
			formFields.oldestAge				= parseInt( formFields.oldestAge, 10 );
			formFields.maximumPhysicalNeeds		= formFields.maximumPhysicalNeeds !== undefined ? parseInt( formFields.maximumPhysicalNeeds, 10 ) : 3;
			formFields.maximumEmotionalNeeds	= formFields.maximumEmotionalNeeds !== undefined ? parseInt( formFields.maximumEmotionalNeeds, 10 ) : 3;
			formFields.maximumIntellectualNeeds	= formFields.maximumIntellectualNeeds !== undefined ? parseInt( formFields.maximumIntellectualNeeds, 10 ) : 3;
			formFields.numberOfChildrenInHome	= parseInt( formFields.numberOfChildrenInHome, 10 );
			formFields.youngestChildAgeInHome	= parseInt( formFields.youngestChildAgeInHome, 10 );
			formFields.oldestChildAgeInHome		= parseInt( formFields.oldestChildAgeInHome, 10 );

			formFields.showSiblingGroups				= formFields.showSiblingGroups === 'no' ? false : true; // false : true order is needed, do not change
			formFields.contactWithBiologicalSiblings	= formFields.contactWithBiologicalSiblings === 'no' ? false : true; // false : true order is needed, do not change
			formFields.contactWithBiologicalParents		= formFields.contactWithBiologicalParents === 'no' ? false : true; // false : true order is needed, do not change
		},

		removeUneededFilters: function removeUneededFilters() {

			var formFields = this.formFields;

			if( formFields.genders.length === 0 )						{ delete formFields.genders; }
			if( formFields.races.length === 0 )							{ delete formFields.races; }
			if( formFields.primaryLanguages.length === 0 )				{ delete formFields.primaryLanguages }
			if( formFields.showSiblingGroups !== false )				{ delete formFields.showSiblingGroups }
			if( formFields.contactWithBiologicalSiblings !== false )	{ delete formFields.contactWithBiologicalSiblings; }
			if( formFields.contactWithBiologicalParents !== false )		{ delete formFields.contactWithBiologicalParents; }
			if( !formFields.videoOnly )									{ delete formFields.videoOnly; }
			if( !formFields.legallyFreeOnly )							{ delete formFields.legallyFreeOnly; }
			if( formFields.updatedWithin === '' )						{ delete formFields.updatedWithin; }
			if( formFields.socialWorkerRegions.length === 0 )			{ delete formFields.socialWorkerRegions; }
			if( formFields.maximumPhysicalNeeds === 3 )					{ delete formFields.maximumPhysicalNeeds; }
			if( formFields.maximumEmotionalNeeds === 3 )				{ delete formFields.maximumEmotionalNeeds; }
			if( formFields.maximumIntellectualNeeds === 3 )				{ delete formFields.maximumIntellectualNeeds; }
			if( formFields.disabilities.length === 0 )					{ delete formFields.disabilities; }
			if( formFields.gendersOfChildrenInHome.length === 0 )		{ delete formFields.gendersOfChildrenInHome; }
			if( !formFields.petsInHome )								{ delete formFields.petsInHome; }
			if( formFields.familyRelationshipStatus === "" )			{ delete formFields.familyRelationshipStatus; }
			if( formFields.gendersOfParents.length === 0 )				{ delete formFields.gendersOfParents; }

		},

		/* eslint-disable max-statements */
		updateChildren: function updateChildren() {

			var formFields = this.formFields;

			// clear out all contents of the current gallery collection
			mare.collections.galleryChildren.reset();

			mare.collections.allChildren.each( function( child ) {

				// break out of the current loop if the child's gender wasn't selected ( return is needed for this in _.each )
				if( formFields.genders && formFields.genders.indexOf( child.get( 'gender' ) ) === -1 ) { return; }

				// break out of the current loop if the minimum children is greater than 1, which prevents solo children from displaying
				if( formFields.minimumChildren >  1 ) { return; }
				
				// break out of the current loop if the child's age is less than the youngest or more than the oldest specified ( return is needed for this in _.each )
				if( formFields.youngestAge > child.get( 'age' ) ||
				   formFields.oldestAge < child.get( 'age' ) ) { return; }

				// break out of the current loop only if none of the child's races match a selected race ( return is needed for this in _.each )
				// <3 Underscore.js for this one
				if( formFields.races && _.intersection( formFields.races, child.get( 'race' )).length === 0 ) { return; }

				// break out of the current loop only if none of the child's languages match a selected primary language ( return is needed for this in _.each )
				// <3 Underscore.js for this one
				if( formFields.primaryLanguages && _.intersection( formFields.primaryLanguages, child.get( 'language' )).length === 0 ) { return; }

				// break out of the current loop only if the child having contact with their biological siblings/parents doesn't match the user's selection ( return is needed for this in _.each )
				if( formFields.contactWithBiologicalSiblings === false &&
				   child.get( 'hasContactWithBiologicalSiblings' ) !== false ) { return; }

				if( formFields.contactWithBiologicalParents === false &&
				   child.get( 'hasContactWithBiologicalParents' ) !== false ) { return; }

				// break out of the current loop if the child doesn't have a video and the user specifies that they should ( return is needed for this in _.each )
				if( formFields.videoOnly && !child.get( 'hasVideo' ) ) { return; }

				// break out of the current loop if the child isn't legally free and the user specifies that they should be ( return is needed for this in _.each )
				if( formFields.legallyFreeOnly && child.get( 'legalStatus' ) !== 'free' ) { return; }

				// only consider when the child was updated if a selection was made in the search criteria
				if( formFields.updatedWithin ) {
					var lastUpdated			= new Date( child.get( 'updatedAt' ) ),
						restriction			= new Date( formFields.updatedWithin ),
						currentMilliseconds	= new Date().getTime(),
						cutoffMilliseconds	= parseInt( formFields.updatedWithin, 10 ),
						cutoffDate			= new Date( currentMilliseconds - cutoffMilliseconds ),
						isIncluded			= lastUpdated >= cutoffDate;

					// break out of the current loop if the child wasn't updated within the timeframe specified by the user ( return is needed for this in _.each )
					if( !isIncluded ) { return; }
				}

				// break out of the current loop if the child's social worker region wasn't selected ( return is needed for this in _.each )
				if( formFields.socialWorkerRegions && formFields.socialWorkerRegions.indexOf( child.get( 'region' ) ) === -1 ) { return; }

				// TODO: are these !== undefined checks necessary?
				// break out of the loop if any of the child's needs exceed the maximum specified by the user ( return is needed for this in _.each )
				if( formFields.maximumPhysicalNeeds !== undefined && child.get( 'physicalNeeds' ) > formFields.maximumPhysicalNeeds ) { return; }
				if( formFields.maximumEmotionalNeeds !== undefined && child.get( 'emotionalNeeds' ) > formFields.maximumEmotionalNeeds ) { return; }
				if( formFields.maximumIntellectualNeeds !== undefined && child.get( 'intellectualNeeds' ) > formFields.maximumIntellectualNeeds ) { return; }

				// break out of the current loop only if the child has disabilities and none match a selected disability ( return is needed for this in _.each )
				if( formFields.disabilities &&
					child.get( 'disabilities' ).length > 0 &&
				   _.intersection( formFields.disabilities, child.get( 'disabilities' ) ).length === 0 ) { return; }
				
				// get a list of matching exclusions that would prevent the child from matching with the family performing the search
				var matchingExclusions = child.get( 'matchingExclusions' );
				
				// if there are matching exclusions to consider, ensure the family should not be excluded
				if ( matchingExclusions && matchingExclusions.length > 0 ) {

					var numberOfChildrenInHomeSelected	= typeof formFields.numberOfChildrenInHome === 'number' && !isNaN( formFields.numberOfChildrenInHome ),
						oldestChildAgeInHomeSelected	= typeof formFields.oldestChildAgeInHome === 'number' && !isNaN( formFields.oldestChildAgeInHome ),
						youngestChildAgeInHomeSelected	= typeof formFields.youngestChildAgeInHome === 'number' && !isNaN( formFields.youngestChildAgeInHome );

					var youngestChildAge = youngestChildAgeInHomeSelected 
												? formFields.youngestChildAgeInHome
												: oldestChildAgeInHomeSelected
													? formFields.oldestChildAgeInHome
													: undefined;

					var oldestChildAge = oldestChildAgeInHomeSelected
												? formFields.oldestChildAgeInHome
												: youngestChildAgeInHomeSelected
													? formFields.youngestChildAgeInHome
													: undefined;
					
					// if the child cannot be placed in a single-parent household
					if ( matchingExclusions.includes( 'Single-parent household' ) ) {
						// check if the family should be excluded based on their profile
						if ( !!formFields.familyRelationshipStatus && formFields.familyRelationshipStatus === 'Single' ) { return; }
					}

					// if the child cannot be placed in a family with female parent(s)
					if ( matchingExclusions.includes( 'Female parent(s)' ) ) {
						// check if the family should be excluded based on their profile
						if ( !!formFields.gendersOfParents && formFields.gendersOfParents.includes( 'female' ) ) { return; }
					}

					// if the child cannot be placed in a family with male parent(s)
					if ( matchingExclusions.includes( 'Male parent(s)' ) ) {
						// check if the family should be excluded based on their profile
						if ( !!formFields.gendersOfParents && formFields.gendersOfParents.includes( 'male' ) ) { return; }
					}

					// if the child cannot be placed in a family with any other children
					if ( matchingExclusions.includes( 'Any children' ) ) {
						// check if the family should be excluded based on their profile
						if ( numberOfChildrenInHomeSelected && formFields.numberOfChildrenInHome > 0 ) { return; }
					}

					// if the child cannot be placed in a family with older children
					if ( matchingExclusions.includes( 'Older children' ) ) {
						// check if the family should be excluded based on their profile
						if ( oldestChildAgeInHomeSelected && child.get( 'age' ) < oldestChildAge  ) { return; }
					}

					// if the child cannot be placed in a family with younger children
					if ( matchingExclusions.includes( 'Younger children' ) ) {
						// check if the family should be excluded based on their profile
						if ( oldestChildAgeInHomeSelected && child.get( 'age' ) > youngestChildAge  ) { return; }
					}

					// if the child cannot be placed in a family with pets
					if ( matchingExclusions.includes( 'Pets' ) ) {
						// check if the family should be excluded based on their profile
						if ( formFields.petsInHome ) { return; }
					}
				}

				// if the child passes all checks, add them to the collection to display on the gallery
				mare.collections.galleryChildren.add( child );
			});
		},
		/* eslint-enable max-statements */

		updateSiblingGroups: function updateSiblingGroups() {

			var formFields = this.formFields;

			// clear out all contents of the current gallery collection
			mare.collections.gallerySiblingGroups.reset();

			mare.collections.allSiblingGroups.each( function( siblingGroup ) {
				// break out of the current loop if the sibling group's gender wasn't selected ( return is needed for this in _.each )
				if( formFields.genders && _.difference( siblingGroup.get( 'genders' ), formFields.genders ).length > 0 ) { return; }

				// break out of the current loop if the sibling group has less than the min or more then the max specified ( return is needed for this in _.each )
				if( formFields.minimumChildren > siblingGroup.get( 'siblingToBePlacedWithCount' ) + 1 ||
					formFields.maximumChildren < siblingGroup.get( 'siblingToBePlacedWithCount' ) + 1 ) { return; }

				// break out of the current loop if the sibling group's age is less than the youngest or more than the oldest specified ( return is needed for this in _.each )
				if( formFields.youngestAge > _.max( siblingGroup.get( 'ages' ) ) ||
					formFields.oldestAge < _.min( siblingGroup.get( 'ages' ) ) ) { return; }

				// break out of the current loop only if none of the sibling group's races match a selected race ( return is needed for this in _.each )
				// <3 Underscore.js for this one
				if( formFields.races && _.difference( siblingGroup.get( 'races' ), formFields.races ).length > 0 ) { return; }

				// break out of the current loop only if none of the sibling group's languages match a selected primary language ( return is needed for this in _.each )
				// <3 Underscore.js for this one
				// TODO: Check with Lisa, this may have to change, currently if any language matches a selected one, it will include the sibling group
				if( formFields.primaryLanguages && _.intersection( formFields.primaryLanguages, siblingGroup.get( 'languages' ) ).length === 0 ) { return; }

				// break out of the current loop only if the sibling group being part of a sibling group doesn't match the user's selection ( return is needed for this in _.each )
				if( formFields.showSiblingGroups === false ) { return; }

				// TODO: some of these fields below don't need to remain as an array, and can be cleaned up if the data is processed into a single value before sending it to the browser

				// break out of the current loop only if the sibling group having contact with their biological siblings/parents doesn't match the user's selection ( return is needed for this in _.each )
				if( formFields.contactWithBiologicalSiblings === false &&
					siblingGroup.get( 'hasContactWithBiologicalSiblings' ).indexOf( true ) !== -1 ) { return; }

				if( formFields.contactWithBiologicalParents === false &&
					siblingGroup.get( 'hasContactWithBiologicalParents' ).indexOf( true ) !== -1 ) { return; }

				// break out of the current loop if the sibling group doesn't have a video and the user specifies that they should ( return is needed for this in _.each )
				if( formFields.videoOnly && !siblingGroup.get( 'hasVideo' ) ) { return; }

				// break out of the current loop if the sibling group isn't legally free and the user specifies that they should be ( return is needed for this in _.each )
				if( formFields.legallyFreeOnly && siblingGroup.get( 'legalStatuses' ).indexOf( 'legal risk' ) !== -1 ) { return; }

				// only consider when the sibling group was updated if a selection was made in the search criteria
				if( formFields.updatedWithin ) {
					var lastUpdated			= new Date( _.max( siblingGroup.get( 'updatedAt' ) ) ),
						restriction			= new Date( formFields.updatedWithin ),
						currentMilliseconds	= new Date().getTime(),
						cutoffMilliseconds	= parseInt( formFields.updatedWithin, 10 ),
						cutoffDate			= new Date( currentMilliseconds - cutoffMilliseconds ),
						isIncluded			= lastUpdated >= cutoffDate;

					// break out of the current loop if the sibling group wasn't updated within the timeframe specified by the user ( return is needed for this in _.each )
					if( !isIncluded ) { return; }
				}

				// break out of the current loop if the sibling group's region wasn't selected ( return is needed for this in _.each )
				if( formFields.socialWorkerRegions && _.difference( siblingGroup.get( 'regions' ), formFields.socialWorkerRegions ).length > 0 ) { return; }

				// TODO: are these !== undefined checks necessary?
				// break out of the loop if any of the sibling group's needs exceed the maximum specified by the user ( return is needed for this in _.each )
				if( formFields.maximumPhysicalNeeds !== undefined && _.max( siblingGroup.get( 'physicalNeeds' ) ) > formFields.maximumPhysicalNeeds ) { return; }
				if( formFields.maximumEmotionalNeeds !== undefined && _.max( siblingGroup.get( 'emotionalNeeds' ) ) > formFields.maximumEmotionalNeeds ) { return; }
				if( formFields.maximumIntellectualNeeds !== undefined && _.max( siblingGroup.get( 'intellectualNeeds' ) ) > formFields.maximumIntellectualNeeds ) { return; }

				// break out of the current loop only if the sibling group has disabilities and none match a selected disability ( return is needed for this in _.each )
				if( formFields.disabilities &&
					siblingGroup.get( 'disabilities' ).length > 0 &&
					_.difference( siblingGroup.get( 'disabilities' ), formFields.disabilities ).length > 0 ) { return; }

				// determine if selections were made about the family, if not, don't use it to restrict search results
				var numberOfChildrenInHomeSelected	= typeof formFields.numberOfChildrenInHome === 'number' && !isNaN( formFields.numberOfChildrenInHome ),
					oldestChildAgeInHomeSelected	= typeof formFields.oldestChildAgeInHome === 'number' && !isNaN( formFields.oldestChildAgeInHome ),
					youngestChildAgeInHomeSelected	= typeof formFields.youngestChildAgeInHome === 'number' && !isNaN( formFields.youngestChildAgeInHome );
				// store references to other family constellatoin considerations listed for any of the siblings
				var requiresSiblings			= siblingGroup.get( 'requiresSiblings' ).indexOf( true ) !== -1,
					requiresNoSiblings			= siblingGroup.get( 'requiresNoSiblings' ).indexOf( true ) !== -1,
					olderChildrenAcceptable		= siblingGroup.get( 'olderChildrenAcceptable' ).indexOf( true ) !== -1,
					youngerChildrenAcceptable	= siblingGroup.get( 'youngerChildrenAcceptable' ).indexOf( true ) !== -1,
					// keep track of whether there are no other family constellation considerations listed for any of the siblings
					hasOtherFamilyConstellationConsiderations = requiresSiblings
															 || requiresNoSiblings
															 || youngerChildrenAcceptable
															 || olderChildrenAcceptable;
				// assume that the family doesn't match with the sibling group
				var otherFamilyConstellationConsiderationsMatch = false;
				/* NOTE: this logic is meant to be inclusive, so any matches on any of the siblings needs will add them to the search results */
				// if no siblings have listed other family constellation considerations, they should be included in the search results
				if( !hasOtherFamilyConstellationConsiderations ) {
					otherFamilyConstellationConsiderationsMatch = true;
				// otherwise, if other family constellation considerations are listed for one or more sibling
				} else {
					// if any siblings require siblings and the family has children, they should be included in the search results
					if( requiresSiblings ) {
						if( !numberOfChildrenInHomeSelected || formFields.numberOfChildrenInHome !== 0 ) {
							otherFamilyConstellationConsiderationsMatch = true;
						}
					}
					// if any siblings require no siblings and the family has no children, they should be included in the search results
					if( requiresNoSiblings ) {
						if( !numberOfChildrenInHomeSelected || formFields.numberOfChildrenInHome === 0 ) {
							otherFamilyConstellationConsiderationsMatch = true;
						}
					}
					// if any siblings accept older children and the family has older children, they should be included in the search results
					if( olderChildrenAcceptable ) {
						if( !oldestChildAgeInHomeSelected || formFields.oldestChildAgeInHome >= _.max( siblingGroup.get( 'age' ) ) ) {
							otherFamilyConstellationConsiderationsMatch = true;
						}
					}
					// if any siblings accept younger children and the family has younger children, they should be included in the search results
					if( youngerChildrenAcceptable ) {
						if( !youngestChildAgeInHomeSelected || formFields.youngestChildAgeInHome <= _.min( siblingGroup.get( 'age' ) ) ) {
							otherFamilyConstellationConsiderationsMatch = true;
						}
					}
				}
				// if any siblings require no pets and the family has pets, they should be excluded from the search results
				if( formFields.petsInHome && siblingGroup.get( 'noPets' ).indexOf( true ) !== -1 ) { return; }
				// break out of the loop if none of the other considerations selected match the sibling group ( return is needed for this in _.each )
				if( !otherFamilyConstellationConsiderationsMatch ) { return; }
				// if the sibling group passes all checks, add them to the collection to display on the gallery
				mare.collections.gallerySiblingGroups.add( siblingGroup );
			});
		},

		saveSearchCriteria: function saveSearchCriteria( formFields ) {

			$.ajax({
				dataType: 'json',
				url: '/services/save-profile-search',
				type: 'POST',
				data: formFields
			});
		},

		applySavedSearchCriteria: function applySavedSearchCriteria( savedSearchCriteria ) {

			// apply the saved gender criteria
			$.each( savedSearchCriteria.genders, function( index, gender ) {
				$( '.select-gender[value="' + gender + '"]' ).prop( 'checked', true );
			});
			// apply minimum acceptable number of children criterion
			$( '#minimum-number-of-children > option:eq(' + ( savedSearchCriteria.minChildren || 0 ) + ')' ).prop( 'selected', true );
			// apply maximum acceptable number of children criterion
			$( '#maximum-number-of-children > option:eq(' + ( savedSearchCriteria.maxChildren || 8 ) + ')' ).prop( 'selected', true );
			// apply minimum acceptable age of children criterion
			$( '#youngest-age > option:eq(' + ( savedSearchCriteria.minAge || 0 ) + ')' ).prop( 'selected', true );
			// apply maximum acceptable age of children criterion
			$( '#oldest-age > option:eq(' + ( savedSearchCriteria.maxAge || 17 ) + ')' ).prop( 'selected', true );
			// apply the saved race criteria
			$.each( savedSearchCriteria.races, function( index, race ) {
				$( '.select-race[value="' + race + '"]' ).prop( 'checked', true );
			});
			// apply the saved primary language criteria
			$.each( savedSearchCriteria.languages, function( index, language ) {
				$( '.select-primary-language[value="' + language + '"]' ).prop( 'checked', true );
			});
			// apply the children who have contact with their biological siblings criterion
			$( '.select-contact-with-biological-siblings[value = "' + ( savedSearchCriteria.contactWithSiblings ? 'yes' : 'no' ) + '" ]' ).prop( 'checked', true );
			// apply the children who have contact with their biological parents criterion
			$( '.select-contact-with-biological-parents[value = "' + ( savedSearchCriteria.contactWithParents ? 'yes' : 'no' ) + '" ]' ).prop( 'checked', true );
			// apply child must have video criterion
			$( '.select-video-only' ).prop( 'checked', savedSearchCriteria.mustHaveVideo );
			// apply child must be legally free criterion
			$( '.select-legally-free-only' ).prop( 'checked', savedSearchCriteria.mustBeLegallyFree );
			// apply child's profile last updated criterion
			$( '#updated-within > option[value="' + ( savedSearchCriteria.lastProfileUpdate ) + '"]' ).prop( 'selected', true );
			// apply the saved social worker region criteria
			$.each( savedSearchCriteria.socialWorkerRegions, function( index, region ) {
				$( '.select-region[value="' + region + '"]' ).prop( 'checked', true );
			});
			// apply max physical needs criteria
			$( '.select-maximum-physical-needs[value="' + ( savedSearchCriteria.maxPhysicalNeeds || 3 ) + '"]' ).prop( 'checked', true );
			// apply max emotional needs criteria
			$( '.select-maximum-emotional-needs[value="' + ( savedSearchCriteria.maxEmotionalNeeds || 3 ) + '"]' ).prop( 'checked', true );
			// apply max intellectual needs criteria
			$( '.select-maximum-intellectual-needs[value="' + ( savedSearchCriteria.maxIntellectualNeeds || 3 ) + '"]' ).prop( 'checked', true );
			// apply developmental needs criteria
			$.each( savedSearchCriteria.developmentalNeeds, function( index, need ) {
				$( '.select-disabilities[value="' + need + '"]' ).prop( 'checked', true );
			});
			// apply number of children in home criterion
			$( '#number-of-children-in-home > option:eq(' + ( savedSearchCriteria.numChildrenInHome ? savedSearchCriteria.numChildrenInHome + 1 : 0 ) + ')' ).prop( 'selected', true );
			// apply age of youngest child in home criterion
			$( '#youngest-child-age-in-home > option:eq(' + ( savedSearchCriteria.youngestChildAge ? savedSearchCriteria.youngestChildAge + 1 : 0 ) + ')' ).prop( 'selected', true );
			// apply age of oldest child in home criterion
			$( '#oldest-child-age-in-home > option:eq(' + ( savedSearchCriteria.oldestChildAge ? savedSearchCriteria.oldestChildAge + 1 : 0 ) + ')' ).prop( 'selected', true );
			// apply pets in home criterion
			$( '.select-pets-in-home' ).prop( 'checked', savedSearchCriteria.hasPetsInHome );
			// apply relationship status criteria
			$( '#parent-relationship-status > option[value="' + ( savedSearchCriteria.relationshipStatus ) + '"]' ).prop( 'selected', true );
			// apply parent(s) gender(s) criteria
			$.each( savedSearchCriteria.parentsGenders, function( index, gender ) {
				$( '.select-parent-genders[value="' + gender + '"]' ).prop( 'checked', true );
			});
		},

		setDefaultValues: function setDefaultFormValues() {

			// make sure defaults have not already been set
			if ( !this.haveDefaultValuesBeenSet ) {

				// update flag
				this.haveDefaultValuesBeenSet = true;
				// get saved search criteria
				var savedSearchCriteria = $('.gallery-search-form').data( 'savedSearch' );
				
				// seed form fields with saved search criteria or fall back to defaults
				if ( savedSearchCriteria ) {
					this.applySavedSearchCriteria( savedSearchCriteria );
				} else {
					this.reset();
				}
			}
		}
	});
}() );
