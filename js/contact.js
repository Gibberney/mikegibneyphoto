/* ==========================================================================
   contact.js — sends the contact form without a server.
   Default backend: FormSubmit (https://formsubmit.co) — free, no signup.
   The first submission triggers a one-time activation email to the address
   below; click that link once and future messages land in the inbox.
   Swap FORM_ENDPOINT for Formspree/Web3Forms if you ever prefer.
   ========================================================================== */
(function () {
  var RECIPIENT = "michaeldgibney@gmail.com";
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + RECIPIENT;

  var form = document.getElementById("contact-form");
  if (!form) return;
  var statusEl = document.getElementById("form-status");
  var btn = document.getElementById("submit-btn");

  function setStatus(msg, ok) {
    statusEl.textContent = msg;
    statusEl.className = "form-status" + (ok ? " ok" : "");
  }

  function mailtoFallback(d) {
    var body =
      "Name: " + d.name + "\nEmail: " + d.email +
      "\nInterest: " + d.photo + "\n\n" + d.message;
    return "mailto:" + RECIPIENT +
      "?subject=" + encodeURIComponent("Website inquiry") +
      "&body=" + encodeURIComponent(body);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form._honey && form._honey.value) return; // bot

    var d = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      photo: form.photo.value.trim(),
      message: form.message.value.trim(),
      _subject: "New message from photo.mikegibney.net",
      _template: "table",
    };
    if (!d.name || !d.email) { setStatus("Please add your name and email so I can reply.", false); return; }

    btn.disabled = true;
    setStatus("Sending…", false);

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(d),
    })
      .then(function (r) { return r.ok ? r.json().catch(function(){return{};}) : Promise.reject(); })
      .then(function () { form.reset(); setStatus("Thanks — your message is on its way. I'll be in touch soon.", true); })
      .catch(function () {
        statusEl.className = "form-status";
        statusEl.innerHTML = 'Couldn\'t send just now. <a style="color:#d8d4cc;text-decoration:underline" href="' +
          mailtoFallback(d) + '">Email it instead.</a>';
      })
      .finally(function () { btn.disabled = false; });
  });
})();
