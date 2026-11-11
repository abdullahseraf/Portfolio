(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasIO = "IntersectionObserver" in window;

  /* Navbar: scrolled state, progress bar, mobile menu */
  const nav = $(".nav"),
    burger = $(".burger"),
    bar = $(".progress");
  const setMenu = (open) => {
    if (!nav || !burger) return;
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  if (burger)
    burger.addEventListener("click", () =>
      setMenu(!nav.classList.contains("open")),
    );
  $$(".menu a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false)),
  );
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });
  matchMedia("(min-width: 900px)").addEventListener(
    "change",
    (e) => e.matches && setMenu(false),
  );

  let tick = false;
  const onScroll = () => {
    tick = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle("scrolled", scrollY > 16);
    if (bar)
      bar.style.setProperty("--p", max > 0 ? Math.min(scrollY / max, 1) : 0);
  };
  addEventListener(
    "scroll",
    () => {
      if (!tick) {
        tick = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );
  onScroll();

  /* Active section + reveal + count-up */
  if (hasIO) {
    const links = $$('.menu a[href^="#"]');
    const spy = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting)
            links.forEach((a) => {
              const on = a.hash === "#" + e.target.id;
              a.classList.toggle("on", on);
              on
                ? a.setAttribute("aria-current", "true")
                : a.removeAttribute("aria-current");
            });
        }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    $$("main section[id]").forEach((s) => spy.observe(s));

    const rv = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            rv.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    $$(".rv").forEach((el) => rv.observe(el));

    const count = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          count.unobserve(e.target);
          const el = e.target,
            to = +el.dataset.to,
            suf = el.dataset.suf || "";
          if (reduced) {
            el.textContent = to + suf;
            return;
          }
          const t0 = performance.now(),
            dur = 1200;
          const step = (t) => {
            const k = Math.min((t - t0) / dur, 1);
            el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suf;
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }),
      { threshold: 0.6 },
    );
    $$("[data-to]").forEach((el) => count.observe(el));
  } else {
    $$(".rv").forEach((el) => el.classList.add("in"));
    $$("[data-to]").forEach((el) => {
      el.textContent = el.dataset.to + (el.dataset.suf || "");
    });
  }

  /* Project filter */
  const fbar = $(".filters"),
    cards = $$(".grid .card");
  if (fbar)
    fbar.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      $$("button", fbar).forEach((x) =>
        x.setAttribute("aria-pressed", String(x === b)),
      );
      cards.forEach((c) => {
        const show = b.dataset.f === "all" || c.dataset.t === b.dataset.f;
        if (show) {
          if (c.hidden) {
            c.hidden = false;
            c.classList.add("out");
            void c.offsetWidth;
          }
          c.classList.remove("out");
        } else {
          c.classList.add("out");
          setTimeout(
            () => {
              if (c.classList.contains("out")) c.hidden = true;
            },
            reduced ? 0 : 260,
          );
        }
      });
    });

    /* Project data — fill in links and image paths here. An empty link hides its button; an empty images list shows a placeholder. */
  const PROJECTS = {
    taskmind: {
      title: "TaskMind",
      category: "Mobile · AI Productivity App",
      overview:
        "AI-powered productivity and daily planning application designed for seamless goal tracking, smart breakdown of tasks and habit formation.",
      features: [
        "Smart Goal Breakdown powered by AI",
        "Interactive Daily Task Organizer & Prioritization",
        "Personalized Focus & Daily Routine Planning",
        "Offline-first local data persistence with AsyncStorage",
        "Clean, modern distraction-free dark interface",
      ],
      stack: ["React Native", "Expo", "TypeScript", "AI Integration", "AsyncStorage"],
      images: ["images/Taskmind.jpg"],
      links: { playStore: "", github: "https://github.com/abdullahseraf", demo: "" },
    },
    ajir: {
      title: "Ajir",
      category: "Mobile · Islamic Application",
      overview:
        "Comprehensive Islamic prayer companion app featuring automated location-based prayer times, morning & evening adhkar, Quran reader, daily tracking and custom notifications.",
      features: [
        "Location-based accurate prayer times & Qibla compass",
        "Complete morning, evening & daily Adhkar with digital counter",
        "Full high-definition Quran pages with bookmarking",
        "Daily prayer tracker and spiritual streak monitoring",
        "Customizable Adhan prayer push notifications",
      ],
      stack: ["React Native", "Expo", "TypeScript", "Firebase", "Adhan API"],
      images: ["images/Ajir.jpg"],
      links: {
        playStore: "https://play.google.com/store/apps/details?id=com.anonymous.ajir&pli=1",
        github: "https://github.com/abdullahseraf",
        demo: "",
      },
    },
    portfolio: {
      title: "Portfolio Website",
      category: "Web · Personal Showcase",
      overview:
        "Personal developer portfolio built with modern responsive CSS, semantic HTML5, interactive JavaScript and CI/CD automated deployment with GitHub Pages.",
      features: [
        "Fully responsive layout across mobile, tablet and desktop",
        "Interactive project gallery and detail dialogs",
        "Category filtering with smooth CSS transitions",
        "Scroll progress indicator and IntersectionObserver reveal animations",
      ],
      stack: ["HTML5", "CSS3", "JavaScript", "GitHub Actions"],
      images: [
        "images/portfolio2.png",
        "images/dark.png",
        "images/light.png",
        "images/Rectangle 11.png",
        "images/Rectangle 12.png",
      ],
      links: { playStore: "", github: "https://github.com/abdullahseraf", demo: "https://abdullahseraf.github.io" },
    },
    shoe: {
      title: "Nike Shoe Store",
      category: "Web · E-Commerce Concept",
      overview:
        "Modern athletic footwear e-commerce concept store highlighting high-impact product imagery, clean typography, and interactive shopping interactions.",
      features: [
        "Dynamic hero banner and product showcases",
        "Interactive product card variations and hover states",
        "Mobile-first responsive e-commerce layout",
        "High-contrast dark modern aesthetic",
      ],
      stack: ["HTML5", "CSS3", "JavaScript", "UI/UX"],
      images: ["images/nike.png", "images/Rectangle 13.png"],
      links: { playStore: "", github: "https://github.com/abdullahseraf", demo: "" },
    },
    weather: {
      title: "Weather Forecast",
      category: "Web · Weather Application",
      overview:
        "Clean, interactive weather forecast web application providing real-time meteorological conditions, temperature, humidity and global city search.",
      features: [
        "Instant city search with meteorological data integration",
        "Real-time temperature, wind speed and atmospheric conditions",
        "Minimalist aesthetic with responsive card layout",
        "Dynamic condition badges and weather indicators",
      ],
      stack: ["JavaScript", "REST Weather API", "CSS3", "HTML5"],
      images: ["images/weather.png"],
      links: { playStore: "", github: "https://github.com/abdullahseraf", demo: "" },
    },
    arabs: {
      title: "Arab Heritage",
      category: "Web · Cultural Portal",
      overview:
        "An educational and cultural web platform exploring the rich history, literature, architecture and civilization of the Arab world.",
      features: [
        "Structured historical eras and cultural spotlights",
        "Bilingual typography and high-definition visual assets",
        "Smooth scroll navigation and reading-optimized typography",
        "Interactive cultural timeline cards",
      ],
      stack: ["HTML5", "CSS3", "JavaScript"],
      images: ["images/arab.png", "images/arab2.png"],
      links: { playStore: "", github: "https://github.com/abdullahseraf", demo: "" },
    },
    shop: {
      title: "FitNest Store",
      category: "Web · Fitness & Lifestyle",
      overview:
        "Online storefront concept for fitness apparel, athletic gear and workout essentials with modern product grids and smooth browsing.",
      features: [
        "Categorized workout gear and fitness collections",
        "Clean product cards with pricing and status indicators",
        "Responsive grid system optimized for handheld devices",
        "Fast-loading UI with minimal dependencies",
      ],
      stack: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
      images: ["images/fitnest.png"],
      links: { playStore: "", github: "https://github.com/abdullahseraf", demo: "" },
    },
    password: {
      title: "Password Generator",
      category: "Web · Security Tool",
      overview:
        "Fast, client-side utility for generating strong, cryptographically randomized passwords with customizable security preferences.",
      features: [
        "Length slider and symbol toggles (uppercase, lowercase, numbers, symbols)",
        "Instant strength feedback analysis",
        "One-click copy to clipboard with toast notification",
        "Zero server transmission for 100% user privacy",
      ],
      stack: ["JavaScript", "Web Crypto API", "CSS3", "HTML5"],
      images: ["images/pasword.png"],
      links: { playStore: "", github: "https://github.com/abdullahseraf", demo: "" },
    },
  };
  const LINKS = [
    ["playStore", "Google Play"],
    ["github", "GitHub"],
    ["demo", "Live Demo"],
  ];

  /* Featured TaskMind preview: uses the first screenshot once one is added */
  const pv = $(".preview"),
    first = PROJECTS.taskmind.images[0];
  if (pv && first && !$(".mockup-frame", pv)) {
    const im = document.createElement("img");
    im.src = first;
    im.alt = "TaskMind screenshot";
    pv.replaceChildren(im);
    pv.removeAttribute("aria-hidden");
  }

  /* Project details modal, built from PROJECTS */
  const el = (tag, cls, txt) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  };
  const block = (label, node) => {
    const d = el("div");
    d.append(el("h4", null, label), node);
    return d;
  };
  const list = (items, cls) => {
    const u = el("ul", cls);
    items.forEach((t) => u.append(el("li", null, t)));
    return u;
  };
  const placeholder = (msg) => {
    const d = el("div", "ph");
    d.append(
      el("strong", null, "Screenshot placeholder"),
      el("span", null, msg),
    );
    return d;
  };

  const dlg = $("#modal");
  if (dlg) {
    let proj = null,
      shots = [],
      thumbs = [],
      stage = null,
      cur = 0;
    const lock = (on) => {
      document.documentElement.style.overflow = on ? "hidden" : "";
    };
    const show = (i) => {
      if (!shots.length || !stage) return;
      cur = (i + shots.length) % shots.length;
      const im = el("img");
      im.src = shots[cur];
      im.alt = `${proj.title} screenshot ${cur + 1} of ${shots.length}`;
      im.addEventListener("error", () =>
        stage.replaceChildren(placeholder("Image not found: " + shots[cur])),
      );
      stage.replaceChildren(im);
      thumbs.forEach((t, k) =>
        t.setAttribute("aria-current", String(k === cur)),
      );
    };
    const open = (id) => {
      proj = PROJECTS[id];
      if (!proj) return;
      const body = $("#mBody");
      if (!body) return;
      $("#mTitle").textContent = proj.title;
      $("#mCat").textContent = proj.category;
      body.replaceChildren();
      shots = proj.images;
      thumbs = [];
      cur = 0;
      stage = el("div", "stage");
      const gal = el("div", "gal");
      gal.append(stage);
      if (shots.length > 1) {
        const tr = el("div", "thumbs");
        shots.forEach((src, k) => {
          const b = el("button", "th"),
            im = el("img");
          b.type = "button";
          b.setAttribute("aria-label", `Show screenshot ${k + 1}`);
          im.src = src;
          im.alt = "";
          im.loading = "lazy";
          b.append(im);
          b.addEventListener("click", () => show(k));
          thumbs.push(b);
          tr.append(b);
        });
        gal.append(tr);
      }
      body.append(gal);
      shots.length
        ? show(0)
        : stage.append(
            placeholder(
              `Add screenshots, e.g. images/${id}-1.png, and list them in script.js`,
            ),
          );
      body.append(block("OVERVIEW", el("p", null, proj.overview)));
      if (proj.features.length)
        body.append(block("KEY FEATURES", list(proj.features, "fe")));
      if (proj.stack.length)
        body.append(block("TECHNOLOGY", list(proj.stack, "pills")));
      const row = el("div", "row");
      LINKS.forEach(([key, label]) => {
        if (!proj.links[key]) return;
        const a = el("a", "btn");
        a.href = proj.links[key];
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        if (key === "playStore") {
          a.className = "btn solid store-btn";
          a.innerHTML = `<svg class="play-icon" viewBox="0 0 512 512" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 59.9zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg> Google Play <span class="arr">↗</span>`;
        } else {
          a.append(label + " ", el("span", "arr", "↗"));
        }
        row.append(a);
      });
      if (row.children.length) body.append(row);
      body.scrollTop = 0;
      dlg.scrollTop = 0;
      typeof dlg.showModal === "function"
        ? dlg.showModal()
        : dlg.setAttribute("open", "");
      lock(true);
    };
    const close = () => {
      typeof dlg.close === "function"
        ? dlg.close()
        : dlg.removeAttribute("open");
      lock(false);
    };
    $$("[data-open]").forEach((b) =>
      b.addEventListener("click", () => open(b.dataset.open)),
    );
    $$(".card.app").forEach((c) =>
      c.addEventListener("click", (e) => {
        if (e.target.closest("a, button")) return;
        const b = $("[data-open]", c);
        if (b) b.click();
      }),
    );
    $$("[data-close]", dlg).forEach((b) => b.addEventListener("click", close));
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) close();
    });
    dlg.addEventListener("close", () => lock(false));
    dlg.addEventListener("keydown", (e) => {
      if (shots.length < 2) return;
      if (e.key === "ArrowRight") show(cur + 1);
      if (e.key === "ArrowLeft") show(cur - 1);
    });
  }

  /* Contact form → opens the visitor's email app */
  const form = $("#contactForm"),
    status = $("#status");
  if (form)
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const body = `${d.get("message")}\n\n— ${d.get("name")} (${d.get("email")})`;
      location.href =
        "mailto:abdullahseraf20@gmail.com?subject=" +
        encodeURIComponent("Portfolio message from " + d.get("name")) +
        "&body=" +
        encodeURIComponent(body);
      if (status)
        status.textContent =
          "Opening your email app. If nothing opens, write to abdullahseraf20@gmail.com.";
      form.reset();
    });

  /* Cursor glow: desktop pointer only */
  if (!reduced && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const g = document.createElement("div");
    g.className = "cg";
    g.setAttribute("aria-hidden", "true");
    document.body.appendChild(g);
    let x = 0,
      y = 0,
      raf = 0;
    addEventListener(
      "pointermove",
      (e) => {
        x = e.clientX;
        y = e.clientY;
        g.classList.add("on");
        if (!raf)
          raf = requestAnimationFrame(() => {
            g.style.transform = `translate(${x}px,${y}px)`;
            raf = 0;
          });
      },
      { passive: true },
    );
    document.addEventListener("pointerleave", () => g.classList.remove("on"));
  }
})();
