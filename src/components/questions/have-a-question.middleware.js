const axios = require('axios');	
const listService = require( '../../components/lists/list.controllers' );
const staffEmailContactMiddleware = require( '../../components/staff email contacts/staff-email-contact.controllers' );
const haveAQuestionEmailService = require( '../../components/questions/have-a-question.email.controllers' );

exports.submitQuestion = async function submitQuestion( req, res, next ) {
	// store the question information in a local variable
	const question = req.body;
	// reload the form to display the flash message
	const redirectPath = '/forms/have-a-question';
	// set default information for a staff email contact in case the real contact info can't be fetched
	let staffEmailContactInfo = {
		name: { full: 'MARE' },
		email: 'web@mareinc.org'
	};

	// perform recaptcha validation
	let recaptchaData = undefined;
	try {

		// validate the recaptcha token 
		const recaptchaResult = await axios({
			method: 'post',
			url: 'https://www.google.com/recaptcha/api/siteverify',
			params: {
				secret: process.env.RECAPTCHA_SECRET,
				response: question[ 'g-recaptcha-response' ]
			}
		});
		// set recaptcha data
		recaptchaData = recaptchaResult.data;

	} catch( error ) {

		// mock recaptchaData object with a failed state
		recaptchaData = { success: false };

		// log any errors
		console.log( 'Could not validate recaptcha:' );
		console.error( error );	
	}

	// handle recaptcha validation failure
	if ( !recaptchaData.success ) {
		
		console.error( 'recaptcha validation failed' );

		// log any additional error codes
		const errorCodes = recaptchaData[ 'error-codes' ];
		if ( errorCodes ) {
			console.log( 'error codes:' );
			console.error( errorCodes );
		}

		// send a generic error message
		req.flash( 'error', {
			title: `There was an error submitting your question`,
			detail: `If this error persists, please notify MARE at <a href="mailto:web@mareinc.org">web@mareinc.org</a>` } );

		// prevent further execution and display error message to user 
		return res.redirect( 303, redirectPath );
	}
		
	// fetch the email target model matching 'have a question'
	const fetchEmailTarget = listService.getEmailTargetByName( 'have a question' );

	fetchEmailTarget
		// fetch contact info for the staff contact for 'have a question'
		.then( emailTarget => staffEmailContactMiddleware.getStaffEmailContactByEmailTarget( emailTarget.get( '_id' ), [ 'staffEmailContact' ] ) )
		// overwrite the default contact details with the returned object
		.then( staffEmailContact => staffEmailContactInfo = staffEmailContact.staffEmailContact )
		// log any errors fetching the staff email contact
		.catch( err => console.error( `error fetching email contact for have a question submission, default contact info will be used instead`, err ) )
		// send a notification email to MARE staff
		.then( () => haveAQuestionEmailService.sendNewQuestionNotificationEmailToMARE( question, staffEmailContactInfo ) )		
		// if the email was successfully sent to MARE staff
		.then( () => {
			// create a flash message to notify the user of the success
			req.flash( 'success', {
				title: `Your question has been received.`,
				detail: `You should expect a response from MARE within 2 business days.` } );
		})
		// if there was an error sending the email to MARE staff
		.catch( err => {
			// log the error for debugging purposes
			console.error( `error sending new question email to MARE staff`, err );
			// create a flash message to notify the user of the error
			req.flash( 'error', {
				title: `There was an error submitting your question`,
				detail: `If this error persists, please notify MARE at <a href="mailto:web@mareinc.org">web@mareinc.org</a>` } );
		})
		// redirect the user once finished
		.then( () => {
			// reload the form to display the flash message
			res.redirect( 303, redirectPath );
		});
};