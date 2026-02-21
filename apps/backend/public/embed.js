(function () {
  var script = document.currentScript;
  var projectSlug = script.getAttribute("data-project");
  var apiBase = script.src.replace("/embed.js", "");

  if (!projectSlug) {
    console.error("Waitlist embed: missing data-project attribute");
    return;
  }

  var iframe = document.createElement("iframe");
  iframe.src = apiBase + "/waitlist/" + projectSlug + "?embed=true";
  iframe.style.cssText = "width:100%;border:none;max-width:400px;min-height:360px;";
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("title", "Waitlist Signup");

  script.parentNode.insertBefore(iframe, script.nextSibling);

  // Auto-resize iframe to fit content
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "w8list-resize" && e.data.slug === projectSlug) {
      iframe.style.height = e.data.height + "px";
    }
  });
})();
