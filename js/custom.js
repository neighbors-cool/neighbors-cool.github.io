document.addEventListener("DOMContentLoaded", function(event) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("../sw.js");
  }
  var anchors = document.getElementsByTagName('a');
  if(!!anchors && !!anchors.length) {
    for(var i = 0; i < anchors.length; i++) {
      if(!anchors[i].classList.contains('local-link')) {
        anchors[i].target = '_blank';
        anchors[i].rel = 'noopener noreferrer';
      }
    }
  }
  document.getElementById('dropdown-toggle').addEventListener('click', function(event) { event.preventDefault();event.stopPropagation();toggleMenu(true); });
  document.getElementsByTagName('body')[0].addEventListener('click', function(event) { event.preventDefault();event.stopPropagation();toggleMenu(false); });
});

function toggleMenu(btnClick) {
  var menu = document.getElementById('menu');
  if(btnClick && menu.classList.contains('hide')) {
    menu.classList.remove('hide');
  } else if(!menu.classList.contains('hide')) {
    menu.classList.add('hide');
  }
}
