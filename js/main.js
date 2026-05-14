// ─── Auto-update copyright year ───────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();


// ─── Scroll reveal animation ───────────────────────────────
// Adds .reveal class to every section child, then uses
// IntersectionObserver to add .visible when they scroll into view.

const revealTargets = document.querySelectorAll(
  '.section-body, .timeline-item, .link-list li, #contact h2, #contact p, #contact .btn'
);

revealTargets.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once only
      }
    });
  },
  { threshold: 0.12 }
);

revealTargets.forEach(el => observer.observe(el));


// ─── Active nav highlight (optional, for future nav bar) ──
// When you add a <nav>, this will highlight the current section.
// Left here as a starter for when you're ready to use it.

/*
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
});
*/
