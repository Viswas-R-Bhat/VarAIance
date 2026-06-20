import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.js";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right.js";
import BrainCircuit from "lucide-react/dist/esm/icons/brain-circuit.js";
import Code2 from "lucide-react/dist/esm/icons/code-2.js";
import Cpu from "lucide-react/dist/esm/icons/cpu.js";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical.js";
import Instagram from "lucide-react/dist/esm/icons/instagram.js";
import Linkedin from "lucide-react/dist/esm/icons/linkedin.js";
import MapPin from "lucide-react/dist/esm/icons/map-pin.js";
import MenuIcon from "lucide-react/dist/esm/icons/menu.js";
import Network from "lucide-react/dist/esm/icons/network.js";
import Send from "lucide-react/dist/esm/icons/send.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import Trophy from "lucide-react/dist/esm/icons/trophy.js";
import Users from "lucide-react/dist/esm/icons/users.js";
import X from "lucide-react/dist/esm/icons/x.js";

import Scene from "./Scene.jsx";
import { campus, events, marqueeItems, nav, pillars, stats, team, timeline } from "./data.js";

const iconMap = { BrainCircuit, Cpu, Users, Code2, FlaskConical, Network };
const EASE = [0.16, 1, 0.3, 1];
const LOGO = "/assets/img/varaince-logo.png";
const BMSCE = "/assets/img/bmsce-logo.png";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function Reveal({ children, className = "", delay = 0, y = 26, as = "div" }) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={reduced ? false : { opacity: 0, y, filter: "blur(8px)" }}
      whileInView={reduced ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}

// Pointer-tracked spotlight — paints a soft glow that follows the cursor
// across a card. Attach via onMouseMove; CSS reads --mx / --my.
function spotlight(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

function Magnetic({ children, strength = 0.35 }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  function move(e) {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function leave() {
    x.set(0);
    y.set(0);
  }
  return (
    <motion.span ref={ref} onMouseMove={move} onMouseLeave={leave} style={{ x: sx, y: sy, display: "inline-flex" }}>
      {children}
    </motion.span>
  );
}

function CountUp({ value, prefix = "", suffix = "", plain = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, {
      duration: 1.5,
      ease: EASE,
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduced]);

  const text = plain ? String(n) : n.toLocaleString("en-IN");
  return (
    <span ref={ref}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}

function SectionHeading({ eyebrow, title, sub, compact = false }) {
  return (
    <Reveal className={`section-heading${compact ? " compact" : ""}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("top");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["top", ...nav.map(([, id]) => id)];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header className={`nav-wrap${scrolled ? " is-scrolled" : ""}`}>
      <nav className="nav-bar" aria-label="Primary">
        <a className="brand" href="#top" aria-label="VarAInce — home">
          <img src={LOGO} alt="" />
          <span>VarAInce</span>
        </a>

        <div className="nav-links">
          {nav.map(([label, id]) => (
            <a key={id} href={`#${id}`} className={active === id ? "is-active" : ""}>
              {label}
            </a>
          ))}
        </div>

        <div className="nav-right">
          <a className="nav-bmsce" href="https://bmsce.ac.in" target="_blank" rel="noreferrer" aria-label="B.M.S. College of Engineering">
            <img src={BMSCE} alt="BMSCE" />
          </a>
          <Magnetic strength={0.25}>
            <a className="nav-action" href={campus.instagram} target="_blank" rel="noreferrer">
              <Instagram size={15} />
              <span>Follow</span>
            </a>
          </Magnetic>
          <button
            className="nav-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {nav.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
                {label}
                <ArrowUpRight size={16} />
              </a>
            ))}
            <a href={campus.instagram} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
              {campus.handle}
              <Instagram size={16} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero({ reducedMotion }) {
  const fade = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="hero" id="top">
      <Scene reducedMotion={reducedMotion} />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />

      <motion.div
        className="hero-content"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } } }}
      >
        <motion.div className="hero-kicker" variants={fade} transition={{ duration: 0.7, ease: EASE }}>
          <span className="ping" aria-hidden="true" />
          AI &amp; Data Science Club · BMSCE
        </motion.div>

        <motion.h1 variants={fade} transition={{ duration: 0.9, ease: EASE }}>
          Var<span className="ai">AI</span>nce
        </motion.h1>

        <motion.p className="hero-line" variants={fade} transition={{ duration: 0.7, ease: EASE }}>
          Where data stops being static and starts becoming a field you can move through —
          a student club that turns AI coursework into things that actually ship.
        </motion.p>

        <motion.div className="hero-actions" variants={fade} transition={{ duration: 0.7, ease: EASE }}>
          <Magnetic>
            <a className="btn primary" href="#events">
              Explore events <ArrowRight size={16} />
            </a>
          </Magnetic>
          <Magnetic strength={0.25}>
            <a className="btn ghost" href="#about">
              The story
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-chip"
        initial={{ opacity: 0, y: 24, x: 18 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: EASE }}
      >
        <span className="eyebrow">live signal</span>
        <strong>Variance field</strong>
        <small>Cursor-reactive neural constellation · {events[0].metrics[0][0]} builders mapped</small>
      </motion.div>

      <div className="hero-scroll" aria-hidden="true">
        <span />
        scroll
      </div>
    </section>
  );
}

