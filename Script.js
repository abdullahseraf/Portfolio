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

  /* Project details modal (only facts taken from the site content) */
  const data = {
    taskmind: {
      t: "TaskMind",
      k: "AI Productivity App",
      o: "AI-powered productivity app for goals, tasks and daily planning.",
      f: [
        "Goals",
        "Tasks",
        "Daily planning",
        "AI-powered assistance",
        "Local data storage with AsyncStorage",
      ],
      s: ["React Native", "Expo", "TypeScript", "AI", "AsyncStorage"],
    },
    ajir: {
      t: "Ajir",
      k: "Islamic Mobile Application",
      o: "Islamic prayer app with location-based prayer times, adhkar, Quran pages, tracking and notifications.",
      f: [
        "Location-based prayer times",
        "Adhkar",
        "Quran pages",
        "Tracking",
        "Notifications",
      ],
      s: ["React Native", "Expo", "TypeScript", "Firebase", "Adhan"],
    },
  };
  const dlg = $("#modal");
  if (dlg) {
    const lock = (on) => {
      document.documentElement.style.overflow = on ? "hidden" : "";
    };
    const li = (a) => a.map((x) => `<li>${x}</li>`).join("");
    $$("[data-open]").forEach((b) =>
      b.addEventListener("click", () => {
        const p = data[b.dataset.open];
        if (!p) return;
        $("#mTitle").textContent = p.t;
        $("#mBody").innerHTML =
          `<div><h4>OVERVIEW</h4><p>${p.o}</p></div>` +
          `<div><h4>KEY FEATURES</h4><ul class="fe">${li(p.f)}</ul></div>` +
          `<div><h4>TECHNOLOGY</h4><ul class="pills">${li(p.s)}</ul></div>`;
        typeof dlg.showModal === "function"
          ? dlg.showModal()
          : dlg.setAttribute("open", "");
        lock(true);
      }),
    );
    const close = () => {
      typeof dlg.close === "function"
        ? dlg.close()
        : dlg.removeAttribute("open");
      lock(false);
    };
    $$("[data-close]", dlg).forEach((b) => b.addEventListener("click", close));
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) close();
    });
    dlg.addEventListener("close", () => lock(false));
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
