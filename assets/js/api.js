/*	LNL API - Static Site Client
	Author: Tom Nurse
	Copyright: Lens and Lights 2020
	
	License: MIT License
*/

var request;
var base = "https://lnl.wpi.edu/api/v1/";

function getNotifications(){
	document.getElementById("pageID").value = window.location.pathname;
	var dir = window.location.pathname.split('/');
	dir.pop();
	document.getElementById("dirID").value = dir.join('/');
	var $form = $('#page-id');
	var serializedData = $form.serialize();
	
	request = $.ajax({
		url: base + "notifications",
		type: "GET",
		data: serializedData,
		async: false
	});
	
	request.done(function (response, textStatus, jqXHR){
		if (jqXHR.status === 200){
			load(response);
		}else{
			processError(jqXHR);
		}
	});
}

function getOfficers(display){
	request = $.ajax({
		url: base + "officers?options=img,class_year",
		type: "GET",
		async: false
	});
	
	request.done(function (response, textStatus, jqXHR){
		if (jqXHR.status === 200){
			if (display){
				loadOfficersWith(response);
			}else{
				getOfficeHours(response);
			}
		}else{
			processError(jqXHR);
		}
	});
}

function getOfficeHours(officers){
	request = $.ajax({
		url: base + "office-hours",
		type: "GET",
		async: false
	});
	
	request.done(function (response, textStatus, jqXHR){
		if (jqXHR.status === 200){
			loadHours(officers, response);
		}else{
 			//document.getElementById("loader").style.display = "none";
			document.getElementById("hours").innerHTML = "<tr><td colspan='4'><i class='fas fa-exclamation-triangle'></i> Unable to load office hours at this time</td></tr>";
			processError(jqXHR);
		}
	});
	
	request.fail(function (xhr, options, thrownError){
		if (xhr.status == 404){
			//document.getElementById("loader").style.display = "none";
			document.getElementById("hours").innerHTML = "<tr><td colspan='4'><i class='fas fa-exclamation-triangle'></i> There are currently no office hours scheduled at this time</td></tr>";
			processError(xhr);
		}
	});
}

