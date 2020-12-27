//CONTAINS THE JAVASCRIPT THAT CALCULATES THE CURRENT CLOCK TIME, DETERMINES IF THIS IS MORE THAN TIME LIMIT

var tabOpen = true; //Boolean for whether a youtube tab is opened and visible
var currentTime = 0; //Time that is displayed on clock
var lockedTimeLimit = 2; //Time Limit, is reset every night

//Following variables are used to calculate current youtube time
var totalYoutubeTime;
var startTimeYoutube;

//Only updates timer if youtube is indeed open (since according to manifest, content scripts only run on urls containing youtube.com). 
//REMEMBER, THIS IS NOT THE TIMER SCRIPT, it's only the visualization. The timer is located in backgroud.js

//CHECK TABOPEN SO SCRIPT DOESN'T RUN ON ALL YOUTUBE TABS ----------------------------------

//Make sure tab is open and also is a youtube tab, this makes current time not update if tab isn't youtube
document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === 'visible' && window.location.href.includes("www.youtube.com")) { //set tabopen to true if tab is visible
    tabOpen = true;
	//console.log("Tab opened");
  } else {
    tabOpen = false;
	//console.log("Tab closed");
  }
});

//Set tabopen initially if visibility hasn't been changed
if(window.location.href.includes("www.youtube.com")){
	tabOpen = true;
}else{
	tabOpen = false;
}

//Communication with background
chrome.runtime.onMessage.addListener(
	function(request, sender) {
		if(request.message == "sendTimes"){ //Sends the interval start time and total time
			console.log("From background: " + request.startTime + ", " + request.totalTime);
			startTimeYoutube = request.startTime;
			totalYoutubeTime = request.totalTime;
			lockedTimeLimit = request.timeLimit;
			console.log(lockedTimeLimit);
			calculateTime();
		}else if(request.message == "setClockOnNonYoutubePage"){ //Sends a quick command to set clocks on sites that aren't youtube
			currentTime = request.totalTime;
			chrome.storage.local.set({"currentTime": currentTime}, function() {}); //Save current time to local storage
		}
	}
);

//CALCULATE CURRENT TIME --------------------------------------------------------------

//Calculates timer to display
function calculateTime(){
	if(tabOpen){ //If youtube is indeed open
		var timeNow = (new Date)/1000; //Get time now
		currentTime = timeNow - new Date(startTimeYoutube)/1000 + totalYoutubeTime; //Calculate current time spent on youtube
		chrome.storage.local.set({"currentTime": currentTime}, function() {}); //Save current time to local storage
		checkLimit();
	}
}

//CHECK TIME LIMIT FUNCTION --------------------------------------------------------------------
//Background.js doesn't actually contain the current time, thus, this script also has to determine if you've passed the time limit

function checkLimit(){
	if(currentTime > lockedTimeLimit*5){
		console.log("Over limit");
	}
}

//Runs the calculate time function once a second
calculateTime();
clearInterval(moreClock);
var moreClock = setInterval(function(){
	calculateTime();
}, 1000);

//OLD CALCULATE TIME FUNCTION
/*var totalYoutubeTime = 0;
var timeNow = (new Date)/1000;
chrome.storage.local.get(['totalTime'], function(result) {
	totalYoutubeTime = result.totalTime; //Get the total time on youtube - current session (cause the interval isn't added until you click on other tab)
});
chrome.storage.local.get(['startTime'], function(result) {
	currentTime = timeNow - new Date(result.startTime)/1000 + totalYoutubeTime; //timeNow-new Date calculate current session, add total time to that
});
chrome.storage.local.set({"currentTime": currentTime}, function() {}); //save the current time to localstorage
*/