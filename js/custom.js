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
});