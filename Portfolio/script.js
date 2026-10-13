// =========================================================
//  AUGUSTINE GYAMPRAH — PORTFOLIO SCRIPTS
// =========================================================

const root = document.documentElement;
const body = document.body;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ====== Loader ======
const loader = document.getElementById("loader");
let siteReady = false;

function revealSite() {
  if (siteReady) return;
  siteReady = true;
  loader?.classList.add("done");
  body.classList.remove("loading");
  body.classList.add("ready");
  startTypewriter();
}

if (reducedMotion) {
  revealSite();
} else {
  body.classList.add("loading");
  const minTime = new Promise((resolve) => setTimeout(resolve, 1400));
  const pageLoaded = new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", resolve, { once: true });
  });
  Promise.all([minTime, pageLoaded]).then(revealSite);
  // never keep visitors waiting on a slow asset
  setTimeout(revealSite, 3500);
}

// ====== Typewriter title rotation ======
const titles = [
  "Software Engineer",
  "Web Developer",
  "Full-Stack Engineer"
];

const dynamicTitle = document.getElementById("dynamic-title");
let typewriterStarted = false;

function startTypewriter() {
  if (typewriterStarted || !dynamicTitle) return;
  typewriterStarted = true;

  if (reducedMotion) {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % titles.length;
      dynamicTitle.textContent = titles[i];
    }, 3500);
    return;
  }

  let index = titles.indexOf(dynamicTitle.textContent.trim());
  let text = dynamicTitle.textContent;
  let deleting = true;

  function tick() {
    const target = titles[index];
    if (deleting) {
      text = text.slice(0, -1);
      dynamicTitle.textContent = text;
      if (text.length === 0) {
        deleting = false;
        index = (index + 1) % titles.length;
        return setTimeout(tick, 350);
      }
      return setTimeout(tick, 40);
    }
    text = target.slice(0, text.length + 1);
    dynamicTitle.textContent = text;
    if (text === target) {
      deleting = true;
      return setTimeout(tick, 2400);
    }
    setTimeout(tick, 70 + Math.random() * 60);
  }

  setTimeout(tick, 2200);
}

// ====== Theme toggle (with circular reveal) ======
const toggleBtn = document.getElementById("mode-toggle");
const themeIcon = document.getElementById("theme-icon");

