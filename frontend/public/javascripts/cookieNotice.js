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