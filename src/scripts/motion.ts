// Site-wide motion: smooth scrolling, scroll progress, text reveals and
// scroll-linked effects. Colours always come from the CSS variables in
// global.css, so every effect follows the light/dark theme automatically.
// Visitors who ask for reduced motion get the plain, static site.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Wrap every word of an element in a mask, keeping inner tags like <em> and <br>. */
function splitWords(el: Element): HTMLElement[] {
  if ((el as HTMLElement).dataset.splitDone) return Array.from(el.querySelectorAll<HTMLElement>('.w > span'));
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  texts.forEach((t) => {
    const parts = (t.textContent ?? '').split(/(\s+)/);
    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) frag.append(' ');
      else {
        const w = document.createElement('span');
        w.className = 'w';
        const inner = document.createElement('span');
        inner.textContent = part;
        w.append(inner);
        frag.append(w);
      }
    });
    t.replaceWith(frag);
  });
  (el as HTMLElement).dataset.splitDone = '1';
  return Array.from(el.querySelectorAll<HTMLElement>('.w > span'));
}

function init() {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- Smooth scroll ---------- */
  const lenis = new Lenis({ lerp: 0.1, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---------- Scroll progress bar ---------- */
  gsap.to('.scroll-progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: true },
  });

  /* ---------- Hero intro (runs on load) ---------- */
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (hero) {
    const h1 = hero.querySelector('h1');
    const words = h1 ? splitWords(h1) : [];
    gsap.set(hero, { visibility: 'visible' });
    gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .from(hero.querySelector('.eyebrow'), { y: 16, opacity: 0, duration: 0.8 })
      .from(words, { yPercent: 115, rotate: 5, duration: 1.1, stagger: 0.06 }, '-=0.5')
      .from(hero.querySelectorAll('.lead, .hero-actions > *'), { y: 24, opacity: 0, duration: 0.9, stagger: 0.1 }, '-=0.8');
  }

  /* ---------- Section headings: words rise out of a mask ---------- */
  document.querySelectorAll('main h2:not([data-no-split])').forEach((h) => {
    const words = splitWords(h);
    gsap.from(words, {
      yPercent: 115,
      rotate: 4,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.06,
      scrollTrigger: { trigger: h, start: 'top 88%' },
    });
  });

  /* ---------- Generic reveals ---------- */
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 36,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });
  // Children of [data-stagger] arrive one after another as they scroll in
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    ScrollTrigger.batch(group.children, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) =>
        gsap.from(batch, {
          y: 70,
          rotateX: 14,
          opacity: 0,
          transformPerspective: 1000,
          transformOrigin: '50% 100%',
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.12,
        }),
    });
  });

  /* ---------- Client ticker leans with scroll speed ---------- */
  const tickerLists = document.querySelectorAll('.ticker ul');
  if (tickerLists.length) {
    const skew = gsap.quickTo(tickerLists, 'skewX', { duration: 0.4, ease: 'power3.out' });
    ScrollTrigger.create({
      trigger: '.clients',
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (s) => skew(gsap.utils.clamp(-14, 14, s.getVelocity() / -220)),
      onLeave: () => skew(0),
      onLeaveBack: () => skew(0),
    });
  }

  /* ---------- Build + Grow cards swing in from opposite sides ---------- */
  gsap.utils.toArray<HTMLElement>('.split .group').forEach((g, i) => {
    gsap.from(g, {
      x: i % 2 ? 80 : -80,
      rotate: i % 2 ? 3 : -3,
      opacity: 0,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: g, start: 'top 85%' },
    });
    gsap.from(g.querySelectorAll('li'), {
      x: -20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.07,
      ease: 'power2.out',
      scrollTrigger: { trigger: g, start: 'top 70%' },
    });
  });

  /* ---------- Process: a coral line draws across each step in turn ---------- */
  const steps = gsap.utils.toArray<HTMLElement>('.steps li');
  if (steps.length) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 60%', scrub: 0.6 },
    });
    steps.forEach((st, i) => {
      tl.fromTo(st, { '--draw': 0 }, { '--draw': 1, ease: 'none', duration: 1 }, i)
        .from(st.querySelector('.num'), { scale: 0.4, opacity: 0, transformOrigin: '0% 80%', ease: 'back.out(2)', duration: 0.5 }, i)
        .from(st.querySelectorAll('h3, p'), { y: 24, opacity: 0, stagger: 0.1, duration: 0.5 }, i + 0.15);
    });
  }

  /* ---------- Call-to-action box opens up as it arrives ---------- */
  document.querySelectorAll<HTMLElement>('.cta').forEach((box) => {
    gsap.fromTo(
      box,
      { scale: 0.9, y: 60, borderRadius: 72 },
      {
        scale: 1,
        y: 0,
        borderRadius: 32,
        ease: 'none',
        scrollTrigger: { trigger: box, start: 'top bottom', end: 'top 45%', scrub: true },
      }
    );
  });

  /* ---------- Footer wordmark fills with coral as you reach the end ---------- */
  if (document.querySelector('.wordmark')) {
    gsap.fromTo(
      '.wordmark .fill',
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        ease: 'none',
        scrollTrigger: { trigger: '.footer', start: 'top 80%', end: 'bottom bottom', scrub: true },
      }
    );
    gsap.from('.wordmark', {
      yPercent: 35,
      ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }

  /* ---------- Mouse-only niceties ---------- */
  if (finePointer) {
    // Magnetic buttons pull towards the cursor and spring back
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((b) => {
      const x = gsap.quickTo(b, 'x', { duration: 0.35, ease: 'power2.out' });
      const y = gsap.quickTo(b, 'y', { duration: 0.35, ease: 'power2.out' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * 0.3);
        y((e.clientY - r.top - r.height / 2) * 0.4);
      });
      b.addEventListener('pointerleave', () =>
        gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)', overwrite: true })
      );
    });

    // Project cards tilt in 3D towards the cursor, with a soft glow following it
    document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        c.style.setProperty('--mx', `${px * 100}%`);
        c.style.setProperty('--my', `${py * 100}%`);
        gsap.to(c, { rotateY: (px - 0.5) * 8, rotateX: (0.5 - py) * 8, transformPerspective: 900, duration: 0.4, ease: 'power2.out' });
      });
      c.addEventListener('pointerleave', () => gsap.to(c, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'power3.out' }));
    });
  }

  // Fonts and lazy media change heights; re-measure once everything is in
  addEventListener('load', () => ScrollTrigger.refresh());
  root.classList.add('motion-ready');
}

if (!reduce) {
  try {
    init();
  } catch (e) {
    // Never leave content hidden if something goes wrong
    root.classList.remove('motion');
    console.error(e);
  }
}