function load(data){
	data.sort(function (a,b) {
		var x = a['class']; var y = b['class'];
  		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
	var alertMode = 0;
	var notifMode = 0;
	for (var i = 0; i < data.length; i++){
		var mode = postNotification(data[i], alertMode, notifMode);
		if (mode === 1){
			alertMode = 1;
		}else if (mode === 2){
			notifMode = 1;
		}
	}
}

function postNotification(item, alerts, notifs){
	let pageId = document.getElementById("pageID").value;
	let title = item["title"];
	let message = item["message"];
	let format = item["format"];
	let type = item["type"];
	let classType = item["class"];
	let expires = new Date(item["expires"]);
	let id = item["id"];
	if (new Date(expires) <= new Date()){
		return 0;
	}
	if (format === "alert" && alerts === 0){
		if (type === "advisory"){
			document.getElementById("alert-header").classList.add("bg-warning");
		}else if (type === "info"){
			document.getElementById("alert-header").classList.add("bg-info");
		}
		document.getElementById("alert-title").innerHTML = title;
		document.getElementById("alert-message").innerHTML = message;
		if ((getCookie(id) === "" || pageId === "/") && classType === 2) {
			bakeCookie(id, "AutoSilenced", expires);
			$('#critical-alert').modal();
			return 1;
		} else if (classType === 1){
			$('#critical-alert').modal();
			return 1;
		} else if (getCookie(id) === "" && classType === 3){
			document.getElementById("alert-message").innerHTML = document.getElementById("alert-message").innerHTML + "<br><br><span onclick='dismiss(\"" + id + "\")' class='text-primary' style='font-size: 0.75em; cursor: pointer'><i class='far fa-times-circle'></i> Don't show this again</span>";
			$('#critical-alert').modal();
			return 1;
		}
	}else if (format === "notification" && notifs === 0){
		var style;
		if (type === "info"){
			style = "alert-info";
		}else if (type === "advisory"){
			style = "bg-warning";
		}else if (type === "warning"){
			style = "alert-danger";
		}
		if (classType === 1){
			document.getElementById("system-alert").innerHTML = "<div class='" + style + " p-2 text-center'>" + message + "</div>";
			document.getElementById("system-spacer").innerHTML = "<div class='p-2 text-center'>" + message + "</div>";
		}else if (classType === 2){
			document.getElementById("alert").innerHTML = "<div class='alert " + style + "'>" + message + "</div>";
			return 2;
		}else{
			document.getElementById("alert").innerHTML = "<div class='alert " + style + " alert-dismissible fade show' role='alert'>" + message + "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>";
			return 2;
		}
	}
	return 0;
}

function loadOfficersWith(data){
	let officers = ["President", "Interim President", "Vice President", "Interim Vice President", "Technical Director", "Interim Technical Director", "Head Projectionist", "Interim Head Projectionist", "Webmaster", "Interim Webmaster", "Treasurer", "Interim Treasurer", "Secretary", "Interim Secretary"];
	for (var i = 0; i < data.length; i++){
		let title = data[i]["title"];
		for (var j = 0; j < officers.length; j++){
			if (title == officers[j]){
				document.getElementById(title + "-name").innerHTML = data[i]["name"];
				if (data[i]["img"] != null){
					document.getElementById(title + "-img").src = data[i]["img"];
				}else{
					document.getElementById(title + "-img").src = "assets/img/officers/profile.png";
				}
				document.getElementById(title + "-year").innerHTML = "(" + data[i]["class_year"] + ")";
			}
		}
	}
	for (var k = 0; k < officers.length; k++){
		if (document.getElementById(officers[k] + "-name").innerHTML == "Not available"){
			document.getElementById(officers[k] + "-card").style.display = "none";
		}
	}
}

function loadHours(officers, hours){
	// Sort by position, then day of week
	var rows = {0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}}; // Keys correspond to position order
	for (var i = 0; i < officers.length; i++) {
		let officer = officers[i];
		let name = officer["name"];
		let title = officer["title"];
		var email = "Not available";
		var location = "Office";
		var position = 7; // Defaults to 7 (any other positions would be listed after Webmaster sorted by day of week)
		switch (title){
			case "President": case "Interim President":
				email = "lnl-p@wpi.edu";
				position = 0;
				break;
				
			case "Vice President": case "Interim Vice President":
				email = "lnl-vp@wpi.edu";
				position = 1;
				break;
				
			case "Technical Director": case "Interim Technical Director":
				email = "lnl-td@wpi.edu";
				position = 2;
				break;
				
			case "Head Projectionist": case "Interim Head Projectionist":
				email = "lnl-hp@wpi.edu";
				position = 3;
				break;
				
			case "Webmaster": case "Interim Webmaster":
				email = "lnl-w@wpi.edu";
				position = 6;
				break;
				
			case "Treasurer": case "Interim Treasurer":
				email = "lnl-t@wpi.edu";
				position = 4;
				break;
				
			case "Secretary": case "Interim Secretary":
				email = "lnl-s@wpi.edu";
				position = 5;
				break;
		}
		var times = [];
		var day = 8;
		for (var j = 0; j < hours.length; j++){
			if (hours[j]["officer"] === title){
				if (j < day){
					day = j;
				}
				let event = formatEvent(hours[j]);
				times.push(event);
				if (hours[j]["location"]) {
					location = hours[j]["location"];
				}
			}
		}
		if (times.length == 0) {
			times.push("~ Not available ~");
		}
		let output = times.join('<br>');
		if (title != "Advisor") {
			if (email != "Not available"){
				rows[position.toString()][day.toString()] = "<tr><td>" + name + "</td><td>" + title + "</td><td>" + location + "</td><td>" + output + "</td><td><a href='mailto:" + email + "'>" + email + "</a></td></tr>";
			}else{
				rows[position.toString()][day.toString()] = "<tr><td>" + name + "</td><td>" + title + "</td><td>" + location + "</td><td>" + output + "</td><td>" + email + "</td></tr>";
			}
		}
	}
	for (var k = 0; k < Object.keys(rows).length; k++){
		for (var m = 0; m < Object.keys(rows[k]).length; m++){
			let dateKey = Object.keys(rows[k])[m];
			document.getElementById("hours").innerHTML += rows[k][dateKey];
		}
	}
}

function formatEvent(event){
	var day = "";
	switch (parseInt(event["day"])){
		case 0:
			day = "Sunday";
			break;
			
		case 1:
			day = "Monday";
			break;
			
		case 2:
			day = "Tuesday";
			break;
			
		case 3:
			day = "Wednesday";
			break;
			
		case 4:
			day = "Thursday";
			break;
			
		case 5:
			day = "Friday";
			break;
			
		case 6:
			day = "Saturday";
			break;
			
		default:
			return "";
	}
	var hour_start = parseInt(event["hour_start"].split(":")[0]);
	let min_start = event["hour_start"].split(":")[1];
	var hour_end = parseInt(event["hour_end"].split(":")[0]);
	let min_end = event["hour_end"].split(":")[1];
	var pm_start = "AM";
	var pm_end = "AM";
	if (hour_start >= 12){
		pm_start = "PM";
	}
	if (hour_end >= 12){
		pm_end = "PM";
	}
	if (hour_start > 12){
		hour_start -= 12;
	}
	if (hour_end > 12){
		hour_end -= 12;
	}
	return day + " from " + hour_start + ":" + min_start + " " + pm_start + " to " + hour_end + ":" + min_end + " " + pm_end;
}

function processError(data){
	console.log("Status: " + data.status + "\n" + data.statusText);
}

function dismiss(id){
	var expire = new Date();
	expire.setTime(expire.getTime() + 1000*60*60*24*365);
	bakeCookie(id, "UserSilenced", expire);
	$('#critical-alert').modal('toggle');
}

function getCookie(cname){
	var name = cname + "=";
	var decoded = decodeURIComponent(document.cookie);
	var cookies = decoded.split(";");
	
	for (var i = 0; i < cookies.length; i++){
		var cookie = cookies[i];
		while (cookie.charAt(0) === ' '){
			cookie = cookie.substring(1);
		}
		if (cookie.indexOf(name) === 0){
			return cookie.substring(name.length, cookie.length);
		}
	}
	return "";
}

function bakeCookie(key, value, expire){
	let expires = expire.toUTCString();
	document.cookie = key + "=" + value + ";expires=" + expires + ";path=/;";
}

function getRedirects() {
	request = $.ajax({
		url: base + "sitemap",
		type: "GET",
		async: false
	});
	
	request.done(function (response, textStatus, jqXHR){
		if (jqXHR.status === 200){
			listRedirects(response);
		}else{
			processError(jqXHR);
		}
	});
}

function listRedirects(data) {
	redirects = false;
	var dynamic_row = document.getElementById('more-links');
	for (var i = 0; i < data.length; i++) {
		let category = data[i]['category'];
		if (document.getElementById(category) !== null) {
			document.getElementById(category).innerHTML += '<li><a href="' + data[i]['path'] + '">' + data[i]['title'] + '</a></li>';
		} else {
			dynamic_row.innerHTML = '<div class="col-md-3 my-2"><h3 class="h4">' + data[i]['category'] + '</h3><ul class="list-unstyled" id="' + data[i]['category'] + '"><li><a href="' + data[i]['path'] + '">' + data[i]['title'] + '</a></li></ul></div>' + dynamic_row.innerHTML;
		}
		if (category == 'Redirects') {
			redirects = true;
		}
	}
	if (redirects) {
		document.getElementById('additional-links').style.display = "block";
	}
}
