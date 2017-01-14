var docusign = require('docusign-esign');
var async = require('async');

var integratorKey  = '541f00cf-cc72-4048-90cf-991baf9c24f7',    // Integrator Key associated with your DocuSign Integration
  email            = 'campionf@uw.edu',             // Email for your DocuSign Account
  password         = 'hackathon123',          // Password for your DocuSign Account
  recipientName    = 'Alvin',    // Recipient's Full Name
  recipientEmail   = 'campionfellin@gmail.com';   // Recipient's Email

var basePath = "https://demo.docusign.net/restapi";

// initialize the api client
var apiClient = new docusign.ApiClient();
apiClient.setBasePath(basePath);

// create JSON formatted auth header
var creds = JSON.stringify({
  Username: email,
  Password: password,
  IntegratorKey: integratorKey
});

// configure DocuSign authentication header
apiClient.addDefaultHeader("X-DocuSign-Authentication", creds);

// assign api client to the Configuration object
docusign.Configuration.default.setDefaultApiClient(apiClient);

async.waterfall([
  function login (next) {
    // login call available off the AuthenticationApi
    var authApi = new docusign.AuthenticationApi();

    // login has some optional parameters we can set
    var loginOps = new authApi.LoginOptions();
    loginOps.setApiPassword("true");
    loginOps.setIncludeAccountIdGuid("true");
    authApi.login(loginOps, function (err, loginInfo, response) {
      if (err) {
        return next(err);
      }
      if (loginInfo) {
        // list of user account(s)
        // note that a given user may be a member of multiple accounts
        var loginAccounts = loginInfo.getLoginAccounts();
        console.log("LoginInformation: " + JSON.stringify(loginAccounts));
        next(null, loginAccounts);
      }
    });
  }
]);


function createAndSendEnvelopeWithEmbeddedRecipient (loginAccounts, next) {

    var fileBytes = null;
    try {
        var fs = require('fs'),
            path = require('path');
        // read file from a local directory
        fileBytes = fs.readFileSync(path.resolve(__filename + '/..' + SignTest1File));

    } catch (ex) {
        // handle error
        console.log("Exception: " + ex);
    }

    // create a new envelope object that we will manage the signature request through
    var envDef = new docusign.EnvelopeDefinition();
    envDef.setEmailSubject("[DocuSign Node SDK] - Please sign this doc");

    // add a document to the envelope
    var doc = new docusign.Document();
    var base64Doc = new Buffer(fileBytes).toString('base64');
    doc.setDocumentBase64(base64Doc);
    doc.setName("TestFile.pdf");
    doc.setDocumentId("1");

    var docs = [];
    docs.push(doc);
    envDef.setDocuments(docs);

    // Add an embedded recipient to sign the document
    var signer = new docusign.Signer();
    signer.setName("Alvin");
    signer.setEmail("campionfellin@gmail.com");
    signer.setRecipientId("1");
    signer.setClientUserId("1234");  // must set clientUserId to embed the recipient!

    // create a signHere tab somewhere on the document for the signer to sign
    // default unit of measurement is pixels, can be mms, cms, inches also
    var signHere = new docusign.SignHere();
    signHere.setDocumentId("1");
    signHere.setPageNumber("1");
    signHere.setRecipientId("1");
    signHere.setXPosition("100");
    signHere.setYPosition("100");

    // can have multiple tabs, so need to add to envelope as a single element list
    var signHereTabs = [];
    signHereTabs.push(signHere);
    var tabs = new docusign.Tabs();
    tabs.setSignHereTabs(signHereTabs);
    signer.setTabs(tabs);

    // configure the envelope's recipient(s)
    envDef.setRecipients(new docusign.Recipients());    
    envDef.getRecipients().setSigners([]);
    envDef.getRecipients().getSigners().push(signer);

    // set envelope status to "sent" so we can sign it. Otherwise it's placed in draft folder
    envDef.setStatus("sent");

    var envelopesApi = new docusign.EnvelopesApi();

    envelopesApi.createEnvelope(loginAccounts[0].accountId, envDef, null, function(error, envelopeSummary, response) {
        if (error) {
            return next(error);
        }

        if (envelopeSummary) {
            console.log("EnvelopeSummary: " + JSON.stringify(envelopeSummary));
            envelopeId = envelopeSummary.envelopeId;
            next(null, envelopeId, loginAccounts);
        }
    });
  }