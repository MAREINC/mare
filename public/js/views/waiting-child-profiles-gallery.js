// TODO: rework bookmarking to separate out the event broadcasting and the reaction to the events.  With bookmark capability
//		 in the details section as well, this got a little ugly and can be cleaned up and simplified
//		 1: send the event that an update is needed
//		 2: make the ajax call to update and send an event on success or failure
//		 3: respond to the event by updating the classes
(function () {
	'use strict';

	mare.views.Gallery = Backbone.View.extend({
		// this view controls everything inside the element with class 'gallery'
		el: '.gallery',
		// bind standard events to functions within the view
		events: {
			'click .child-media-box'						: 'displayChildDetails',
			'click .sibling-group-media-box'				: 'displaySiblingGroupDetails',
			'click .child-bookmark'							: 'toggleChildBookmark',
			'click .sibling-group-bookmark'					: 'toggleSiblingGroupBookmark',
			'change .waiting-child-profiles__gallery-filter': 'sortGallery'
		},

		/* initialize the gallery view */
		initialize: function initialize() {
			// the default number of boxes to load
			this.defaultBoxesToLoadStart = 32;
			
			// create a hook to access the gallery template
			var galleryChildrenHtml				= $( '#gallery-children-template' ).html();
			var gallerySiblingGroupsHtml		= $( '#gallery-sibling-groups-template' ).html();
			// compile the templates to be used during rendering/repainting the gallery
			this.childrenTemplate				= Handlebars.compile( galleryChildrenHtml );
			this.siblingGroupsTemplate			= Handlebars.compile( gallerySiblingGroupsHtml );
			// initialize a subview for the details modals
			mare.views.childDetails				= mare.views.childDetails || new mare.views.ChildDetails();
			mare.views.siblingGroupDetails		= mare.views.siblingGroupDetails || new mare.views.SiblingGroupDetails();
			
			// initialize the gallery once we've fetched the child data needed to display the gallery (this doesn't include child details data)
			mare.promises.childrenDataLoaded.done( function() {
				this.childrenCollection			= mare.collections.galleryChildren;
				this.siblingGroupsCollection	= mare.collections.gallerySiblingGroups;
			}.bind( this ) );

			// bind to change events
			this.on( 'sorted', function() {
				this.render();
			}.bind( this ) );
			
			// when we get a response from the server that the bookmark for a child has successfully updated, update the view
			mare.collections.galleryChildren.on( 'childBookmarkUpdated', function( registrationNumber, action ) {
				this.updateChildBookmarkView( registrationNumber, action );
			}.bind( this ) );
			
			// when we get a response from the server that the bookmark for a group of siblings successfully updated, update the view
			mare.collections.galleryChildren.on( 'siblingGroupBookmarkUpdated', function( registrationNumbers, action ) {
				this.updateSiblingGroupBookmarkView( registrationNumbers, action );
			}.bind( this ) );
			
			// when the details view sends an event to trigger updating the child bookmark, send the request to the server
			mare.collections.galleryChildren.on( 'childBookmarkUpdateNeeded', function( registrationNumber, action ) {
				if( action === 'add' ) {
					this.addChildBookmark( registrationNumber );
				} else if( action === 'remove' ) {
					this.removeChildBookmark( registrationNumber );
				}
			}.bind( this ) );
			
			// when the details view sends an event to trigger updating the sibling group bookmark, send the request to the server
			mare.collections.galleryChildren.on( 'siblingGroupBookmarkUpdateNeeded', function( registrationNumbers, action ) {
				if( action === 'add' ) {
					this.addSiblingGroupBookmark( registrationNumbers );
				} else if( action === 'remove' ) {
					this.removeSiblingGroupBookmark( registrationNumbers );
				}
			}.bind( this ) );
		},

		/* render the view onto the page */
		render: function render( doneCallback ) {
			// store a reference to this for inside callbacks where context is lost
			var view = this;
			// unbind any existing media box plugins
			this.unbindMediaBoxes();
			
			// NOTE: The following logic conflicts with opening the login modal automatically.  Could not reproduce another scenario where a modal would already be open when rendering this page,
			// so commenting it out for now. Leaving the code in place because it may cause unintended behavior down the road.

			// close the modal if opened
			//mare.views.childDetails.closeModal();
			
			// the gallery can't render until we have the user permissions and the child data is loaded
			// use the promise bound to both data to delay rendering until we have them
			$.when( mare.promises.permissionsLoaded, mare.promises.childrenDataLoaded ).then( function() {
				// pass the collection data through the gallery template to generate the HTML to be added to the gallery
				var siblingGroupsHtml	= view.siblingGroupsTemplate( view.siblingGroupsCollection.toJSON() );
				var childrenHtml		= view.childrenTemplate( view.childrenCollection.toJSON() );

				view.$( '#children-grid' ).html( siblingGroupsHtml + childrenHtml );
			}).then( typeof doneCallback === "function" ? doneCallback : function() { 
				// once the html is rendered to the page, initialize the gallery display plugin
				view.initializeMediaBoxes( view.defaultBoxesToLoadStart );
			} );
		},
		
		/* render the gallery view and the child details */
		renderChild: function renderChild( registrationNumber ) {
			this.render( function () {
				var element = this.$( '.child-media-box[data-registration-number="' + registrationNumber + '"]' );
				if ( element.length > 0 ) {
					element.trigger( jQuery.Event( "click" ) );
					this.initializeMediaBoxesOnTarget( element );
				} else {
					this.initializeMediaBoxes( this.defaultBoxesToLoadStart );
				}
			}.bind( this ) );
		},
		
		/* render the gallery view and the sibling group details */
		renderSiblingGroup: function renderSiblingGroup( registrationNumbers ) {
			this.render( function () {
				var element = this.$( '.sibling-group-media-box[data-registration-numbers="' + registrationNumbers.replace( /-/g, "," ) + '"]' );
				if ( element.length > 0 ) {
					element.trigger( jQuery.Event( "click" ) );
					this.initializeMediaBoxesOnTarget( element );
				} else {
					this.initializeMediaBoxes( this.defaultBoxesToLoadStart );
				}
			}.bind( this ) );
		},
		
		/* clearing this search is needed as using modify search while this has content causes
		   the page to render incorrectly when navigating back to the gallery */
		clearRegistrationSearch: function clearRegistrationSearch() {
			this.$( '#registration-number-search' ).val( '' ).trigger( 'keyup' );
		},
		
		/* ititializes the media box plugin that drives the images in the gallery, it focuses on a given element */
		initializeMediaBoxesOnTarget: function initializeMediaBoxesOnTarget( targetElement ) {
			// calculate how many boxes should be displayed on start
			var boxesToLoadStart = targetElement.index();
			boxesToLoadStart += ( 4 - ( boxesToLoadStart % 4 ) );
			boxesToLoadStart += 8;
			
			// initialize the gallery display plugin
			this.initializeMediaBoxes( boxesToLoadStart > this.defaultBoxesToLoadStart ? boxesToLoadStart : this.defaultBoxesToLoadStart );
			
			// scroll down to the target element
			setTimeout( function() {
				var scrollTop = targetElement.offset().top - $( '.global-header' ).height();
				if ( scrollTop > 0 ) {
					$( window ).scrollTop( scrollTop );
				}
			}, 1000 );
		},

		/* ititializes the media box plugin that drives the images in the gallery */
		initializeMediaBoxes: function initializeMediaBoxes( boxesToLoadStart ) {
			// initialize the photo listing children gallery grid
			$( '#children-grid' ).mediaBoxes({
				boxesToLoadStart: boxesToLoadStart,
				boxesToLoad 	: 24,
				search			: '#registration-number-search',
				searchTarget	: '.media-box-registration-number'
			});
		},

		unbindMediaBoxes: function unbindMediaBoxes() {
			// destroying the children grid will remove it from DOM
			$( '#children-grid' ).mediaBoxes( 'destroy' );
			// insert a replacement div so that the mediaboxes plugin can be re-initialized
			$( 'section.profiles-container' ).prepend( '<div id="children-grid" class="card-grid"></div>' );
		},

		/* pass the request for child details to the subview in charge of the details modal */
		displayChildDetails: function displayChildDetails( event ) {

			mare.views.childDetails.handleGalleryClick( event );
		},

		/* pass the request for sibling group detials to the subview in charge of the details modal */
		displaySiblingGroupDetails: function displaySiblingGroupDetails( event ) {

			mare.views.siblingGroupDetails.handleGalleryClick( event );
		},

		/* determine how to handle a click on the bookmark element */
		toggleChildBookmark: function toggleChildBookmark( event ) {
			// TODO: see if this is needed
			event.stopPropagation();
			// DOM cache the current target for performance
			var $currentTarget = $( event.currentTarget );
			// get the child's registration number to match them in the database
			var registrationNumber = $currentTarget.closest( '.media-box' ).data( 'registration-number' );

			// if we are currently saving the users attempt to toggle the bookmark and the server hasn't processed the change yet, ignore the click event
			if( $currentTarget.hasClass( 'bookmark--disabled' ) ) {

				return;

			// if the child is currently bookmarked, remove them
			} else if( $currentTarget.hasClass( 'bookmark--active' ) ) {

				$currentTarget.addClass( 'bookmark--disabled' );
				this.removeChildBookmark( registrationNumber );

			// if the child is not currently bookmarked, add them
			} else {

				$currentTarget.addClass( 'bookmark--disabled' );
				this.addChildBookmark( registrationNumber );

			}
		},

		/* determine how to handle a click on the bookmark element */
		toggleSiblingGroupBookmark: function toggleSiblingGroupBookmark( event ) {

			event.stopPropagation();
			// DOM cache the current target for performance
			var $currentTarget = $( event.currentTarget );
			// get the child's registration number to match them in the database
			var registrationNumbers = $currentTarget.closest( '.media-box' ).data( 'registration-numbers' );

			// if we are currently saving the users attempt to toggle the bookmark and the server hasn't processed the change yet, ignore the click event
			if( $currentTarget.hasClass( 'bookmark--disabled' ) ) {

				return;

			// if the child is currently bookmarked, remove them
			} else if( $currentTarget.hasClass( 'bookmark--active' ) ) {

				$currentTarget.addClass( 'bookmark--disabled' );
				this.removeSiblingGroupBookmark( registrationNumbers );

			// if the child is not currently bookmarked, add them
			} else {

				$currentTarget.addClass( 'bookmark--disabled' );
				this.addSiblingGroupBookmark( registrationNumbers );

			}
		},
		// TODO: combine the add / remove calls here and for siblings
		/* make a call to the server to bookmark the child */
		addChildBookmark: function addChildBookmark( registrationNumber ) {

			$.ajax({
				url: '/services/add-child-bookmark',
				type: 'POST',
				data: {
					registrationNumber: registrationNumber
				}
			}).done( function( response ) {
				// update the isBookmarked field for the target child model in the display collection
				mare.collections.galleryChildren.each( function( child ) {
					if( child.get( 'registrationNumber' ) === registrationNumber ) {
						child.set( 'isBookmarked', true );
					}
				});
				// we need to check for existence of the collection because it's present in the gallery, but no on a user's account page
				if( mare.collections.allChildren ) {
					// update the isBookmarked field for the target child model in the master children collection
					mare.collections.allChildren.each( function( child ) {
						if( child.get( 'registrationNumber' ) === registrationNumber ) {
							child.set( 'isBookmarked', true );
						}
					});
				}
				// emit an event on the collection showing that the child's bookmark has been updated
				// this is bound to the collection so other views bound to the same data ( the details modal ) can respond
				mare.collections.galleryChildren.trigger( 'childBookmarkUpdated', registrationNumber, 'add' );

			}).fail( function( err ) {
				// TODO: Show an error message to the user
				console.log( err );
			});
		},

		/* make a call to the server to remove the bookmark for the child, then modify the view */
		removeChildBookmark: function removeChildBookmark( registrationNumber ) {

			$.ajax({
				url: '/services/remove-child-bookmark',
				type: 'POST',
				data: {
					registrationNumber: registrationNumber
				}
			}).done( function( response ) {
				// update the isBookmarked field for the target child model in the display collection
				mare.collections.galleryChildren.each( function( child ) {
					if( child.get( 'registrationNumber' ) === registrationNumber ) {
						child.set( 'isBookmarked', false );
					}
				});
				// we need to check for existence of the collection because it's present in the gallery, but no on a user's account page
				if( mare.collections.allChildren ) {
					// update the isBookmarked field for the target child model in the master children collection
					mare.collections.allChildren.each( function( child ) {
						if( child.get( 'registrationNumber' ) === registrationNumber ) {
							child.set( 'isBookmarked', false );
						}
					});
				}
				// TODO: the following event and all like it should trigger off the isBookmarked attribute changing
				// emit an event on the collection showing that the child's bookmark has been updated
				// this is bound to the collection so other views bound to the same data ( the details modal ) can respond
				mare.collections.galleryChildren.trigger( 'childBookmarkUpdated', registrationNumber, 'remove' );

			}).fail( function( err ) {
				// TODO: Show an error message to the user
				console.log( err );
			});

		},

		/* make a call to the server to add bookmarks for all children in the sibling group, then modify the view */
		addSiblingGroupBookmark: function addSiblingGroupBookmark( registrationNumbers ) {

			$.ajax({
				url: '/services/add-sibling-group-bookmark',
				type: 'POST',
				data: {
					registrationNumbers: registrationNumbers
				}
			}).done( function( response ) {
				// create a string array from the string of registration numbers in the sibling group
				var registrationNumbersStringArray = registrationNumbers.split( ',' );
				// create a number array for comparisons from the string array
				var registrationNumbersArray = registrationNumbersStringArray.map( function( numberAsString ) {
					return Number.parseInt( numberAsString, 10 );
				});

				// update the isBookmarked field for the target siblingGroup model in the display collection
				mare.collections.gallerySiblingGroups.each( function( siblingGroup ) {
					if( _.intersection( registrationNumbersArray, siblingGroup.get( 'registrationNumbers' ) ).length > 0 ) {
						siblingGroup.set( 'isBookmarked', true );
					}
				});
				// we need to check for existence of the collection because it's present in the gallery, but no on a user's account page
				if( mare.collections.allSiblingGroups ) {
					// update the isBookmarked field for the target siblingGroup model in the master sibling group collection
					mare.collections.allSiblingGroups.each( function( siblingGroup ) {
						if( _.intersection( registrationNumbersArray, siblingGroup.get( 'registrationNumbers' ) ).length > 0 ) {
							siblingGroup.set( 'isBookmarked', true );
						}
					});
				}
				// emit an event on the collection showing that the sibling group's bookmark has been updated
				// this is bound to the collection so other views bound to the same data ( the details modal ) can respond
				mare.collections.galleryChildren.trigger( 'siblingGroupBookmarkUpdated', registrationNumbers, 'add' );

			}).fail( function( err ) {
				// TODO: Show an error message to the user
				console.log( err );
			});
		},

		/* make a call to the server to remove bookmarks for all children in the sibling group, then modify the view */
		removeSiblingGroupBookmark: function removeSiblingGroupBookmark( registrationNumbers ) {

			$.ajax({
				url: '/services/remove-sibling-group-bookmark',
				type: 'POST',
				data: {
					registrationNumbers: registrationNumbers
				}
			}).done( function( response ) {
				// create a string array from the string of registration numbers in the sibling group
				var registrationNumbersStringArray = registrationNumbers.split( ',' );
				// create a number array for comparisons from the string array
				var registrationNumbersArray = registrationNumbersStringArray.map( function( numberAsString ) {
					return Number.parseInt( numberAsString, 10 );
				});

				// update the isBookmarked field for the target siblingGroup model in the display collection
				mare.collections.gallerySiblingGroups.each( function( siblingGroup ) {
					if( _.intersection( registrationNumbersArray, siblingGroup.get( 'registrationNumbers' ) ).length > 0 ) {
						siblingGroup.set( 'isBookmarked', false );
					}
				});
				// we need to check for existence of the collection because it's present in the gallery, but no on a user's account page
				if( mare.collections.allSiblingGroups ) {
					// update the isBookmarked field for the target siblingGroup model in the master sibling group collection
					mare.collections.allSiblingGroups.each( function( siblingGroup ) {
						if( _.intersection( registrationNumbersArray, siblingGroup.get( 'registrationNumbers' ) ).length > 0 ) {
							siblingGroup.set( 'isBookmarked', false );
						}
					});
				}
				// emit an event on the collection showing that the sibling group's bookmark has been updated
				// this is bound to the collection so other views bound to the same data ( the details modal ) can respond
				mare.collections.galleryChildren.trigger( 'siblingGroupBookmarkUpdated', registrationNumbers, 'remove' );

			}).fail( function( err ) {
				// TODO: Show an error message to the user
				console.log( err );
			});
		},
		// TODO: this can be combined with the handler for sibling groups below
		updateChildBookmarkView: function updateChildBookmarkView( registrationNumber, action ) {

			var targetChild = $( '.media-boxes-container' ).find( "[data-registration-number='" + registrationNumber + "']" );
			var targetButton = targetChild.find( '.bookmark' );

			switch( action ) {
				case 'add':
					// change the icon from a plus to a minus
					targetButton.children( '.bookmark__icon' ).removeClass( 'fa-plus-square-o' ).addClass( 'fa-minus-square-o' );
					targetButton.addClass( 'bookmark--active' );
					break;
				case 'remove':
					// change the icon from a minus to a plus
					targetButton.children( '.bookmark__icon' ).removeClass( 'fa-minus-square-o' ).addClass( 'fa-plus-square-o' );
					targetButton.removeClass( 'bookmark--active' );
					break;
			}

			targetButton.removeClass( 'bookmark--disabled' );
		},

		updateSiblingGroupBookmarkView: function updateSiblingGroupBookmarkView( registrationNumbers, action ) {

			var targetSiblingGroup = $( '.media-boxes-container' ).find( "[data-registration-numbers='" + registrationNumbers + "']" );
			var targetButton = targetSiblingGroup.find( '.bookmark' );

			switch( action ) {
				case 'add':
				// change the icon from a plus to a minus
					targetButton.children( '.bookmark__icon' ).removeClass( 'fa-plus-square-o' ).addClass( 'fa-minus-square-o' );
					targetButton.addClass( 'bookmark--active' );
					break;
				case 'remove':
					// change the icon from a minus to a plus
					targetButton.children( '.bookmark__icon' ).removeClass( 'fa-minus-square-o' ).addClass( 'fa-plus-square-o' );
					targetButton.removeClass( 'bookmark--active' );
					break;
			}

			targetButton.removeClass( 'bookmark--disabled' );
		},

		/* sort the children in the gallery */
		sortGallery: function sortGallery( event ) {
			// get the selected option to sort by from the dropdown menu
			var sortBy = $( event.currentTarget ).val();
			// update the order of the children being shown in the gallery
			mare.collections.galleryChildren.reorder( sortBy );
			// update the order of the sibling groups being shown in the gallery
			mare.collections.gallerySiblingGroups.reorder( sortBy );

			this.trigger( 'sorted' );
		}
	});
}());
