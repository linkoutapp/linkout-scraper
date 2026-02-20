(function () {
  var script = document.currentScript;
  var projectSlug = script.getAttribute("data-project");
  var apiBase = script.src.replace("/embed.js", "");

  if (!projectSlug) {
    console.error("Waitlist embed: missing data-project attribute");
    return;
  }

  // Create container
  var container = document.createElement("div");
  container.id = "waitlist-embed-" + projectSlug;
  script.parentNode.insertBefore(container, script.nextSibling);

  // Styles
  var style = document.createElement("style");
  style.textContent =
    "#" + container.id + " {" +
    "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;" +
    "  max-width: 400px;" +
    "}" +
    "#" + container.id + " form {" +
    "  display: flex;" +
    "  gap: 8px;" +
    "}" +
    "#" + container.id + " input {" +
    "  flex: 1;" +
    "  padding: 10px 14px;" +
    "  font-size: 14px;" +
    "  border: 1px solid #d1d5db;" +
    "  border-radius: 6px;" +
    "  outline: none;" +
    "  transition: border-color 0.15s;" +
    "}" +
    "#" + container.id + " input:focus {" +
    "  border-color: #3b82f6;" +
    "  box-shadow: 0 0 0 2px rgba(59,130,246,0.15);" +
    "}" +
    "#" + container.id + " button {" +
    "  padding: 10px 20px;" +
    "  font-size: 14px;" +
    "  font-weight: 500;" +
    "  color: #fff;" +
    "  background: #111827;" +
    "  border: none;" +
    "  border-radius: 6px;" +
    "  cursor: pointer;" +
    "  white-space: nowrap;" +
    "  transition: background 0.15s;" +
    "}" +
    "#" + container.id + " button:hover {" +
    "  background: #1f2937;" +
    "}" +
    "#" + container.id + " button:disabled {" +
    "  opacity: 0.6;" +
    "  cursor: not-allowed;" +
    "}" +
    "#" + container.id + " .wl-msg {" +
    "  margin-top: 8px;" +
    "  font-size: 13px;" +
    "  padding: 8px 12px;" +
    "  border-radius: 6px;" +
    "}" +
    "#" + container.id + " .wl-success {" +
    "  color: #065f46;" +
    "  background: #d1fae5;" +
    "}" +
    "#" + container.id + " .wl-error {" +
    "  color: #991b1b;" +
    "  background: #fee2e2;" +
    "}";
  document.head.appendChild(style);

  // Build form
  container.innerHTML =
    '<form>' +
    '  <input type="email" placeholder="Enter your email" required />' +
    '  <button type="submit">Join Waitlist</button>' +
    '</form>';

  var form = container.querySelector("form");
  var input = container.querySelector("input");
  var btn = container.querySelector("button");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = input.value.trim();
    if (!email) return;

    btn.disabled = true;
    btn.textContent = "Joining...";

    // Remove old message
    var oldMsg = container.querySelector(".wl-msg");
    if (oldMsg) oldMsg.remove();

    fetch(apiBase + "/api/v1/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, projectSlug: projectSlug }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var msg = document.createElement("div");
        msg.className = "wl-msg wl-success";

        if (data.error) {
          msg.className = "wl-msg wl-error";
          msg.textContent = data.error;
        } else {
          msg.textContent = data.message + " You are #" + data.position + " on the list.";
          input.value = "";
        }

        container.appendChild(msg);
        btn.disabled = false;
        btn.textContent = "Join Waitlist";
      })
      .catch(function () {
        var msg = document.createElement("div");
        msg.className = "wl-msg wl-error";
        msg.textContent = "Something went wrong. Please try again.";
        container.appendChild(msg);
        btn.disabled = false;
        btn.textContent = "Join Waitlist";
      });
  });
})();
