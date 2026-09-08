// Stitches For Bounces — shared site behavior
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

  /* Form submission via Formspree (fetch, so we keep our own markup/animation) */
  document.querySelectorAll("[data-formspree-form]").forEach(function (form) {
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

      fetch(form.getAttribute("data-formspree-form"), {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Formspree responded with " + response.status);
          if (status) {
            status.textContent = form.getAttribute("data-success-message") ||
              "Thanks! Your request was received. We'll be in touch shortly.";
            status.classList.remove("error");
            status.classList.add("success", "is-visible");
          }
          form.reset();
          var previews = form.querySelectorAll(".file-preview");
          previews.forEach(function (p) { p.innerHTML = ""; });
        })
        .catch(function () {
          if (status) {
            status.textContent = "Sorry, something went wrong sending your message. " +
              "Please call us at (732) 279-4336 or email info@stitchesforbounces.com directly.";
            status.classList.remove("success");
            status.classList.add("error", "is-visible");
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText;
          }
          if (status) status.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
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

  /* Keep the sticky category index pinned right under the site header,
     and offset category headings so anchor jumps land below both. */
  var categoryNav = document.querySelector("[data-category-nav]");
  if (categoryNav && siteHeader) {
    var syncCategoryNavOffset = function () {
      var headerH = siteHeader.offsetHeight;
      categoryNav.style.top = headerH + "px";
      var offset = headerH + categoryNav.offsetHeight + 16;
      document.querySelectorAll(".ba-category-heading").forEach(function (h) {
        h.style.scrollMarginTop = offset + "px";
      });
    };
    syncCategoryNavOffset();
    window.addEventListener("scroll", syncCategoryNavOffset, { passive: true });
    window.addEventListener("resize", syncCategoryNavOffset);
  }

  /* Category photo carousels (Our Work page) */
  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".carousel-slide"));
    var thumbs = Array.prototype.slice.call(carousel.querySelectorAll(".carousel-thumb"));
    if (!slides.length) return;
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === current); });
      thumbs.forEach(function (t, i) { t.classList.toggle("is-active", i === current); });
      var activeThumb = thumbs[current];
      if (activeThumb) activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        show(parseInt(thumb.getAttribute("data-carousel-goto"), 10));
      });
    });
    var prevBtn = carousel.querySelector("[data-carousel-prev]");
    var nextBtn = carousel.querySelector("[data-carousel-next]");
    if (prevBtn) prevBtn.addEventListener("click", function () { show(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { show(current + 1); });
  });
})();
