(function () {
	'use strict';

	mare.views.InquiryReport = Backbone.View.extend({
		
		// this view controls everything inside the element with class 'dashboard-content'
		el: '.dashboard-content',

		events: {
			'click .inquiries-search-button'			: 'handleSearchClick',
			'click .inquiries-search-reset-button'		: 'handleResetClick',
			'click .inquiry-export-xlsx-button'			: 'handleXlsxExportClick',
			'click .inquiry-export-pdf-button'			: 'handlePDFExportClick',
			'click .inquiry-fiscal-year-buttons .btn'	: 'handleFiscalYearClick'
		},

		initialize: function() {
			
			var toolsInquiryReportTemplate = $( '#tools-inquiry-report-template' ).html();
			
			// compile the templates to be used during rendering/repainting the gallery
			this.template = Handlebars.compile( toolsInquiryReportTemplate );
        },

		initializeSearchForm: function( fromDate, toDate, params ) {
			
			function fillIn() {
				var input = jQuery( this );
						
				if ( input.attr( 'type' ) === 'checkbox' && ( _.contains( params[ paramName ], input.val() ) || params[ paramName ] === input.val() ) ) {
					input.prop( 'checked', true );
				}
				
				if ( input.prop( 'tagName' ).toLowerCase() === 'select' ) {
					input.val( params[ paramName ] );
				}
			}
			
			// seed form fields based on url params
			for ( var paramName in params ) {
				if ( params.hasOwnProperty( paramName ) ) {
					this.$el.find( '[name="' + paramName + '"], [name="' + paramName + '[]"]' ).each( fillIn );
				}
			}

			// initialize the date range picker
			this.$el.find( '[name="inquiry-date-range"]' ).daterangepicker({
				startDate: moment( fromDate ),
    			endDate: moment( toDate ),
				alwaysShowCalendars: true,
				showDropdowns: true,
				linkedCalendars: false,
				minYear: 1995,
				maxYear: parseInt( moment().format( 'YYYY' ), 10 ),
				ranges: {
					'Last 30 Days': [ moment().subtract( 29, 'days' ), moment() ],
					'Year to Date': [ moment().startOf( 'year' ), moment() ],
					'All Time': [ moment( '1995-01-01' ), moment() ]
				}
			});

			// initialize select inputs
			this.$el.find( '.source-select' ).select2({
				placeholder: 'All Sources',
				ajax: {
					url: '/tools/services/get-sources-data',
					dataType: 'json'
				}
			});

			this.$el.find( '.children-select' ).select2({
				placeholder: 'All Children',
				ajax: {
					url: '/tools/services/get-children-data',
					dataType: 'json'
				}
            });

			this.$el.find( '.inquirer-select' ).select2({
                placeholder: 'All Inquirers'
			});

			this.$el.find( '.inquiry-method-select' ).select2({
                placeholder: 'All Inquiry Methods'
			});

			this.$el.find( '.inquiry-type-select' ).select2({
				placeholder: 'All Inquiry Types'
			});
		},
		
		handleSearchClick: function() {

			// get the date range for the inquiry search
			var $dateRangeInputData = this.$el.find( '[name="inquiry-date-range"]' ).data( 'daterangepicker' );
			var fromDate = $dateRangeInputData.startDate.format( 'YYYY-MM-DD' );
			var toDate = $dateRangeInputData.endDate.format( 'YYYY-MM-DD' );

			// collect all values of the form
			var params = this.$el.find( 'form' ).serializeArray();
			
			// remove empty values
			params = _.filter( params, function( value ) {
				return value && value.value && value.value.length > 0 && value.name !== 'inquiry-date-range';
			});
			
			// build the query string
			var queryString = jQuery.param( params );

			// perform the search
			mare.routers.tools.navigate( 'inquiry-report/' + fromDate + '/' + toDate + ( queryString.length > 0 ? '?' + queryString : '' ), { trigger: true } );
		},

		handleResetClick: function() {
			mare.routers.tools.navigate( 'inquiry-report', { trigger: true } );
		},

		handleXlsxExportClick: function() {
			var table = this.$el.find( '.results-table' ),
				wb = XLSX.utils.table_to_book( table[ 0 ] );
				
			// convert HTML table to XLSX file
			XLSX.writeFile( wb, table.data( 'filename' ) );
		},

		handlePDFExportClick: function() {

			// collect the state of the form
			var params = this.$el.find( 'form' ).serializeArray();
			
			// remove empty values
			params = _.filter( params, function( value ) {
				return value && value.value && value.value.length > 0 && value.name !== 'inquiry-date-range';
			});

			// add the date range to the params
			var $dateRangeInputData = this.$el.find( '[name="inquiry-date-range"]' ).data( 'daterangepicker' );
			params.push({
				name: 'fromDate',
				value: $dateRangeInputData.startDate.format( 'YYYY-MM-DD' )
			}, {
				name: 'toDate',
				value: $dateRangeInputData.endDate.format( 'YYYY-MM-DD' )
			});
			
			// build the query string
			var queryString = jQuery.param( params );
			
			// redirect to the PDF report download URL
			window.open( '/tools/services/get-inquiry-data?' + queryString + '&pdf=1', '_blank' );
		},

		handleFiscalYearClick: function( event ) {
			event.preventDefault();

			// set the search date range
			var $dateRangeInputData = this.$el.find( '[name="inquiry-date-range"]' ).data( 'daterangepicker' );
			$dateRangeInputData.setStartDate( moment( $( event.target ).data( 'yearStart' ) ) );
			$dateRangeInputData.setEndDate( moment( $( event.target ).data( 'yearEnd' ) ) );
		},

		render: function( fromDate, toDate, params ) {
			
			var view = this;
			
			// if the from and to dates are not passed in, initialize the form using the default date range
			if ( !fromDate || !toDate ) {

				view.$el.html( view.template() );
				view.initializeSearchForm( view.$el.find( '#defaultFromDate' ).val(), view.$el.find( '#defaultToDate' ).val() );
				
			// otherwise, set the from and to dates using the route params and perform a search using the query params
			} else {

				// render the view while the results are being loaded
				view.$el.html( view.template({
					waitingForResults: true
				}));
				view.initializeSearchForm( fromDate, toDate, params );

				// search for inquiries using the date range and query params
				view.getInquiryData( fromDate, toDate, params )
					.done( function( data ) {
						// render the view with the search results
						view.$el.html( view.template( data ) );
						view.initializeSearchForm( fromDate, toDate, params );

						// initialize a DataTable (https://datatables.net/) with the inquiry results
						// save a reference to the table so it can be destroyed when the view changes
						mare.views.tools.table = $('#inquiry-results').DataTable({
							data: data.results, 				// set results data as table source
							columns: view.reportGridColumns, 	// configure columns
							order: [[1, 'desc']], 				// define default sort (column index, direction)
							fixedHeader: true, 					// fix the header to the top of the viewport on vertical scroll
							pageLength: 100,					// set default number of rows to display
							responsive: {						// hide columns from right-to-left when the viewport is too narrow
								details: false					// do not display overflow columns in details row (overwrites default content)
							},
							dom: 'Bfrtip',						// define the placement of the grid options (buttons)
							buttons: [
								'pageLength',					// adds toggle for number of rows to display
								{
									extend: 'colvis',			// adds column visibility toggle menu
									columns: ':gt(0)'			// allows toggling of all columns except the first one
								}
							],
							// callback for each grid row when it is created
							createdRow: function( row, data ) {
								// if the inquiry has multiple children create a detail row to display their information
								if (data.siblings) {
									var api = this.api();
									var detailsHeader = '<div class="details-row__header">Other children included in this inquiry:</div>';
									var detailsRows = data.siblings.map( function( sibling ) {
										return '<div class="details-row__body"><a href="/keystone/children/' + sibling.siblingId + '">' + sibling.siblingRegistrationNumber + '</a> - ' + sibling.siblingName + '</div>';
									});
									var detailsContent = '<div class="details-row">' + detailsHeader + detailsRows.join('') + '</div>';
									api.row( row ).child( detailsContent ).show();
								}
							}
						});
					});
			}
		},

		getInquiryData: function( fromDate, toDate, params ) {
			
			var queryParams = params;
			queryParams.fromDate = fromDate;
			queryParams.toDate = toDate;
			
			return $.Deferred( function( defer ) {
				$.ajax({
					dataType: 'json',
					url: '/tools/services/get-inquiry-data',
					data: queryParams,
					type: 'GET'
				})
				.done( function( data ) {
					if ( data.status === 'error' ) {
						// display the flash message
						mare.views.flashMessages.initializeAJAX( data.flashMessage );
						defer.reject();
					} else {
						defer.resolve( data );
					}
				})
				.fail( function( err ) {
					console.log( err );
					defer.reject();
				});
			}).promise();
		},

		reportGridColumns: [
			{
				title: '',
				data: 'inquiryId',
				orderable: false,
				className: 'icon-link-column',
				render: function( data ) {
					return '<a href="/keystone/inquiries/' + data + '"><i class="fa fa-external-link" aria-hidden="true"></i></a>';
				}
			},
			{ 
				title: 'Inquiry Date', 
				data: function( row, type ) {
					// return date in ISO format to enable column sorting
					return type === 'sort' ? row.inquiryDateISO : row.inquiryDate;
				}
			},
			{ title: 'Inquiry Type', data: 'inquiryType' },
			{ title: 'Inquiry Method', data: 'inquiryMethod', visible: false },
			{ title: 'First Name', data: 'childNameFirst' },
			{ title: 'Last Name', data: 'childNameLast' },
			{ 
				title: 'Reg #',
				data: 'childRegistrationNumber',
				render: function( data, type, row, meta ) {
					return row.childId
						? '<a href="/keystone/children/' + row.childId + '">' + data + '</a>'
						: '--';
				}
			},
			{ 
				title: 'Child SW Region',
				data: 'childsSWAgencyRegion',
				defaultContent: '--'
			},
			{ title: 'Contact 1', data: 'familyContact1' },
			{ title: 'Contact 1 Email', data: 'familyContact1Email', visible: false },
			{ title: 'Contact 2', data: 'familyContact2' },
			{ title: 'Contact 2 Email', data: 'familyContact2Email', visible: false },
			{ 
				title: 'Reg #',
				data: 'familyRegistrationNumber',
				render: function( data, type, row, meta ) {
					return row.familyId
						? '<a href="/keystone/families/' + row.familyId + '">' + data + '</a>'
						: '--';
				}
			},
			{
				title: 'Source',
				data: 'source',
				defaultContent: '--',
				visible: false
			},
			{
				title: 'Additional Source(s)',
				data: 'additionalSources',
				defaultContent: '--',
				visible: false
			},
			{
				title: 'Source Description',
				data: 'sourceDescription',
				defaultContent: '--',
				visible: false
			},
			{
				title: 'Max Physical Needs',
				data: 'maxPhysicalNeeds',
				defaultContent: '--',
				visible: false
			},
			{
				title: 'Max Emotional Needs',
				data: 'maxIntellectualNeeds',
				defaultContent: '--',
				visible: false
			},
			{
				title: 'Max Intellectual Needs',
				data: 'maxEmotionalNeeds',
				defaultContent: '--',
				visible: false
			},
			{
				title: 'Disabilities',
				data: 'disabilities',
				defaultContent: '--',
				visible: false
			},
			{
				title: 'Accepted?',
				data: 'isAccepted',
				defaultContent: '--',
				visible: false
			}
		]
	});
}());
