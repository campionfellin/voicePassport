function recordVoice() {
    console.log("hihihi");
}

function stopRecording()
{

}


function redirectToDocusign() {
	window.location = "/docusign";
}

function redirectToFailure() {
	window.location = "/reject.html";
}
function nextButton() {
	document.getElementById("nextButton").className = "hide";
	document.getElementById("welcome").className = "hide";
	document.getElementById("nextButton2").className = "btn btn-default";
	document.getElementById("upload").className = "";
	document.getElementById("fileUpload").className = "";

}


function nextButton2() {
	document.getElementById("nextButton2").className = "hide";
	document.getElementById("upload").className = "hide";
	document.getElementById("fileUpload").className = "hide";
	document.getElementById("verify").className = "";	
	document.getElementById("start").className = "btn btn-default";
	document.getElementById("stop").className = "btn btn-default";
}


