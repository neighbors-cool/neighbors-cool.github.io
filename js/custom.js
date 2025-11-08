function byId(id) {
  return document.getElementById(id);
}
// Check that service workers are supported
if ("serviceWorker" in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}
window.addEventListener("load", () => {
  let anchors = document.getElementsByTagName("a");
  if (!!anchors && !!anchors.length) {
    for (let i = 0; i < anchors.length; i++) {
      // Skip local links, fragments, and special protocols (mailto, tel, javascript)
      try {
        const a = anchors[i];
        const href = a.getAttribute('href') || '';
        const isLocal = a.classList.contains("local-link") || href.startsWith('/') || href.startsWith('#');
        const isSpecial = href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('data:') || href.startsWith('vbscript:');
        if (!isLocal && !isSpecial) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
      } catch (e) {
        // defensive: continue
      }
    }
  }
  const menuBtn = byId("menuButton");
  const menuDiv = byId("menuDiv");
  const menu = byId("menu");
  if (menuBtn) {
    menuBtn.addEventListener("click", toggleMenu);
    // keyboard: close on Escape
    menuBtn.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') toggleMenu();
    });
  }
  let dditems = document.getElementsByClassName("dropdown-item");
  for (let i = 0; i < dditems.length; i++) {
    dditems[i].addEventListener("click", toggleMenu);
  }
  if (menuDiv && menuDiv.offsetHeight > 0) {
    menuDiv.setAttribute("aria-hidden", false);
  }
  // allow Escape key to close menu when open
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && menu && menu.classList.contains('show')) {
      toggleMenu();
      if (menuBtn) menuBtn.focus();
    }
  });
});

function toggleMenu() {
  let menu = byId("menu");
  let menuButton = byId("menuButton");
  if (!menu || !menuButton) return;
  if (menu.classList.contains("show")) {
    menu.classList.remove("show");
    menu.setAttribute("aria-hidden", true);
    menuButton.setAttribute("aria-expanded", false);
  } else {
    menu.classList.add("show");
    menu.setAttribute("aria-hidden", false);
    menuButton.setAttribute("aria-expanded", true);
    // move focus into the menu for keyboard users
    menu.setAttribute('tabindex', '-1');
    menu.focus();
  }
}