function setThemeIcon(isDark) {
  if (isDark) {
    // Moon icon
    themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 0111.21 3 7 7 0 0021 12.79z"></path>`;
  } else {
    // Sun icon
    themeIcon.innerHTML = `
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;
  }
  themeIcon.classList.remove("spin");
  void themeIcon.offsetWidth; // restart animation
  themeIcon.classList.add("spin");
}

setThemeIcon(root.classList.contains("dark-mode"));

function applyTheme() {
  const dark = root.classList.toggle("dark-mode");
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch (e) {}
  setThemeIcon(dark);
  refreshParticleColor();
}

toggleBtn.addEventListener("click", (e) => {
  if (!document.startViewTransition || reducedMotion) {
    applyTheme();
    return;
  }

  const rect = toggleBtn.getBoundingClientRect();
  const x = e.clientX || rect.left + rect.width / 2;
  const y = e.clientY || rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const transition = document.startViewTransition(applyTheme);
  transition.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 750, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" }
    );
  });
});

// ====== Custom cursor (smooth follow) ======
const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

if (finePointer && cursorDot && cursorOutline) {
  body.classList.add("has-cursor");

  let mouseX = -100;
  let mouseY = -100;
  let outlineX = mouseX;
  let outlineY = mouseY;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    body.classList.add("cursor-visible");
  });

  document.addEventListener("mouseleave", () => body.classList.remove("cursor-visible"));

  (function followCursor() {
    outlineX += (mouseX - outlineX) * 0.18;
    outlineY += (mouseY - outlineY) * 0.18;
    cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
    requestAnimationFrame(followCursor);
  })();

  // grow cursor on interactive elements
  const interactiveSelectors = "a, button, .skill-tag, .project-card, .about-photo";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactiveSelectors)) body.classList.add("cursor-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(interactiveSelectors) && !e.relatedTarget?.closest?.(interactiveSelectors)) {
      body.classList.remove("cursor-hover");
    }
  });

  window.addEventListener("mousedown", () => body.classList.add("cursor-click"));
  window.addEventListener("mouseup", () => setTimeout(() => body.classList.remove("cursor-click"), 150));
}

// ====== Nav indicator (hover + click + scroll) ======
const nav = document.getElementById("top-nav");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const indicator = document.getElementById("nav-indicator");
const menuBtn = document.getElementById("menu-btn");

function moveIndicator(el) {
  if (!el) return;
  indicator.style.left = el.offsetLeft + "px";
  indicator.style.width = el.offsetWidth + "px";
  indicator.style.opacity = 1;
  navLinks.forEach((l) => l.classList.toggle("lit", l === el));
}

function setActive(link) {
  navLinks.forEach((l) => l.classList.toggle("active", l === link));
  moveIndicator(link);
}

function closeMenu() {
  body.classList.remove("nav-open");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-label", "Open menu");
}

menuBtn.addEventListener("click", () => {
  const open = body.classList.toggle("nav-open");
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

navLinks.forEach((link) => {
  link.addEventListener("mouseenter", () => moveIndicator(link));
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }
    setActive(link);
    closeMenu();
  });
});

nav.addEventListener("mouseleave", () => moveIndicator(document.querySelector(".nav-link.active")));
window.addEventListener("resize", () => moveIndicator(document.querySelector(".nav-link.active")));
document.fonts?.ready.then(() => moveIndicator(document.querySelector(".nav-link.active")));
moveIndicator(navLinks[0]);

// ====== Scroll effects: top bar, progress bar, scroll spy, timeline ======
const topbar = document.getElementById("topbar");
const progressBar = document.getElementById("scroll-progress");
const timeline = document.getElementById("timeline");
const timelineProgress = document.getElementById("timeline-progress");
const spySections = navLinks
  .map((l) => document.querySelector(l.getAttribute("href")))
  .filter(Boolean);

const parallaxSections = document.querySelectorAll(".section[data-bg]");
let scrollTicking = false;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;

  topbar.classList.toggle("scrolled", y > 20);
  progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

  // scroll spy
  let current = spySections[0];
  spySections.forEach((sec) => {
    if (sec.getBoundingClientRect().top <= innerHeight * 0.4) current = sec;
  });
  if (innerHeight + y >= document.documentElement.scrollHeight - 4) current = spySections[spySections.length - 1];
  const link = navLinks.find((l) => l.getAttribute("href") === "#" + current.id);
  if (link && !link.classList.contains("active")) setActive(link);

  // timeline fill
  if (timeline && timelineProgress) {
    const rect = timeline.getBoundingClientRect();
    const progress = (innerHeight * 0.6 - rect.top) / rect.height;
    timelineProgress.style.transform = `scaleY(${Math.min(1, Math.max(0, progress))})`;
  }

  // giant background words drift slower than the page
  if (!reducedMotion) {
    parallaxSections.forEach((sec) => {
      const top = sec.getBoundingClientRect().top;
      if (top < innerHeight && top > -sec.offsetHeight) {
        sec.style.setProperty("--parallax", `${top * -0.18}px`);
      }
    });
  }

  scrollTicking = false;
}

window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    requestAnimationFrame(onScroll);
    scrollTicking = true;
  }
}, { passive: true });
onScroll();

// ====== Split section titles into words ======
document.querySelectorAll(".split-words").forEach((title) => {
  const words = title.textContent.trim().split(/\s+/);
  title.setAttribute("aria-label", title.textContent.trim());
  title.innerHTML = words
    .map((w, i) => `<span class="word" aria-hidden="true"><span style="--w:${i}">${w.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span></span>`)
    .join(" ");
});

// stagger index for skill tags
document.querySelectorAll(".skill-category").forEach((cat) => {
  cat.querySelectorAll(".skill-tag").forEach((tag, i) => tag.style.setProperty("--t", i));
});

// ====== Scroll reveal ======
const revealTargets = document.querySelectorAll(".reveal, .timeline-item, .split-words");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("show");
      // after the entrance finishes, let hover/tilt respond instantly
      setTimeout(() => el.classList.add("done"), 1400);
      observer.unobserve(el);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

revealTargets.forEach((el) => observer.observe(el));

// ====== Interactive skill filter ======
const filterWrap = document.getElementById("skill-filters");
const filterIndicator = document.getElementById("filter-indicator");
const filterButtons = document.querySelectorAll(".btn-filter");
const skillCategories = document.querySelectorAll(".skill-category");

function moveFilterIndicator(btn) {
  if (!btn || !filterIndicator) return;
  filterIndicator.style.left = btn.offsetLeft + "px";
  filterIndicator.style.top = btn.offsetTop + "px";
  filterIndicator.style.width = btn.offsetWidth + "px";
  filterIndicator.style.height = btn.offsetHeight + "px";
}

function filterSkills(category) {
  filterButtons.forEach((btn) => btn.classList.remove("active-filter"));
  const activeBtn = document.querySelector(`.btn-filter[data-category="${category}"]`);
  activeBtn.classList.add("active-filter");
  moveFilterIndicator(activeBtn);

  skillCategories.forEach((cat) => {
    const match = category === "all" || cat.getAttribute("data-category") === category;
    cat.classList.toggle("hidden", !match);
    cat.classList.remove("pop");
    if (match) {
      void cat.offsetWidth; // restart animation
      cat.classList.add("pop", "show");
    }
  });
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => filterSkills(btn.getAttribute("data-category")));
});

moveFilterIndicator(document.querySelector(".btn-filter.active-filter"));
window.addEventListener("resize", () => moveFilterIndicator(document.querySelector(".btn-filter.active-filter")));
document.fonts?.ready.then(() => moveFilterIndicator(document.querySelector(".btn-filter.active-filter")));

// ====== Spotlight hover (cards glow where the mouse is) ======
document.querySelectorAll(".spotlight").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

// ====== 3D tilt (project cards + about photo) ======
if (finePointer && !reducedMotion) {
  document.querySelectorAll(".tilt").forEach((card) => {
    const isProject = card.classList.contains("project-card");
    const strength = isProject ? 6 : 10;
    const glareTarget = isProject ? card.querySelector(".project-head") : card;

    card.addEventListener("pointermove", (e) => {
      if (!card.classList.contains("done")) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transform =
        `rotateX(${(0.5 - py) * strength}deg) rotateY(${(px - 0.5) * strength}deg) translateY(-6px)`;

      const gr = glareTarget.getBoundingClientRect();
      glareTarget.style.setProperty("--gx", `${((e.clientX - gr.left) / gr.width) * 100}%`);
      glareTarget.style.setProperty("--gy", `${((e.clientY - gr.top) / gr.height) * 100}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

// ====== Magnetic buttons ======
if (finePointer && !reducedMotion) {
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.35}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

// ====== Particle constellation background ======
const canvas = document.getElementById("bg-canvas");
const ctx = canvas?.getContext("2d");
let particleRGB = "40, 38, 50";
let accentRGB = "16, 90, 228";
let particles = [];
const pointer = { x: -9999, y: -9999 };

function refreshParticleColor() {
  particleRGB = getComputedStyle(root).getPropertyValue("--particle").trim() || particleRGB;
  accentRGB = root.classList.contains("dark-mode") ? "79, 140, 255" : "16, 90, 228";
  if (reducedMotion) drawParticles();
}

function initParticles() {
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.min(70, Math.floor((innerWidth * innerHeight) / 20000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.6,
  }));
}

function drawParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const linkDist = 130;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    // gentle push away from the mouse
    const dxm = p.x - pointer.x;
    const dym = p.y - pointer.y;
    const dm = Math.hypot(dxm, dym);
    if (dm < 160 && dm > 0) {
      p.x += (dxm / dm) * 0.8;
      p.y += (dym / dm) * 0.8;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${particleRGB}, 0.35)`;
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < linkDist) {
        ctx.strokeStyle = `rgba(${particleRGB}, ${0.08 * (1 - d / linkDist)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }

    if (dm < 200) {
      ctx.strokeStyle = `rgba(${accentRGB}, ${0.45 * (1 - dm / 200)})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(pointer.x, pointer.y);
      ctx.stroke();
    }
  }
}

function stepParticles() {
  if (!document.hidden) {
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = innerWidth + 10;
      if (p.x > innerWidth + 10) p.x = -10;
      if (p.y < -10) p.y = innerHeight + 10;
      if (p.y > innerHeight + 10) p.y = -10;
    });
    drawParticles();
  }
  requestAnimationFrame(stepParticles);
}

if (ctx) {
  refreshParticleColor();
  initParticles();
  if (reducedMotion) {
    drawParticles();
  } else {
    requestAnimationFrame(stepParticles);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      initParticles();
      if (reducedMotion) drawParticles();
    }, 200);
  });

  window.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  }, { passive: true });
  document.addEventListener("mouseleave", () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });
}

// ====== Background glow follows the mouse ======
const bgGlow = document.getElementById("bg-glow");

if (bgGlow && finePointer && !reducedMotion) {
  let gx = 70, gy = 25, tx = 70, ty = 25;
  window.addEventListener("pointermove", (e) => {
    tx = (e.clientX / innerWidth) * 100;
    ty = (e.clientY / innerHeight) * 100;
  }, { passive: true });

  (function moveGlow() {
    gx += (tx - gx) * 0.05;
    gy += (ty - gy) * 0.05;
    bgGlow.style.setProperty("--cx", `${gx}%`);
    bgGlow.style.setProperty("--cy", `${gy}%`);
    requestAnimationFrame(moveGlow);
  })();
}

// ====== Logo letter scramble on hover ======
const logoText = document.querySelector(".logo-text");

if (logoText && !reducedMotion) {
  const finalText = logoText.dataset.text;
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=<>/";
  let scrambleTimer;

  logoText.closest("a").addEventListener("mouseenter", () => {
    let frame = 0;
    clearInterval(scrambleTimer);
    scrambleTimer = setInterval(() => {
      logoText.textContent = finalText
        .split("")
        .map((ch, i) => (i < frame / 2 ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]))
        .join("");
      frame++;
      if (frame / 2 > finalText.length) {
        clearInterval(scrambleTimer);
        logoText.textContent = finalText;
      }
    }, 35);
  });
}

// ====== Footer name lights up under the mouse ======
const footerBig = document.getElementById("footer-big");

if (footerBig) {
  footerBig.addEventListener("pointermove", (e) => {
    const r = footerBig.getBoundingClientRect();
    footerBig.style.setProperty("--mx", `${e.clientX - r.left}px`);
    footerBig.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
  footerBig.addEventListener("pointerleave", () => {
    footerBig.style.setProperty("--mx", "-20%");
  });
}

// ===== Contact Form Submission – mailto version (form is currently commented out in HTML) =====
const contactForm = document.getElementById("contact-form");
const formMessage = document.getElementById("form-message");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = contactForm.querySelector('[name="name"]').value.trim();
    const email = contactForm.querySelector('[name="email"]').value.trim();
    const subject = contactForm.querySelector('[name="subject"]').value.trim();
    const message = contactForm.querySelector('[name="message"]').value.trim();

    const toEmail = "gyamprahaugustine07@gmail.com";
    const mailSubject = subject || "Portfolio Contact";
    const mailBody = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    if (formMessage) {
      formMessage.style.display = "block";
      formMessage.textContent = "Opening your email app...";
    }

    window.location.href =
      `mailto:${toEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
  });
}
