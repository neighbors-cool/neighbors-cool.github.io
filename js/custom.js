// Check that service workers are supported
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
document.addEventListener("DOMContentLoaded", function(event) {
  var anchors = document.getElementsByTagName('a');
  if(!!anchors && !!anchors.length) {
    for(var i = 0; i < anchors.length; i++) {
      if(!anchors[i].classList.contains('local-link')) {
        anchors[i].target = '_blank';
        anchors[i].rel = 'noopener noreferrer';
      }
    }
  }
  document.getElementById('btn-menu').addEventListener('click', toggleMenu);
  var dditems = document.getElementsByClassName('dropdown-item');
  for(var i = 0; i < dditems.length; i++) {
    dditems[i].addEventListener('click', toggleMenu);
  }
  if(document.getElementById('menu').parentElement.offsetHeight > 0) {
    menu.parentElement.setAttribute('aria-hidden', false);
  }
});

function toggleMenu() {
  var menu = document.getElementById('menu');
  if(menu.classList.contains('show')) {
    menu.classList.remove('show');
    menu.setAttribute('aria-hidden', true);
    document.getElementById('btn-menu').setAttribute('aria-expanded', false);
  } else {
    menu.classList.add('show');
    menu.setAttribute('aria-hidden', false);
    document.getElementById('btn-menu').setAttribute('aria-expanded', true);
  }
}
