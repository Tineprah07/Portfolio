// ====== Dynamic title rotation ======
const titles = [
  "Web Developer",
  "Software Developer",
  "Full-Stack Engineer"
];

const dynamicTitle = document.getElementById("dynamic-title");
let current = 0;

function changeTitle() {
  // fade out
  dynamicTitle.classList.remove("fade-in");
  dynamicTitle.classList.add("fade-out");

  setTimeout(() => {
    current = (current + 1) % titles.length;
    dynamicTitle.textContent = titles[current];
    // fade in
    dynamicTitle.classList.remove("fade-out");
    dynamicTitle.classList.add("fade-in");
  }, 350); // match CSS transition
}


// start rotation
setInterval(changeTitle, 3500);

// Theme toggle setup
const toggleBtn = document.getElementById("mode-toggle");
const themeIcon = document.getElementById("theme-icon");

// Function to set icon based on mode
function setThemeIcon(isDark) {
  if (isDark) {
    // Moon icon
    themeIcon.innerHTML = `
      <path d="M21 12.79A9 9 0 0111.21 3 7 7 0 0021 12.79z"></path>
    `;
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
}

// Check if user had dark mode saved before
const isDark = localStorage.getItem("theme") === "dark";
if (isDark) document.body.classList.add("dark-mode");
setThemeIcon(isDark);

// Toggle logic
toggleBtn.addEventListener("click", () => {
  const darkModeEnabled = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", darkModeEnabled ? "dark" : "light");
  setThemeIcon(darkModeEnabled);
});

// ===== Custom Cursor =====
const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

let mouseX = 0;
let mouseY = 0;

// move instantly for dot, smoothly for outline
window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  cursorDot.style.top = mouseY + "px";
  cursorDot.style.left = mouseX + "px";

  // smooth follow for outline
  cursorOutline.animate(
    {
      top: mouseY + "px",
      left: mouseX + "px",
    },
    {
      duration: 120,
      fill: "forwards",
    }
  );
});

// grow cursor on interactive elements
const interactiveSelectors = "a, button, .social-icon, .nav-pill a, .btn-primary, .btn-secondary, .skill-tag"; // Added .skill-tag

document.querySelectorAll(interactiveSelectors).forEach((el) => {
  el.addEventListener("mouseenter", () => {
    document.body.classList.add("cursor-hover");
  });
  el.addEventListener("mouseleave", () => {
    document.body.classList.remove("cursor-hover");
  });
});

// click pulse
window.addEventListener("mousedown", () => {
  document.body.classList.add("cursor-click");
});
window.addEventListener("mouseup", () => {
  setTimeout(() => {
    document.body.classList.remove("cursor-click");
  }, 150);
});

// ===== Nav indicator (hover + click) =====
const nav = document.getElementById("top-nav");
const navLinks = document.querySelectorAll(".nav-link");
const indicator = document.getElementById("nav-indicator");

function moveIndicator(el) {
  const linkRect = el.getBoundingClientRect();
  const navRect = nav.getBoundingClientRect();

  const linkCenter = linkRect.left - navRect.left + linkRect.width / 2;
  const barWidth = linkRect.width * 0.4; // shorter bar

  indicator.style.left = linkCenter - barWidth / 2 + "px";
  indicator.style.width = barWidth + "px";
  indicator.style.opacity = 1;
}

// set default position on load
if (navLinks.length > 0) moveIndicator(navLinks[0]);

navLinks.forEach((link) => {
  // hover — temporary move
  link.addEventListener("mouseenter", () => {
    moveIndicator(link);
  });

  // click — set as active
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }

    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    moveIndicator(link);
  });
});

// on mouseleave of nav, go back to active link
nav.addEventListener("mouseleave", () => {
  const active = document.querySelector(".nav-link.active");
  if (active) moveIndicator(active);
});

// resize safety
window.addEventListener("resize", () => {
  const active = document.querySelector(".nav-link.active");
  if (active) moveIndicator(active);
});


// ===== Scroll reveal for sections and timeline items =====
const revealSections = document.querySelectorAll(".reveal, .timeline-item"); // Added .timeline-item

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        // once shown, we can unobserve to avoid re-animating
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealSections.forEach((sec) => observer.observe(sec));

// ===== Highlight nav on scroll (keeps the indicator updated) =====
const sections = document.querySelectorAll("section[id]");
const navLinksArr = Array.from(document.querySelectorAll(".nav-link"));

window.addEventListener("scroll", () => {
  const scrollY = window.pageYOffset;

  sections.forEach((sec) => {
    const secHeight = sec.offsetHeight;
    const secTop = sec.offsetTop - 120; // offset for topbar
    const secId = sec.getAttribute("id");

    if (scrollY > secTop && scrollY <= secTop + secHeight) {
      navLinksArr.forEach((link) => link.classList.remove("active"));
      const currentLink = document.querySelector(`.nav-link[href="#${secId}"]`);
      if (currentLink) {
        currentLink.classList.add("active");
        moveIndicator(currentLink); // reuse existing function
      }
    }
  });
});

// interactive skill tags (only cursor functionality, visual effect is CSS)
const skillTags = document.querySelectorAll(".skill-tag");

skillTags.forEach((tag) => {
  tag.addEventListener("mouseenter", () => {
    tag.classList.add("active-skill");
  });
  tag.addEventListener("mouseleave", () => {
    tag.classList.remove("active-skill");
  });
});


// ===== Interactive Skill Filter =====
const filterButtons = document.querySelectorAll(".btn-filter");
const skillCategories = document.querySelectorAll(".skill-category");

function filterSkills(category) {
  // 1. Update active button state
  filterButtons.forEach(btn => btn.classList.remove("active-filter"));
  document.querySelector(`.btn-filter[data-category="${category}"]`).classList.add("active-filter");

  // 2. Filter categories
  skillCategories.forEach(cat => {
    const catId = cat.getAttribute("data-category");

    // Hide or show based on category match
    if (category === "all" || catId === category) {
      cat.classList.remove("hidden");
    } else {
      cat.classList.add("hidden");
    }
  });
}

// Add click listeners to filter buttons
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.getAttribute("data-category");
    filterSkills(category);
  });
});


// ===== Contact Form Submission & Feedback (Updated message) =====
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Show loading state
    formMessage.style.display = 'block';
    formMessage.style.color = '#105be4';
    formMessage.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending message...`;

    // Collect form data
    const name = contactForm.querySelector('[name="name"], [name="from_name"]')?.value || "";
    const email = contactForm.querySelector('[name="email"], [name="reply_to"]')?.value || "";
    const subject = contactForm.querySelector('[name="subject"]')?.value || "";
    const message = contactForm.querySelector('[name="message"]')?.value || "";

    try {
      // 🔹 Replace this URL with your Render backend endpoint
      const response = await fetch('https://YOUR-BACKEND-NAME.onrender.com/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await response.json();

      if (response.ok) {
        formMessage.style.color = '#10B981';
        formMessage.innerHTML = `<i class="fa-solid fa-circle-check"></i> Your message has been sent successfully. I'll get back to you ASAP!`;
        contactForm.reset();

        // hide message after 8s
        setTimeout(() => {
          formMessage.style.display = 'none';
        }, 8000);
      } else {
        formMessage.style.color = '#EF4444';
        formMessage.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${data.error || "Something went wrong. Please try again."}`;
      }
    } catch (err) {
      console.error(err);
      formMessage.style.color = '#EF4444';
      formMessage.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Failed to send message. Please check your connection and try again.`;
    }
  });
}
