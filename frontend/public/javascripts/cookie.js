function getCookie(cookieName) {
  var name = cookieName + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name) == 0) {
      return c.substr(name.length);
    }
  }
  return null;
}
function setCookie(cname, cvalue) {
  const d = new Date();
  d.setTime(d.getTime() + 9999 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


if (!localStorage.getItem('cookieNoticeAccepted')) {
  // If the notice has not been accepted, display it
  document.querySelector('.cookieNoticeBackground').style.display = 'flex';
}

// Add an event listener to the cookie notice to handle the user accepting it
document.querySelector('.dismiss-cookie-notice').addEventListener('click', function() {
  // Set the 'cookieNoticeAccepted' item in local storage
  localStorage.setItem('cookieNoticeAccepted', true);
  // Hide the cookie notice
  document.querySelector('.cookieNoticeBackground').style.display = 'none';
});
