function getBaseURL() {



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

}