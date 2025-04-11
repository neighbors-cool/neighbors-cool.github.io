function byId(id) {
  return document.getElementById(id);
}
// Check that service workers are supported
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
window.addEventListener('load', () => {
  var anchors = document.getElementsByTagName('a');
  if (!!anchors && !!anchors.length) {
    for (let i = 0; i < anchors.length; i++) {
      if (!anchors[i].classList.contains('local-link')) {
        anchors[i].target = '_blank';
        anchors[i].rel = 'noopener noreferrer';
      }
    }
  }
  byId('menuButton').addEventListener('click', toggleMenu);
  var dditems = document.getElementsByClassName('dropdown-item');
  for (let i = 0; i < dditems.length; i++) {
    dditems[i].addEventListener('click', toggleMenu);
  }
  if (byId('menuDiv').offsetHeight > 0) {
    byId('menuDiv').setAttribute('aria-hidden', false);
  }
});

function toggleMenu() {
  var menu = byId('menu');
  if (menu.classList.contains('show')) {
    menu.classList.remove('show');
    menu.setAttribute('aria-hidden', true);
    byId('menuButton').setAttribute('aria-expanded', false);
  } else {
    menu.classList.add('show');
    menu.setAttribute('aria-hidden', false);
    byId('menuButton').setAttribute('aria-expanded', true);
  }
}
