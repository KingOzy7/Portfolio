/* =========================
   MOBILE NAVIGATION
   Opens and closes the navigation menu on smaller screens.
   ========================= */
const menuToggle = document.querySelector("#menu-toggle");
const navLinks = document.querySelector("#nav-links");
const navItems = document.querySelectorAll(".nav-link");

function closeMenu() {
  // Hide the mobile menu and reset its accessibility state.
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  document.body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  // Toggle the menu when the hamburger button is clicked.
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
  navLinks.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

// Close the menu after a visitor chooses a section link.
navItems.forEach((item) => item.addEventListener("click", closeMenu));

// Escape is a convenient keyboard shortcut to close the mobile menu.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

/* =========================
   TYPEWRITER-STYLE ROLE ROTATION
   Cycles through the professional titles without needing a library.
   ========================= */
const roleWord = document.querySelector("#role-word");
const roles = [
  "Web Developer",
  "Software Engineer",
  "Prompt Engineer",
  "AI Expert",
  "Video Editor"
];
let roleIndex = 0;
let characterIndex = roles[0].length;
let deleting = false;

function animateRole() {
  // If reduced motion is enabled, keep a static title instead of animating.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    roleWord.textContent = roles[0];
    return;
  }

  const currentRole = roles[roleIndex];

  if (deleting) {
    characterIndex -= 1;
    roleWord.textContent = currentRole.slice(0, characterIndex);
  } else {
    characterIndex += 1;
    roleWord.textContent = currentRole.slice(0, characterIndex);
  }

  let delay = deleting ? 45 : 85;

  if (!deleting && characterIndex >= currentRole.length) {
    deleting = true;
    delay = 1300; // Pause briefly when the whole title is visible.
  } else if (deleting && characterIndex <= 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 250;
  }

  window.setTimeout(animateRole, delay);
}

// Start after a short pause so the first title can be read.
window.setTimeout(animateRole, 900);

/* =========================
   SCROLL REVEAL ANIMATIONS
   IntersectionObserver runs an animation when an element enters the viewport.
   ========================= */
const revealElements = document.querySelectorAll(".reveal");
const skillsPanel = document.querySelector(".skills-panel");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");

        // Fill the skill bars only when their panel has been seen.
        if (entry.target === skillsPanel) {
          skillsPanel.classList.add("is-visible");
          skillsPanel.querySelectorAll(".skill-item").forEach((item) => {
            const level = item.dataset.level;
            item.querySelector(".skill-fill").style.width = `${level}%`;
          });
        }

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealElements.forEach((element) => revealObserver.observe(element));
  if (skillsPanel) revealObserver.observe(skillsPanel);
} else {
  // Fallback for older browsers: show everything and fill skill bars immediately.
  revealElements.forEach((element) => element.classList.add("is-visible"));
  if (skillsPanel) {
    skillsPanel.classList.add("is-visible");
    skillsPanel.querySelectorAll(".skill-item").forEach((item) => {
      item.querySelector(".skill-fill").style.width = `${item.dataset.level}%`;
    });
  }
}

/* =========================
   PROJECT DETAIL EXPANDERS
   The arrow opens or closes the details for one project card.
   ========================= */
const projectCards = document.querySelectorAll(".project-card");
const expandAllButton = document.querySelector("#expand-all");
const expandAllLabel = document.querySelector("#expand-all-label");

function setProjectExpanded(card, shouldExpand) {
  // Keep the hidden state and accessibility label in sync with the panel.
  const toggle = card.querySelector(".project-toggle");
  const details = card.querySelector(".project-details");
  toggle.setAttribute("aria-expanded", String(shouldExpand));
  toggle.setAttribute("aria-label", `${shouldExpand ? "Hide" : "Show"} details for ${card.querySelector("h3").textContent}`);
  details.hidden = !shouldExpand;
}

projectCards.forEach((card) => {
  const toggle = card.querySelector(".project-toggle");
  toggle.addEventListener("click", () => {
    const currentlyExpanded = toggle.getAttribute("aria-expanded") === "true";
    setProjectExpanded(card, !currentlyExpanded);
    updateExpandAllButton();
  });
});

function updateExpandAllButton() {
  // If every card is open, the main button changes to offer collapsing them.
  const allExpanded = [...projectCards].every((card) => card.querySelector(".project-toggle").getAttribute("aria-expanded") === "true");
  expandAllButton.setAttribute("aria-expanded", String(allExpanded));
  expandAllLabel.textContent = allExpanded ? "Collapse project details" : "Explore project details";
  expandAllButton.querySelector("span:first-child").textContent = allExpanded ? "▲" : "▼";
}

expandAllButton.addEventListener("click", () => {
  const allExpanded = [...projectCards].every((card) => card.querySelector(".project-toggle").getAttribute("aria-expanded") === "true");
  projectCards.forEach((card) => setProjectExpanded(card, !allExpanded));
  updateExpandAllButton();
});

/* =========================
   SUBTLE 3D PROJECT CARD TILT
   Pointer movement adjusts perspective on devices with a fine pointer.
   ========================= */
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (finePointer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  projectCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const rotateY = (x - 0.5) * 3.5;
      const rotateX = (0.5 - y) * 3.5;
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    });
  });
}

/* =========================
   ACTIVE NAVIGATION HIGHLIGHT
   The link matching the section currently in view is marked active.
   ========================= */
const pageSections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navItems.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", isCurrent);
        });
      }
    });
  }, { rootMargin: "-35% 0px -55% 0px" });

  pageSections.forEach((section) => sectionObserver.observe(section));
}

/* =========================
   WHATSAPP CONTACT FORM
   This does not send an email or message by itself. It opens WhatsApp with text filled in.
   ========================= */
const contactForm = document.querySelector("#contact-form");
const formNote = document.querySelector("#form-note");
const whatsappNumber = "2349075148466";

contactForm.addEventListener("submit", (event) => {
  // Stop the browser from trying to submit the form to a server.
  event.preventDefault();

  // Read the visitor's entries from the form fields.
  const name = document.querySelector("#name").value.trim();
  const email = document.querySelector("#email").value.trim();
  const messageText = document.querySelector("#message").value.trim();

  // A quick check ensures blank values are not included in the message.
  if (!name || !email || !messageText) {
    formNote.textContent = "Please complete all fields before continuing.";
    return;
  }

  // Build a clear message and encode it so spaces and punctuation work in a URL.
  const whatsappMessage =
    `Hello Chinagorom Festus!%0A%0A` +
    `Name: ${name}%0A` +
    `Email: ${email}%0A%0A` +
    `Message: ${messageText}`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello Chinagorom Festus!\n\nName: ${name}\nEmail: ${email}\n\nMessage: ${messageText}`
  )}`;

  // Keep the URL-encoded message in one variable for clarity; open WhatsApp in a new tab/app.
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  formNote.textContent = "WhatsApp opened with your message ready. Review it and press Send in WhatsApp.";
});

/* =========================
   FOOTER YEAR
   Automatically updates the copyright year.
   ========================= */
document.querySelector("#year").textContent = new Date().getFullYear();
