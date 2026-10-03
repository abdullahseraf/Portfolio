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
        "AI-powered productivity app for goals, tasks and daily planning.",
      features: [
        "Goals",
        "Tasks",
        "Daily planning",
        "AI-powered",
        "Local data storage with AsyncStorage",
      ],
      stack: ["React Native", "Expo", "TypeScript", "AI", "AsyncStorage"],
      images: [],
      links: { playStore: "", github: "", demo: "" },
    },
    ajir: {
      title: "Ajir",
      category: "Mobile · Islamic Application",
      overview:
        "Islamic prayer app with location-based prayer times, adhkar, Quran pages, tracking and notifications.",
      features: [
        "Location-based prayer times",
        "Adhkar",
        "Quran pages",
        "Tracking",
        "Notifications",
      ],
      stack: ["React Native", "Expo", "TypeScript", "Firebase", "Adhan"],
      images: [],
      links: { playStore: "", github: "", demo: "" },
    },
    portfolio: {
      title: "Portfolio website",
      category: "Web project",
      overview: "A personal portfolio website.",
      features: [],
      stack: [],
      images: [
        "images/Rectangle 11.png",
        "images/Rectangle 12.png",
        "images/portfolio2.png",
        "images/light.png",
        "images/dark.png",
      ],
      links: { playStore: "", github: "", demo: "" },
    },
    shoe: {
      title: "Shoe website",
      category: "Web project",
      overview: "A shoe store website.",
      features: [],
      stack: [],
      images: ["images/Rectangle 13.png", "images/nike.png"],
      links: { playStore: "", github: "", demo: "" },
    },
    weather: {
      title: "Weather website",
      category: "Web project",
      overview: "A weather website.",
      features: [],
      stack: [],
      images: ["images/weather.png"],
      links: { playStore: "", github: "", demo: "" },
    },
    arabs: {
      title: "Arabs website",
      category: "Web project",
      overview: "A website for Arabs.",
      features: [],
      stack: [],
      images: ["images/arab.png", "images/arab2.png"],
      links: { playStore: "", github: "", demo: "" },
    },
    shop: {
      title: "Shop website",
      category: "Web project",
      overview: "An online shop website.",
      features: [],
      stack: [],
      images: ["images/fitnest.png"],
      links: { playStore: "", github: "", demo: "" },
    },
    password: {
      title: "Password generator",
      category: "Web project",
      overview: "A password generator web tool.",
      features: [],
      stack: [],
      images: ["images/pasword.png"],
      links: { playStore: "", github: "", demo: "" },
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
  if (pv && first) {
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
        a.append(label + " ", el("span", "arr", "↗"));
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