function Marquee() {
  const reduced = useReducedMotion();
  const row = [...marqueeItems, ...marqueeItems];
  return (
    <div className="marquee" aria-hidden="true">
      <div className={`marquee-track${reduced ? " is-static" : ""}`}>
        {row.map((item, i) => (
          <span key={i}>
            {item}
            <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

function Stats() {
  return (
    <section className="stats-strip" aria-label="Club metrics">
      {stats.map((s, i) => (
        <Reveal className="stat-item" delay={i * 0.06} key={s.label}>
          <strong>
            <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} plain={s.plain} />
          </strong>
          <span>{s.label}</span>
          <small>{s.hint}</small>
        </Reveal>
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* About + timeline                                                    */
/* ------------------------------------------------------------------ */

function About() {
  return (
    <section className="section about" id="about">
      <div className="about-grid">
        <div className="about-lead">
          <SectionHeading
            eyebrow="About"
            title={<>Variance, with <span className="grad-text">AI</span> hiding inside it.</>}
          />
          <Reveal delay={0.05}>
            <p className="about-copy">
              <strong>VarAInce</strong> reads as <em>variance</em> — the statistical measure of how far a set of
              values spreads from its mean — with <strong>AI</strong> embedded in the middle. It's the kind of
              name that only clicks once you've taken a statistics course and an AI course in the same semester,
              which is exactly where most of our members are.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mission-card" >
            <span className="eyebrow">Mission</span>
            <h3>Bridge the gap between classroom theory and real-world AI.</h3>
            <p>
              Lecture covers the math behind a model. We cover everything lecture doesn't have time for — picking a
              dataset, fighting preprocessing, watching a model fail, and shipping something anyway in the time it
              takes to run a hackathon. Not a replacement for the curriculum. Somewhere for it to land.
            </p>
          </Reveal>
        </div>

        <Reveal className="timeline" delay={0.12}>
          <span className="eyebrow">Origin story</span>
          <ol>
            {timeline.map((t) => (
              <li key={t.year}>
                <span className="t-year">{t.year}</span>
                <div className="t-body">
                  <h4>{t.title}</h4>
                  <p>{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pillars                                                             */
/* ------------------------------------------------------------------ */

function Pillars() {
  return (
    <section className="section" id="pillars">
      <SectionHeading
        eyebrow="What we build"
        title="A sharper interface for an AI club."
        sub="Less brochure, more operating surface — three things the club exists to do, for students who build with data."
      />
      <div className="bento">
        {pillars.map((p, i) => {
          const Icon = iconMap[p.icon];
          return (
            <Reveal className="bento-card spot" delay={i * 0.08} key={p.title}>
              <div onMouseMove={spotlight} className="spot-inner">
                <div className="bento-top">
                  <span className="bento-icon">
                    <Icon size={22} />
                  </span>
                  <span className="bento-index">0{i + 1}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <span className="bento-tag">{p.tag}</span>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

function Events() {
  return (
    <section className="section" id="events">
      <SectionHeading
        eyebrow="Events"
        title="Not cards. Event instruments."
        sub="Real events, real names attached to the outcomes — each with a strong metric line and the receipts to back it."
      />
      <div className="event-list">
        {events.map((ev, i) => {
          const Icon = iconMap[ev.icon];
          return (
            <Reveal className="event-row spot" delay={i * 0.06} key={ev.title}>
              <div className="spot-inner event-inner" onMouseMove={spotlight}>
                <div className="event-head">
                  <span className="event-icon">
                    <Icon size={20} />
                  </span>
                  <div className="event-titles">
                    <span className="event-type">{ev.type}</span>
                    <h3>{ev.title}</h3>
                    <span className="event-date">{ev.date}</span>
                  </div>
                  <span className="event-no">0{i + 1}</span>
                </div>

                <p className="event-theme">
                  <span>Focus</span> {ev.theme}
                </p>
                <p className="event-detail">{ev.detail}</p>

                <div className="event-metrics">
                  {ev.metrics.map(([v, l]) => (
                    <div key={l}>
                      <strong>{v}</strong>
                      <span>{l}</span>
                    </div>
                  ))}
                </div>

                {ev.winners.length > 0 && (
                  <div className="event-winners">
                    <span className="winners-label">
                      <Trophy size={14} /> Winners
                    </span>
                    <ul>
                      {ev.winners.map(([rank, project, names]) => (
                        <li key={project}>
                          <span className="rank">{rank}</span>
                          <span className="proj">
                            <strong>{project}</strong>
                            <small>{names}</small>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="event-foot">{ev.footnote}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */

function Team() {
  return (
    <section className="section" id="team">
      <SectionHeading
        eyebrow="Team"
        title="The people running VarAInce."
        sub="Six roles, one club. Roster below is a placeholder — real names, photos, and links go in before launch."
      />
      <div className="team-grid">
        {team.map((m, i) => (
          <Reveal className="team-card spot" delay={i * 0.05} key={m.name}>
            <div className="spot-inner" onMouseMove={spotlight}>
              <div className="avatar" aria-hidden="true">
                {m.initials}
              </div>
              <h3>{m.name}</h3>
              <span className="team-role">{m.role}</span>
              <a className="team-link" href="#" aria-label={`${m.name} on LinkedIn`}>
                <Linkedin size={16} />
              </a>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="team-note">Placeholder roster — swap in real names, photos, and LinkedIn links before launch.</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID"; // REPLACE before launch
const FORM_READY = !FORM_ENDPOINT.includes("YOUR_FORM_ID");

function Contact() {
  const [status, setStatus] = useState({ state: "idle", msg: "" });

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!FORM_READY) {
      setStatus({
        state: "info",
        msg: "Form endpoint isn't connected yet — reach us on Instagram in the meantime.",
      });
      return;
    }
    setStatus({ state: "loading", msg: "Sending…" });
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        form.reset();
        setStatus({ state: "ok", msg: "Sent — we'll get back to you. Thanks for reaching out." });
      } else {
        setStatus({ state: "error", msg: "Something went wrong. Try Instagram instead." });
      }
    } catch {
      setStatus({ state: "error", msg: "Network error. Try Instagram instead." });
    }
  }

  return (
    <section className="section" id="contact">
      <SectionHeading
        eyebrow="Contact"
        title="Find us, follow us, or just write in."
        sub="Instagram is the fastest way to reach us. The form works too — it just takes a little longer to check."
      />

      <div className="contact-grid">
        <div className="contact-side">
          <Reveal className="contact-primary spot">
            <div className="spot-inner" onMouseMove={spotlight}>
              <span className="eyebrow">Primary channel</span>
              <h3>{campus.handle}</h3>
              <p>Event announcements, recaps, and the occasional behind-the-scenes reel. This is where we post first.</p>
              <Magnetic strength={0.25}>
                <a className="btn primary" href={campus.instagram} target="_blank" rel="noreferrer">
                  <Instagram size={16} /> Open Instagram
                </a>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal className="contact-place" delay={0.06}>
            <span className="place-icon">
              <MapPin size={18} />
            </span>
            <div>
              <h4>On campus</h4>
              <p>{campus.address}</p>
              <a href={campus.mapLink} target="_blank" rel="noreferrer" className="map-text-link">
                Open in Google Maps <ArrowUpRight size={14} />
              </a>
            </div>
          </Reveal>

          <Reveal className="map-wrap" delay={0.1}>
            <iframe
              src={campus.mapEmbed}
              title="Map showing B.M.S. College of Engineering, Basavanagudi, Bengaluru"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>

        <Reveal className="contact-form-card" delay={0.08}>
          <h3>Send a message</h3>
          <p className="form-intro">For collaborations, sponsorships, or general questions.</p>
          <form className="contact-form" onSubmit={onSubmit}>
            <input type="text" name="_gotcha" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" required autoComplete="name" placeholder="Your name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={4} required placeholder="What's on your mind?" />
            </div>
            <button type="submit" className="btn primary btn-block" disabled={status.state === "loading"}>
              {status.state === "loading" ? "Sending…" : (<>Send message <Send size={15} /></>)}
            </button>
            {status.msg && (
              <p className={`form-status is-${status.state}`} role="status" aria-live="polite">
                {status.msg}
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-cta">
        <Reveal>
          <span className="eyebrow">Next signal</span>
          <h2>Follow the build-up.</h2>
          <p>Announcements, recaps, and the next run of AI builders — posted first on Instagram.</p>
          <Magnetic>
            <a className="btn primary" href={campus.instagram} target="_blank" rel="noreferrer">
              <Instagram size={16} /> {campus.handle}
            </a>
          </Magnetic>
        </Reveal>
      </div>

      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logos">
            <img src={LOGO} alt="VarAInce logo" />
            <span className="footer-bar" />
            <img src={BMSCE} alt="B.M.S. College of Engineering" className="bmsce" />
          </div>
          <strong>VarAInce</strong>
          <span>Official AI &amp; DS Club — B.M.S. College of Engineering</span>
        </div>

        <div className="footer-cols">
          <div>
            <h5>Explore</h5>
            <a href="#events">Events</a>
            <a href="#about">About</a>
            <a href="#team">Team</a>
          </div>
          <div>
            <h5>Club</h5>
            <a href="#contact">Contact</a>
            <a href={campus.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://bmsce.ac.in" target="_blank" rel="noreferrer">BMSCE</a>
          </div>
          <div>
            <h5>Department</h5>
            <span>Artificial Intelligence &amp; Data Science</span>
            <span>Established 2022</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 VarAInce — AI &amp; Data Science Club, B.M.S. College of Engineering, Bengaluru.</p>
        <a href={campus.instagram} target="_blank" rel="noreferrer">
          <Instagram size={15} /> {campus.handle}
        </a>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <div className="app-shell">
      <motion.div className="scroll-progress" style={{ scaleX }} />
      <div className="page-glow" aria-hidden="true" />
      <Nav />
      <main>
        <Hero reducedMotion={reducedMotion} />
        <Marquee />
        <Stats />
        <About />
        <Pillars />
        <Events />
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
