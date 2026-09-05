// Stitches For Bounces — shared site behavior (no backend; forms are simulated)
(function () {
  "use strict";

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var navList = document.querySelector(".nav-list");
  if (toggle && navList) {
    toggle.addEventListener("click", function () {
      var open = navList.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navList.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navList.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Instructor bio show more/less */
  document.querySelectorAll(".toggle-bio").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var wrap = btn.closest(".instructor-bio");
      var expanded = wrap.classList.toggle("is-expanded");
      btn.textContent = expanded ? "Show Less" : "Show More";
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  });

  /* File upload preview (quote + contact forms) — client-side only, no backend */
  document.querySelectorAll("[data-file-drop]").forEach(function (drop) {
    var input = drop.querySelector('input[type="file"]');
    var previewId = drop.getAttribute("data-preview");
    var preview = previewId ? document.getElementById(previewId) : null;
    if (!input || !preview) return;

    var files = [];

    function render() {
      preview.innerHTML = "";
      files.forEach(function (file, idx) {
        var thumb = document.createElement("div");
        thumb.className = "thumb";
        var img = document.createElement("img");
        img.alt = "Uploaded damage photo: " + file.name;
        img.src = URL.createObjectURL(file);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("aria-label", "Remove photo " + file.name);
        btn.textContent = "✕";
        btn.addEventListener("click", function () {
          files.splice(idx, 1);
          render();
        });
        thumb.appendChild(img);
        thumb.appendChild(btn);
        preview.appendChild(thumb);
      });
    }

    function addFiles(list) {
      Array.prototype.forEach.call(list, function (f) {
        if (f.type.indexOf("image/") === 0) files.push(f);
      });
      render();
    }

    drop.addEventListener("click", function (e) {
      if (e.target === input) return;
      input.click();
    });
    input.addEventListener("change", function () { addFiles(input.files); });

    ["dragenter", "dragover"].forEach(function (evt) {
      drop.addEventListener(evt, function (e) {
        e.preventDefault();
        drop.classList.add("is-dragover");
      });
    });
    ["dragleave", "drop"].forEach(function (evt) {
      drop.addEventListener(evt, function (e) {
        e.preventDefault();
        drop.classList.remove("is-dragover");
      });
    });
    drop.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  });

  /* Simulated form submission (static site — no backend/database) */
  document.querySelectorAll("[data-simulated-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var status = form.querySelector(".form-status");
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
      }
      window.setTimeout(function () {
        if (status) {
          status.textContent = form.getAttribute("data-success-message") ||
            "Thanks! Your request was received. We'll be in touch shortly.";
          status.classList.remove("error");
          status.classList.add("success", "is-visible");
        }
        form.reset();
        var previews = form.querySelectorAll(".file-preview");
        previews.forEach(function (p) { p.innerHTML = ""; });
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText;
        }
        if (status) status.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 700);
    });
  });

  /* Shrink the sticky header once the page scrolls past a threshold */
  var siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    var SCROLL_THRESHOLD = 70;
    var applyHeaderScrollState = function () {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > SCROLL_THRESHOLD);
    };
    applyHeaderScrollState();
    window.addEventListener("scroll", applyHeaderScrollState, { passive: true });
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
