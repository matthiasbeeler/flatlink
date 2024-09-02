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



