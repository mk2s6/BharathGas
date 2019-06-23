$(function () {
   
    let x = $("#ui_latitude");
let y = $("#ui_longitude");

$('#geo_loc').on('click', function (e) {
    e.preventDefault();
    getLocation();
});

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else { 
    alert("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  x.val( position.coords.latitude);
	y.val(position.coords.longitude);
  
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      x.innerHTML = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML = "An unknown error occurred."
      break;
  }
}

});