var express = require('express');
var app = express();
var PythonShell = require('python-shell');

var customURL;


app.use(express.static(__dirname ));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/audio', function (req, res) {



	var options = {
		  args: [req.body]
		};

	PythonShell.run('downsample.py', options, function (err, results) {
		  if (err) throw err;
		  console.log(results)
		  // results is an array consisting of messages collected during execution 
		 // console.log('results: %j', results);
		   	res.send('Done downsampling. File located at downsampled.wav');

		});


});


app.get('/docusign', (req, res) => {


	blah(function() {
		var options = {
		  args: [customURL.url]
		};
		 
		PythonShell.run('docusign.py', options, function (err, results) {
		  if (err) throw err;
		  console.log(options.args[0])
		  console.log(results)
		  // results is an array consisting of messages collected during execution 
		 // console.log('results: %j', results);
		});




		res.redirect("/thankyou.html");

		//res.send("Your doc has been signed. Thanks")
	});




    //res.send("hihihi");
});

app.listen(3000, () => {
    console.log('Running app');
});

var async = require("async"),		// async module
	request = require("request"),		// request module
	email = "campionf@uw.edu",				// your account email
	password = "hackathon123",			// your account password
	integratorKey = "541f00cf-cc72-4048-90cf-991baf9c24f7",			// your account Integrator Key (found on Preferences -> API page)
	recipientName = "Campion",			// recipient (signer) name
	templateId = "0f98f05c-de98-4a43-8e6a-e62d45bd2420",			// provide valid templateId from a template in your account
	templateRoleName = "Buyer",		// template role that exists on template referenced above
	baseUrl = "",				// we will retrieve this
	envelopeId = "";	

function blah(callback) {


		// created from step 2

async.waterfall(
[
	//////////////////////////////////////////////////////////////////////
	// Step 1 - Login (used to retrieve accountId and baseUrl)
	//////////////////////////////////////////////////////////////////////
	function(next) {
		var url = "https://demo.docusign.net/restapi/v2/login_information";
		var body = "";	// no request body for login api call
		
		// set request url, method, body, and headers
		var options = initializeRequest(url, "GET", body, email, password);
		
		// send the request...
		request(options, function(err, res, body) {
			if(!parseResponseBody(err, res, body)) {
				return;
			}
			baseUrl = JSON.parse(body).loginAccounts[0].baseUrl;
			next(null); // call next function
		});
	},
	
	//////////////////////////////////////////////////////////////////////
	// Step 2 - Send envelope with one Embedded recipient (using clientUserId property)
	//////////////////////////////////////////////////////////////////////
	function(next) {
		var url = baseUrl + "/envelopes";
		var body = JSON.stringify({
				"emailSubject": "DocuSign API call - Embedded Sending Example",
				"templateId": templateId,
				"templateRoles": [{
					"email": email,
					"name": recipientName,
					"roleName": templateRoleName,
					"clientUserId": "1001"	// user-configurable
				}],
				"status": "sent"
			});
		console.log("-------------------");
		console.log(body);

		console.log("-------------------");
		
		// set request url, method, body, and headers
		var options = initializeRequest(url, "POST", body, email, password);
		
		// send the request...
		request(options, function(err, res, body) {
			if(!parseResponseBody(err, res, body)) {
				return;
			}
			// parse the envelopeId value from the response
			envelopeId = JSON.parse(body).envelopeId;
			next(null); // call next function
		});
	},
	
	//////////////////////////////////////////////////////////////////////
	// Step 3 - Get the Embedded Signing View (aka the recipient view)
	//////////////////////////////////////////////////////////////////////
	function(next) {
		var url = baseUrl + "/envelopes/" + envelopeId + "/views/recipient";
		var method = "POST";
		var body = JSON.stringify({
				"returnUrl": "http://www.docusign.com/devcenter",
				"authenticationMethod": "email",					
				"email": email,					
				"userName": recipientName,		
				"clientUserId": "1001",	// must match clientUserId in step 2!
			});  
		
		// set request url, method, body, and headers
		var options = initializeRequest(url, "POST", body, email, password);
		
		// send the request...
		request(options, function(err, res, body) {
			console.log("_----------_______-");
			customURL = JSON.parse(res.body);
			console.log(customURL.url);
			//window.location = customURL.url;
			
			console.log(res.body.url);
			console.log("alskjdjdjaslkdjalksjdlkasjdlkasjkldjlksajldksa");


			if(!parseResponseBody(err, res, body))
				return;
			else
				console.log("\nNavigate to the above URL to start the Embedded Signing workflow...");
				callback();
		});
	}
]);

}

//***********************************************************************************************
// --- HELPER FUNCTIONS ---
//***********************************************************************************************
function initializeRequest(url, method, body, email, password) {	
	var options = {
		"method": method,
		"uri": url,
		"body": body,
		"headers": {}
	};
	addRequestHeaders(options, email, password);
	return options;
}

///////////////////////////////////////////////////////////////////////////////////////////////
function addRequestHeaders(options, email, password) {	
	// JSON formatted authentication header (XML format allowed as well)
	dsAuthHeader = JSON.stringify({
		"Username": email,
		"Password": password, 
		"IntegratorKey": "541f00cf-cc72-4048-90cf-991baf9c24f7"	// global
	});
	// DocuSign authorization header
	options.headers["X-DocuSign-Authentication"] = dsAuthHeader;
}

///////////////////////////////////////////////////////////////////////////////////////////////
function parseResponseBody(err, res, body) {
	console.log("\r\nAPI Call Result: \r\n", JSON.parse(body));
	if( res.statusCode != 200 && res.statusCode != 201)	{ // success statuses
		console.log("Error calling webservice, status is: ", res.statusCode);
		console.log("\r\n", err);
		return false;
	}
	return true;
}