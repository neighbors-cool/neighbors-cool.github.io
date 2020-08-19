$(document).ready(function() {
  $("a:not(.local-link)").attr("target", "_blank").attr("rel", "noopener noreferrer");
});
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("../sw.js").then(() => {
      console.log("Service Worker Registered");
    });
  });
}