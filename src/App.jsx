import { useState, useEffect, useRef } from "react";

const COLORS = {
  // Brand
  slalomBlue: "#0C62FB",
  slalomDark: "#002FAF",
  cyan: "#1BE1F2",
  coralRed: "#FF4D5F",
  purple: "#C7B9FF",
  chartreuse: "#DEF14D",
  // Neutrals
  black: "#000000",
  darkGray: "#666666",
  midGray: "#3c4043",
  lightGray: "#E8E8E8",
  borderGray: "#f0f0f0",
  surfaceGray: "#f1f3f4",
  surfaceLight: "#f8f9fa",
  white: "#FFFFFF",
  // Semantic tag backgrounds
  tagGreenBg: "#E8F5E9",
  tagBlueBg: "#E3F2FD",
  tagYellowBg: "#FFF8E1",
  tagPinkBg: "#FCE4EC",
  tagGreenText: "#2E7D32",
  tagBlueText: "#1565C0",
  tagYellowText: "#F57F17",
  // Section accent backgrounds
  blueAccentBg: "#EBF2FF",
  blueTagBg: "#E8F0FE",
  coralAccentBg: "#FFEEF0",
  // Third-party brand
  googleGreen: "#34A853",
  whatsappGreen: "#25D366",
};

function useInView(threshold = 0.05, rootMargin = "0px 0px 80px 0px") {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);
  return [ref, visible];
}

/* Count up from 0 to target when element enters view */
function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView(0.1);
  useEffect(() => {
    if (!visible || target === 0) return;
    const start = Date.now();
    const step = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target, duration]);
  return [ref, count, visible];
}

/* Track which section is currently in the viewport for nav highlighting */
function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { threshold: 0.25, rootMargin: "-56px 0px -35% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

/* ── Scroll-reveal hook — fires once when element enters viewport ── */
function useSectionReveal(threshold = 0.08) {
  const [ref, visible] = useInView(threshold);
  const anim = (name, delay) =>
    visible
      ? { animation: `${name} 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` }
      : { opacity: 0 };
  return [ref, visible, anim];
}

/* Global CSS keyframe definitions */
function GlobalStyles() {
  return (
    <style>{`
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-18px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(18px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.82); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes popIn {
        from { opacity: 0; transform: scale(0.88) translateY(10px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes countPop {
        0%   { transform: scale(1); }
        45%  { transform: scale(1.14); }
        100% { transform: scale(1); }
      }
      /* Force h1 white regardless of browser extension overrides */
      #hero-title { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
      /* Level section card hover lift */
      .level-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .level-card:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 12px 32px rgba(0,0,0,0.09);
      }
      /* Level 3 constraint chip hover pop */
      .constraint-chip {
        transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
      }
      .constraint-chip:hover {
        transform: scale(1.07);
        background: #FF4D5F !important;
        color: #fff !important;
      }
    `}</style>
  );
}

function Section({ children, className = "", id }) {
  const [ref, visible] = useInView(0.1);
  return (
    <section
      id={id}
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(48px)",
        transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {children}
    </section>
  );
}

/* ── Sticky Nav ── */
function Nav({ scrollY, activeSection }) {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Catalyst", href: "#catalyst" },
    { label: "Level 1", href: "#level1" },
    { label: "Level 2", href: "#level2" },
    { label: "Level 3", href: "#level3" },
    { label: "Staircase", href: "#staircase" },
    { label: "Start Building", href: "#tools" },
  ];
  const solid = scrollY > 60;
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: solid ? "rgba(0,47,175,0.95)" : "transparent",
        backdropFilter: solid ? "blur(12px)" : "none",
        borderBottom: solid ? "1px solid rgba(255,255,255,0.1)" : "none",
        transition: "background 0.3s, border 0.3s",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        <a
          href="#top"
          style={{
            color: COLORS.white,
            fontWeight: 800,
            fontSize: 15,
            textDecoration: "none",
            letterSpacing: 0.3,
          }}
        >
          Builder Mindset
        </a>

        {/* Desktop links */}
        <div
          style={{
            display: "flex",
            gap: 4,
          }}
          className="nav-links"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                color: activeSection === l.href.slice(1) ? COLORS.white : "rgba(255,255,255,0.75)",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                padding: "6px 10px",
                borderRadius: 6,
                transition: "color 0.2s, background 0.2s",
                background: activeSection === l.href.slice(1) ? "rgba(255,255,255,0.15)" : "transparent",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COLORS.white;
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              }}
              onMouseLeave={(e) => {
                const isActive = activeSection === l.href.slice(1);
                e.currentTarget.style.color = isActive ? COLORS.white : "rgba(255,255,255,0.75)";
                e.currentTarget.style.background = isActive ? "rgba(255,255,255,0.15)" : "transparent";
              }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 6,
            color: COLORS.white,
          }}
          className="hamburger"
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
            {open ? (
              <path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : (
              <>
                <rect y="4" width="22" height="2" rx="1" />
                <rect y="10" width="22" height="2" rx="1" />
                <rect y="16" width="22" height="2" rx="1" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            background: "rgba(0,47,175,0.95)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "12px 24px 20px",
          }}
          className="mobile-menu"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                color: "rgba(255,255,255,0.85)",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-links { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

/* ── Visual: Spreadsheet mock ── */
function SheetMockup() {
  const [sheetRef, sheetVisible] = useInView(0.05);
  const rows = [
    { name: "Alex", avail: "✓", team: "1", color: COLORS.tagGreenBg },
    { name: "Jamie", avail: "✓", team: "1", color: COLORS.tagGreenBg },
    { name: "Sam", avail: "✓", team: "2", color: COLORS.tagBlueBg },
    { name: "Riley", avail: "✗", team: "—", color: COLORS.tagYellowBg },
    { name: "Morgan", avail: "✓", team: "2", color: COLORS.tagBlueBg },
    { name: "Casey", avail: "✓", team: "3", color: COLORS.tagPinkBg },
  ];
  return (
    <div
      ref={sheetRef}
      style={{
        background: COLORS.white,
        borderRadius: 12,
        border: `1px solid ${COLORS.lightGray}`,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      {/* Sheet chrome */}
      <div
        style={{
          background: COLORS.surfaceGray,
          padding: "10px 16px",
          borderBottom: `1px solid ${COLORS.lightGray}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={COLORS.googleGreen}>
          <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.midGray }}>
          U7s Availability Tracker.xlsx
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            background: COLORS.blueTagBg,
            color: COLORS.slalomBlue,
            padding: "2px 8px",
            borderRadius: 4,
            fontWeight: 600,
          }}
        >
          Auto-assigned
        </span>
      </div>

      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 80px 80px",
          background: COLORS.surfaceLight,
          padding: "9px 16px",
          borderBottom: `1px solid ${COLORS.lightGray}`,
        }}
      >
        {["Player", "Available", "Team"].map((h) => (
          <div
            key={h}
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.darkGray,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Data rows */}
      {rows.map((r, i) => (
        <div
          key={r.name}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 80px 80px",
            padding: "9px 16px",
            borderBottom: `1px solid #f0f0f0`,
            background: r.avail === "✗" ? COLORS.surfaceLight : COLORS.white,
            opacity: sheetVisible ? 1 : 0,
            transform: sheetVisible ? "translateX(0)" : "translateX(-10px)",
            transition: `opacity 0.4s ease ${i * 70}ms, transform 0.4s ease ${i * 70}ms`,
          }}
        >
          <span style={{ fontSize: 14, color: COLORS.black, fontWeight: 500 }}>{r.name}</span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: r.avail === "✓" ? COLORS.tagGreenText : COLORS.darkGray,
            }}
          >
            {r.avail}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 6,
              background: r.avail === "✗" ? "transparent" : r.color,
              color: r.avail === "✗" ? COLORS.darkGray : COLORS.black,
            }}
          >
            {r.team}
          </span>
        </div>
      ))}

      <div
        style={{
          padding: "10px 16px",
          background: COLORS.surfaceLight,
          fontSize: 12,
          color: COLORS.darkGray,
          fontStyle: "italic",
        }}
      >
        =IF(C2="","—",VLOOKUP(C2,TeamTable,2,0)) — generated by ChatGPT
      </div>
    </div>
  );
}

/* ── Visual: Script buttons mock ── */
function ScriptMockup() {
  const [active, setActive] = useState(null);

  const buttons = [
    { label: "📋 Generate Fixtures", color: COLORS.slalomBlue },
    { label: "📱 Send WhatsApp Blast", color: COLORS.whatsappGreen },
    { label: "💳 Reconcile RFU Payments", color: COLORS.coralRed },
  ];

  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: 12,
        border: `1px solid ${COLORS.lightGray}`,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          background: COLORS.surfaceGray,
          padding: "10px 16px",
          borderBottom: `1px solid ${COLORS.lightGray}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={COLORS.googleGreen}>
          <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.midGray }}>
          U7s Admin Hub — One-Click Automations
        </span>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        {buttons.map((b) => (
          <button
            key={b.label}
            onClick={() => setActive(b.label)}
            style={{
              background: b.color,
              color: COLORS.white,
              border: `2px solid ${b.color}`,
              borderRadius: 8,
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {b.label}
            {active === b.label && (
              <span style={{ fontSize: 12, opacity: 0.9 }}>✓ Done</span>
            )}
          </button>
        ))}
        <div
          style={{
            marginTop: 4,
            padding: "10px 16px",
            background: COLORS.surfaceLight,
            borderRadius: 8,
            fontSize: 12,
            color: COLORS.darkGray,
            fontFamily: "monospace",
          }}
        >
          {active
            ? `> Running "${active}"... ✓ Complete`
            : "> Click a button to run a script"}
        </div>
      </div>
    </div>
  );
}

/* ── System demo gifs ── */
function SystemDemos() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, marginBottom: 32 }}>
      {[
        { src: "/Admin_Console1.gif", alt: "Admin Console demo 1", label: "Admin Console" },
        { src: "/Admin_Console2.gif", alt: "Admin Console demo 2", label: "Admin Console" },
        { src: "/Public_Fixture1.gif", alt: "Public Fixture View demo", label: "Public Fixture View" },
      ].map(({ src, alt, label }) => (
        <div key={src}>
          <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: 15, color: "#cbd5e1" }}>{label}</p>
          <img
            src={src}
            alt={alt}
            style={{ width: "100%", display: "block", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Visual: Tournament fixture app mock ── */
function TournamentMockup() {
  const teams = ["North Stars", "South Bears", "East Eagles", "West Wolves", "City Lions"];
  const fixtures = [
    { home: "North Stars", away: "East Eagles", pitch: "A", time: "09:00" },
    { home: "South Bears", away: "West Wolves", pitch: "B", time: "09:20" },
    { home: "City Lions", away: "North Stars", pitch: "A", time: "09:40" },
    { home: "East Eagles", away: "South Bears", pitch: "B", time: "10:00" },
    { home: "West Wolves", away: "City Lions", pitch: "C", time: "10:20" },
  ];
  const pitchColors = { A: COLORS.blueAccentBg, B: COLORS.tagGreenBg, C: COLORS.tagYellowBg };

  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: 12,
        border: `1px solid ${COLORS.lightGray}`,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      {/* App chrome */}
      <div
        style={{
          background: COLORS.slalomDark,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.white }}>
            Cheshire Minis 2024
          </div>
          <div style={{ fontSize: 11, color: COLORS.cyan, fontWeight: 600 }}>
            60 teams · 3 pitches · Auto-scheduled
          </div>
        </div>
        <div
          style={{
            background: COLORS.cyan,
            color: COLORS.slalomDark,
            padding: "4px 12px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          LIVE
        </div>
      </div>

      {/* Constraints bar */}
      <div
        style={{
          background: COLORS.surfaceLight,
          padding: "10px 20px",
          borderBottom: `1px solid ${COLORS.lightGray}`,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {["No club clashes", "Lunch 12:30–13:15", "Min 4 matches", "Dynamic drop-outs"].map(
          (c) => (
            <span
              key={c}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 99,
                background: COLORS.blueAccentBg,
                color: COLORS.slalomBlue,
              }}
            >
              ✓ {c}
            </span>
          )
        )}
      </div>

      {/* Fixture list */}
      <div style={{ padding: "12px 0" }}>
        {fixtures.map((f, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "52px 1fr auto 1fr 36px",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: COLORS.darkGray,
                fontFamily: "monospace",
              }}
            >
              {f.time}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.black, textAlign: "right" }}>
              {f.home}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: COLORS.darkGray,
                textAlign: "center",
              }}
            >
              vs
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.black }}>
              {f.away}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                textAlign: "center",
                padding: "4px 6px",
                borderRadius: 6,
                background: pitchColors[f.pitch],
                color: COLORS.black,
              }}
            >
              {f.pitch}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "10px 20px",
          background: COLORS.surfaceLight,
          fontSize: 12,
          color: COLORS.darkGray,
          fontStyle: "italic",
          borderTop: `1px solid ${COLORS.lightGray}`,
        }}
      >
        Built with Claude Code in &lt;1 hour · Constraint-satisfaction algorithm
      </div>
    </div>
  );
}

function StatCard({ value, label, index = 0 }) {
  const prefix = value.replace(/[0-9]/g, "");
  const numeric = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const [ref, count, visible] = useCountUp(numeric);
  const [popped, setPopped] = useState(false);
  const prevCount = useRef(0);
  useEffect(() => {
    if (count !== prevCount.current) {
      prevCount.current = count;
      if (count === numeric && numeric > 0) {
        setPopped(true);
        setTimeout(() => setPopped(false), 500);
      }
    }
  }, [count, numeric]);
  return (
    <div
      ref={ref}
      style={{
        background: COLORS.white,
        borderRadius: 12,
        padding: "32px 24px",
        textAlign: "center",
        border: `1px solid ${COLORS.lightGray}`,
        flex: "1 1 200px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        animation: `scaleIn 0.55s cubic-bezier(0.22,1,0.36,1) ${index * 130}ms both`,
      }}
    >
      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: COLORS.slalomBlue,
          lineHeight: 1,
          animation: popped ? "countPop 0.45s ease" : "none",
        }}
      >
        {prefix}{numeric === 0 ? value : count}
      </div>
      <div style={{ fontSize: 14, color: COLORS.darkGray, marginTop: 12, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

function ToolCard({ name, url, description, tag, index = 0 }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        background: COLORS.white,
        borderRadius: 12,
        padding: "24px",
        border: `1px solid ${COLORS.lightGray}`,
        textDecoration: "none",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        cursor: "pointer",
        animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 100}ms both`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.slalomBlue;
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(12,98,251,0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.lightGray;
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: COLORS.black }}>{name}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 99,
            background:
              tag === "Free"
                ? COLORS.tagGreenBg
                : tag === "Free tier"
                ? COLORS.tagBlueBg
                : COLORS.tagYellowBg,
            color:
              tag === "Free"
                ? COLORS.tagGreenText
                : tag === "Free tier"
                ? COLORS.tagBlueText
                : COLORS.tagYellowText,
          }}
        >
          {tag}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={COLORS.darkGray}
          strokeWidth="2"
          style={{ marginLeft: "auto", flexShrink: 0 }}
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </div>
      <div style={{ fontSize: 14, color: COLORS.darkGray, lineHeight: 1.5 }}>
        {description}
      </div>
    </a>
  );
}

function LevelBadge({ level, color, style: extraStyle }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: color,
        color: COLORS.white,
        padding: "6px 16px",
        borderRadius: 99,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 0.5,
        marginBottom: 16,
        ...extraStyle,
      }}
    >
      LEVEL {level}
    </div>
  );
}

function StaircaseStep({ level, title, tools, description, color, active, onClick, index = 0 }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        cursor: "pointer",
        padding: "24px",
        borderRadius: 12,
        border: active ? `2px solid ${color}` : `1px solid ${COLORS.lightGray}`,
        background: active ? `${color}10` : COLORS.white,
        transition: "border 0.3s ease, background 0.3s ease",
        outline: "none",
        animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 120}ms both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 99,
            background: color,
            color: COLORS.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {level}
        </div>
        <span style={{ fontWeight: 700, fontSize: 18, color: COLORS.black }}>{title}</span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: active ? color : COLORS.darkGray,
            transition: "color 0.3s",
          }}
        >
          {active ? "▲" : "▼"}
        </span>
      </div>
      <div style={{ fontSize: 13, color: COLORS.slalomBlue, fontWeight: 600, marginBottom: 4 }}>
        {tools}
      </div>
      <div
        style={{
          maxHeight: active ? 200 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}
      >
        <div style={{ fontSize: 14, color: COLORS.darkGray, lineHeight: 1.6, marginTop: 8 }}>
          {description}
        </div>
      </div>
    </div>
  );
}

/* ── Progress bar ── */
function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const h = () => {
      const el = document.documentElement;
      const progress =
        (el.scrollTop || document.body.scrollTop) /
        ((el.scrollHeight || document.body.scrollHeight) - el.clientHeight);
      setPct(Math.min(progress * 100, 100));
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        top: 56,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 99,
        background: "rgba(255,255,255,0.15)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: COLORS.cyan,
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
}

const SECTION_IDS = ["catalyst", "level1", "level2", "level3", "staircase", "tools"];

export default function App() {
  const [activeLevel, setActiveLevel] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const activeSection = useActiveSection(SECTION_IDS);
  const [l1Ref, , l1Anim] = useSectionReveal(0.06);
  const [l2Ref, , l2Anim] = useSectionReveal(0.06);
  const [l3Ref, , l3Anim] = useSectionReveal(0.06);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const wrap = {
    maxWidth: 900,
    margin: "0 auto",
    padding: "0 24px",
  };

  return (
    <div
      id="top"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: COLORS.black,
        background: COLORS.surfaceLight,
      }}
    >
      <GlobalStyles />
      <Nav scrollY={scrollY} activeSection={activeSection} />
      <ReadingProgress />

      {/* ─── HERO ─── */}
      <div
        style={{
          background: COLORS.slalomDark,
          color: COLORS.white,
          padding: "140px 24px 100px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: COLORS.slalomBlue,
            opacity: 0.2,
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: COLORS.cyan,
            opacity: 0.1,
            transform: `translateY(${scrollY * -0.05}px)`,
          }}
        />
        <div
          style={{ ...wrap, position: "relative", zIndex: 1 }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 2,
              color: COLORS.cyan,
              marginBottom: 24,
              textTransform: "uppercase",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease 100ms, transform 0.6s ease 100ms",
            }}
          >
            A personal perspective
          </div>
          <h1
            id="hero-title"
            style={{
              fontSize: "clamp(40px, 7vw, 72px)",
              fontWeight: 800,
              lineHeight: 1.05,
              margin: "0 0 28px",
              color: "#ffffff",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(28px)",
              transition: "opacity 0.7s ease 260ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) 260ms",
            }}
          >
            The Builder<br />Mindset
          </h1>
          <p
            style={{
              fontSize: "clamp(17px, 2.5vw, 21px)",
              lineHeight: 1.65,
              color: "rgba(255,255,255,0.85)",
              maxWidth: 600,
              margin: "0 0 36px",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease 420ms, transform 0.6s ease 420ms",
            }}
          >
            Experiment with AI. Build rapid prototypes. Develop new skills that keep
            us current — and differentiate how we deliver.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.6s ease 560ms, transform 0.6s ease 560ms",
            }}
          >
            {["Experiment", "Prototype", "Differentiate"].map((w) => (
              <span
                key={w}
                style={{
                  padding: "8px 20px",
                  borderRadius: 99,
                  border: "1px solid rgba(255,255,255,0.3)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.white,
                  backdropFilter: "blur(4px)",
                }}
              >
                {w}
              </span>
            ))}
          </div>

          {/* Scroll cue */}
          <div
            style={{
              marginTop: 56,
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
              fontWeight: 500,
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.6s ease 700ms",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ animation: "bounce 2s infinite" }}
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
            Scroll to explore
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>

      {/* ─── CATALYST ─── */}
      <Section id="catalyst">
        <div style={{ ...wrap, padding: "80px 24px" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 2,
              color: COLORS.slalomBlue,
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            The Catalyst
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              margin: "0 0 16px",
              lineHeight: 1.2,
            }}
          >
            Under-7s Rugby Chaos
          </h2>
          <p
            style={{
              fontSize: 17,
              color: COLORS.darkGray,
              lineHeight: 1.7,
              maxWidth: 650,
              marginBottom: 40,
            }}
          >
            Volunteering as U7s Team Manager seemed simple — just confirm who could
            play each week and order the right amount of the hotdogs for post-match
            meals. The reality was a torrent of admin: reconciling RFU registrations
            and payments, tracking weekly availability, chasing parents, allocating
            children to teams, creating fixture schedules and broadcasting updates to
            parents.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                background: COLORS.white,
                borderRadius: 12,
                padding: 24,
                border: `1px solid ${COLORS.lightGray}`,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.coralRed,
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                The Expectation
              </div>
              <p style={{ fontSize: 15, color: COLORS.darkGray, lineHeight: 1.6, margin: 0 }}>
                Count hotdogs. Confirm Sunday numbers. Easy.
              </p>
            </div>
            <div
              style={{
                background: COLORS.white,
                borderRadius: 12,
                padding: 24,
                border: `1px solid ${COLORS.lightGray}`,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.slalomBlue,
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                The Reality
              </div>
              <p style={{ fontSize: 15, color: COLORS.darkGray, lineHeight: 1.6, margin: 0 }}>
                RFU reconciliation, availability tracking, fixture generation, WhatsApp
                broadcasts, payment chasing...
              </p>
            </div>
          </div>
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.slalomDark} 0%, ${COLORS.slalomBlue} 100%)`,
              borderRadius: 12,
              padding: 24,
              color: COLORS.white,
            }}
          >
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
              💡 How can technology solve a weekend headache — without requiring a
              software degree?
            </p>
          </div>
        </div>
      </Section>

      {/* ─── LEVEL 1 ─── */}
      <Section id="level1">
        <div style={{ background: COLORS.white }}>
          <div ref={l1Ref} style={{ ...wrap, padding: "80px 24px" }}>
            <LevelBadge level={1} color={COLORS.darkGray} style={l1Anim("slideInLeft", 0)} />
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 800,
                margin: "0 0 8px",
                lineHeight: 1.2,
                ...l1Anim("fadeUp", 80),
              }}
            >
              Formulas
            </h2>
            <p
              style={{
                fontSize: 14,
                color: COLORS.slalomBlue,
                fontWeight: 600,
                marginBottom: 16,
                ...l1Anim("fadeUp", 160),
              }}
            >
              ChatGPT + Google Sheets
            </p>
            <p
              style={{
                fontSize: 17,
                color: COLORS.darkGray,
                lineHeight: 1.7,
                maxWidth: 650,
                marginBottom: 32,
                ...l1Anim("fadeUp", 240),
              }}
            >
              Parents submit availability via Google Forms. The data flows into a
              spreadsheet — but allocating players to teams needed complex formulas.
              Plain English descriptions of tab names, field names, and desired outcomes
              went into ChatGPT. Working formulas came back.
            </p>

            <div
              style={{
                margin: "32px 0",
                padding: "20px 24px",
                borderLeft: `4px solid ${COLORS.slalomBlue}`,
                background: COLORS.blueAccentBg,
                borderRadius: "0 12px 12px 0",
                ...l1Anim("slideInLeft", 340),
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: COLORS.slalomBlue,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  marginBottom: 6,
                }}
              >
                The Result
              </div>
              <p
                style={{
                  fontSize: 17,
                  color: COLORS.slalomDark,
                  lineHeight: 1.6,
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                All the coach has to do is add a number next to the name of each player
                and it assigns them to the corresponding team in the table to the right.
              </p>
            </div>

            <img
              src="/TeamAssignment.gif"
              alt="Team assignment demo"
              style={{ width: "100%", borderRadius: 12, marginBottom: 24, ...l1Anim("fadeUp", 420) }}
            />

            <div style={l1Anim("scaleIn", 500)}>
              <SheetMockup />
            </div>

            <div
              style={{
                marginTop: 24,
                padding: 24,
                background: COLORS.surfaceLight,
                borderRadius: 12,
                border: `1px solid ${COLORS.lightGray}`,
                ...l1Anim("fadeUp", 580),
              }}
            >
              <p style={{ fontSize: 14, color: COLORS.darkGray, margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: COLORS.black }}>Key insight:</strong> The
                technical barrier is gone. If you can articulate the logic, the AI
                writes the syntax.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── LEVEL 2 ─── */}
      <Section id="level2">
        <div ref={l2Ref} style={{ ...wrap, padding: "80px 24px" }}>
          <LevelBadge level={2} color={COLORS.slalomBlue} style={l2Anim("slideInLeft", 0)} />
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              margin: "0 0 8px",
              lineHeight: 1.2,
              ...l2Anim("fadeUp", 80),
            }}
          >
            Scripts
          </h2>
          <p
            style={{
              fontSize: 14,
              color: COLORS.slalomBlue,
              fontWeight: 600,
              marginBottom: 16,
              ...l2Anim("fadeUp", 160),
            }}
          >
            ChatGPT + Google Apps Script
          </p>
          <p
            style={{
              fontSize: 17,
              color: COLORS.darkGray,
              lineHeight: 1.7,
              maxWidth: 650,
              marginBottom: 32,
              ...l2Anim("fadeUp", 240),
            }}
          >
            Formulas weren't enough. Three one-click scripts handled the jobs that were
            eating hours of manual admin — fixture scheduling, parent comms, and
            membership reconciliation — all running directly from the spreadsheet.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
              marginBottom: 40,
            }}
          >
            {[
              {
                from: "Team availability & pitch slots",
                via: "Fixture Generator Script",
                to: "Auto-scheduled fixture list",
              },
              {
                from: "Match details & day updates",
                via: "One-button WhatsApp Draft",
                to: "Ready-to-send parent comms",
              },
              {
                from: "RFU membership export vs player roster",
                via: "Reconciliation Script",
                to: "Paid / unpaid status per player",
              },
            ].map((p, i) => (
              <div
                key={i}
                className="level-card"
                style={{
                  background: COLORS.white,
                  borderRadius: 12,
                  padding: 24,
                  border: `1px solid ${COLORS.lightGray}`,
                  ...l2Anim("fadeUp", 320 + i * 90),
                }}
              >
                <div style={{ fontSize: 12, color: COLORS.darkGray, marginBottom: 6 }}>
                  {p.from}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: COLORS.slalomBlue,
                    margin: "8px 0",
                  }}
                >
                  → {p.via}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.black }}>
                  {p.to}
                </div>
              </div>
            ))}
          </div>

          <div style={l2Anim("scaleIn", 600)}>
            <ScriptMockup />
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 24,
              background: COLORS.white,
              borderRadius: 12,
              border: `1px solid ${COLORS.lightGray}`,
              ...l2Anim("fadeUp", 680),
            }}
          >
            <p style={{ fontSize: 14, color: COLORS.darkGray, margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: COLORS.black }}>Key takeaway:</strong> Every
              manual admin task is a structured logic puzzle waiting to be automated.
            </p>
          </div>
        </div>
      </Section>

      {/* ─── LEVEL 3 ─── */}
      <Section id="level3">
        <div style={{ background: COLORS.white }}>
          <div ref={l3Ref} style={{ ...wrap, padding: "80px 24px" }}>
            <LevelBadge level={3} color={COLORS.coralRed} style={l3Anim("slideInLeft", 0)} />
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 800,
                margin: "0 0 8px",
                lineHeight: 1.2,
                ...l3Anim("fadeUp", 80),
              }}
            >
              The Crucible
            </h2>
            <p
              style={{
                fontSize: 14,
                color: COLORS.coralRed,
                fontWeight: 600,
                marginBottom: 16,
                ...l3Anim("fadeUp", 160),
              }}
            >
              Claude Code — 70+ Teams, 1 App, 1 Hour
            </p>
            <p
              style={{
                fontSize: 17,
                color: COLORS.darkGray,
                lineHeight: 1.7,
                maxWidth: 650,
                marginBottom: 32,
                ...l3Anim("fadeUp", 240),
              }}
            >
              The annual Cheshire Minis tournament: organising match scheduling for 70+ teams —
              a number that fluctuated by the day in the run-up. Normally fixture planning
              starts weeks out. We took our learnings and newfound confidence and built a web
              app embedded directly in the club's Google Sites. An admin panel let you control
              the variables, reschedule fixtures at the click of a button when a team dropped
              in or out, and handle a web of competing constraints simultaneously. Within one
              hour, Claude Code produced a working prototype that handled it all. Admittedly
              a good chunk of time went into refining the UX — but it was a revelation.
            </p>

            {/* Constraint chips */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.darkGray, marginBottom: 12, ...l3Anim("fadeUp", 320) }}>
                Constraints handled automatically
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  "Pitch allocation",
                  "Lunch break windows",
                  "No repeat opponents from same club",
                  "Minimum rest time between fixtures",
                  "Referee assignments",
                  "Refs don't officiate their own team",
                  "Refs free when officiating",
                  "Dynamic rescheduling",
                ].map((c, i) => (
                  <span
                    key={c}
                    className="constraint-chip"
                    style={{
                      padding: "6px 14px",
                      borderRadius: 99,
                      fontSize: 13,
                      fontWeight: 600,
                      background: COLORS.coralAccentBg,
                      color: COLORS.coralRed,
                      display: "inline-block",
                      ...l3Anim("popIn", 360 + i * 45),
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Stat card + mockup row */}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "start", marginBottom: 32 }}>
              <div style={{
                background: COLORS.coralRed,
                borderRadius: 16,
                padding: "36px 28px",
                color: COLORS.white,
                textAlign: "center",
                minWidth: 160,
                ...l3Anim("popIn", 380),
              }}>
                <div style={{ fontSize: "clamp(52px, 8vw, 72px)", fontWeight: 900, lineHeight: 1 }}>1h</div>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 8, lineHeight: 1.4 }}>
                  to a working prototype handling all constraints
                </div>
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.25)", fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Powered by Claude Code
                </div>
              </div>

            </div>

            {/* Screenshots carousel */}
            <div style={l3Anim("fadeUp", 500)}>
              <SystemDemos />
            </div>

            <div
              style={{
                padding: "20px 24px",
                background: COLORS.surfaceLight,
                borderRadius: 12,
                border: `1px solid ${COLORS.lightGray}`,
                borderLeft: `4px solid ${COLORS.coralRed}`,
                ...l3Anim("fadeUp", 580),
              }}
            >
              <p style={{ fontSize: 14, color: COLORS.darkGray, margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: COLORS.black }}>Key takeaway:</strong> Prototyping
                complex logic is no longer measured in weeks, but in hours. The revelation
                wasn't just the speed — it was realising that with the right tools, complexity
                stops being a reason not to try.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── CAPABILITY STAIRCASE ─── */}
      <Section id="staircase">
        <div style={{ ...wrap, padding: "80px 24px" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 2,
              color: COLORS.slalomBlue,
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            The Capability Staircase
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              margin: "0 0 32px",
              lineHeight: 1.2,
            }}
          >
            Zero technical skill required.
            <br />
            At every level.
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            <StaircaseStep
              index={0}
              level={1}
              title="Formulas"
              tools="ChatGPT + Sheets"
              color={COLORS.darkGray}
              description="Use plain English to write complex Google Sheet formulas for data organisation and team allocation."
              active={activeLevel === 1}
              onClick={() => setActiveLevel(activeLevel === 1 ? null : 1)}
            />
            <StaircaseStep
              index={1}
              level={2}
              title="Scripts"
              tools="Apps Script"
              color={COLORS.slalomBlue}
              description="Generate custom scripts to automate tasks — send messages, reconcile databases — via one-click buttons."
              active={activeLevel === 2}
              onClick={() => setActiveLevel(activeLevel === 2 ? null : 2)}
            />
            <StaircaseStep
              index={2}
              level={3}
              title="Web Apps"
              tools="Claude Code + Google Sites"
              color={COLORS.coralRed}
              description="Deploy Claude Code to process dynamic constraints and build functional web interfaces. Chain simple tools into an MVP architecture."
              active={activeLevel === 3}
              onClick={() => setActiveLevel(activeLevel === 3 ? null : 3)}
            />
          </div>
          <div
            style={{
              marginTop: 24,
              padding: 24,
              background: COLORS.white,
              borderRadius: 12,
              border: `1px solid ${COLORS.lightGray}`,
            }}
          >
            <p style={{ fontSize: 14, color: COLORS.darkGray, margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: COLORS.black }}>The limiting factor</strong> is no
              longer technical skill — it's imagination and logical definition.
            </p>
          </div>
        </div>
      </Section>

      {/* ─── THE BIGGER PICTURE ─── */}
      <Section>
        <div style={{ background: "#080f1f", color: COLORS.white }}>
          <div style={{ ...wrap, padding: "100px 24px" }}>

            {/* Header row */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 64 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: COLORS.cyan, textTransform: "uppercase" }}>
                The Bigger Picture
              </div>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 900, margin: 0, lineHeight: 1.1, maxWidth: 700 }}>
                A New Essential Skill<br />
                <span style={{ color: COLORS.cyan }}>for Consultants</span>
              </h2>
            </div>

            {/* Three principle cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 2, marginBottom: 2 }}>
              {[
                {
                  number: "01",
                  heading: "Lean In & Build",
                  body: "We should be the team that actually uses AI — not just talks about it. Experiment, make things, find the edges of what's possible.",
                  accent: COLORS.cyan,
                },
                {
                  number: "02",
                  heading: "Develop Real Fluency",
                  body: "Learn what these tools can do and where they fall short. Develop a depth our clients don't yet have — that gap is where our value lives.",
                  accent: COLORS.chartreuse,
                },
                {
                  number: "03",
                  heading: "Stay Ahead",
                  body: "The consultants who remain relevant will be the ones who can move fast, show quickly, and build credibility before the first invoice.",
                  accent: COLORS.purple,
                },
              ].map(({ number, heading, body, accent }) => (
                <div
                  key={number}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid rgba(255,255,255,0.08)`,
                    borderTop: `3px solid ${accent}`,
                    padding: "36px 28px",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: accent, marginBottom: 16 }}>{number}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{heading}</div>
                  <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{body}</div>
                </div>
              ))}
            </div>

            {/* Pull quote */}
            <div
              style={{
                borderLeft: `4px solid ${COLORS.cyan}`,
                padding: "32px 40px",
                background: "rgba(27,225,242,0.05)",
                marginTop: 48,
                marginBottom: 48,
              }}
            >
              <p style={{ fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 700, lineHeight: 1.5, margin: 0, maxWidth: 780 }}>
                "Think about how central PowerPoint became to consulting. I think we're heading somewhere similar. The ability to spin up a working app — quickly, in response to a client problem — could become just as fundamental."
              </p>
            </div>

            {/* Two role cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
              {[
                {
                  label: "For the Team",
                  rows: [
                    ["Focus", "Learning by doing"],
                    ["Toolset", "AI prototyping & rapid builds"],
                    ["Outcome", "Fluency that keeps us relevant"],
                  ],
                },
                {
                  label: "For Clients",
                  rows: [
                    ["Focus", "Bespoke working prototypes"],
                    ["Toolset", "Dynamic apps over static decks"],
                    ["Outcome", "Faster buy-in & a validated target"],
                  ],
                },
              ].map(({ label, rows }) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 12,
                    padding: 28,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 20 }}>
                    {label}
                  </div>
                  {rows.map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 14 }}>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{k}</span>
                      <span style={{ color: COLORS.white, textAlign: "right" }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Bottom banner */}
            <div
              style={{
                padding: "28px 32px",
                borderRadius: 12,
                background: `linear-gradient(135deg, ${COLORS.slalomDark} 0%, ${COLORS.slalomBlue} 100%)`,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ width: 4, height: 40, background: COLORS.cyan, borderRadius: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 15, margin: 0, lineHeight: 1.6, color: COLORS.white }}>
                This isn't a side project. It's how we future-proof ourselves as consultants — and bring something genuinely new to every client conversation.{" "}
                <strong>Building is the new deck.</strong>
              </p>
            </div>

          </div>
        </div>
      </Section>

      {/* ─── THE INVESTMENT ─── */}
      <Section>
        <div style={{ ...wrap, padding: "80px 24px" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 2,
              color: COLORS.slalomBlue,
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            The Investment
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              margin: "0 0 32px",
              lineHeight: 1.2,
            }}
          >
            An Investment of Curiosity
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
            <StatCard index={0} value="0" label="Lines of Code Written Manually" />
            <StatCard index={1} value="0" label="Hours of Formal Technical Training" />
            <StatCard index={2} value="$20" label="Total Financial Investment (Claude subscription)" />
          </div>
          <div
            style={{
              padding: 24,
              background: COLORS.white,
              borderRadius: 12,
              border: `1px solid ${COLORS.lightGray}`,
            }}
          >
            <p style={{ fontSize: 14, color: COLORS.darkGray, margin: 0, lineHeight: 1.6 }}>
              The only requirement to build custom, dynamic tooling is curiosity. The
              hard work is done — prototypes can now be rinsed and repeated for future
              engagements.
            </p>
          </div>
        </div>
      </Section>

      {/* ─── WHERE TO START ─── */}
      <Section id="tools">
        <div style={{ background: COLORS.white }}>
          <div style={{ ...wrap, padding: "80px 24px" }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 2,
                color: COLORS.slalomBlue,
                marginBottom: 12,
                textTransform: "uppercase",
              }}
            >
              Where to Start
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 800,
                margin: "0 0 8px",
                lineHeight: 1.2,
              }}
            >
              Pick a tool. Give it 30 minutes.
              <br />
              Build something.
            </h2>
            <p
              style={{
                fontSize: 17,
                color: COLORS.darkGray,
                lineHeight: 1.7,
                maxWidth: 650,
                marginBottom: 40,
              }}
            >
              You don't need a plan. You don't need permission. Open one of these,
              describe something you wish existed, and see what happens.
            </p>

            <div style={{ marginBottom: 36 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.black,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: COLORS.tagGreenText,
                    display: "inline-block",
                  }}
                />
                Just Curious — Prompt to App, No Setup
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                <ToolCard
                  index={0}
                  name="Lovable"
                  url="https://lovable.dev"
                  tag="Free tier"
                  description="Describe an app in plain English, get a working prototype in minutes. The fastest way to see what's possible."
                />
                <ToolCard
                  index={1}
                  name="Bolt.new"
                  url="https://bolt.new"
                  tag="Free tier"
                  description="Browser-based app builder by StackBlitz. Full-stack from a single prompt — frontend, backend, database."
                />
                <ToolCard
                  index={2}
                  name="v0"
                  url="https://v0.dev"
                  tag="Free tier"
                  description="Vercel's AI builder. Generates production-grade Next.js UI from descriptions. Great for polished interfaces."
                />
              </div>
            </div>

            <div style={{ marginBottom: 36 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.black,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: COLORS.slalomBlue,
                    display: "inline-block",
                  }}
                />
                Ready to Script — Automate What You Already Use
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                <ToolCard
                  index={0}
                  name="Google Apps Script + ChatGPT"
                  url="https://script.google.com"
                  tag="Free"
                  description="Describe what you want automated in your spreadsheet. Paste the generated script into Apps Script. Press a button."
                />
                <ToolCard
                  index={1}
                  name="Replit"
                  url="https://replit.com"
                  tag="Free tier"
                  description="Full cloud IDE with an AI agent. Build and run apps entirely in the browser with collaboration built in."
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.black,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: COLORS.coralRed,
                    display: "inline-block",
                  }}
                />
                Ready to Build — Full Applications
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                <ToolCard
                  index={0}
                  name="Claude Code"
                  url="https://docs.anthropic.com/en/docs/claude-code"
                  tag="~$20/mo"
                  description="Terminal-based AI that reads, writes, and refactors entire codebases. The power tool behind the tournament app."
                />
                <ToolCard
                  index={1}
                  name="Cursor"
                  url="https://cursor.com"
                  tag="Free tier"
                  description="AI-native code editor. Deep codebase awareness, multi-file changes, and inline generation from natural language."
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── CLOSING CTA ─── */}
      <div
        style={{
          background: COLORS.slalomDark,
          color: COLORS.white,
          padding: "100px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: COLORS.slalomBlue,
            opacity: 0.08,
          }}
        />
        <div style={{ ...wrap, position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 800,
              margin: "0 0 16px",
              lineHeight: 1.15,
            }}
          >
            You already have the logic.
          </h2>
          <p
            style={{
              fontSize: "clamp(20px, 3vw, 28px)",
              fontWeight: 600,
              color: COLORS.cyan,
              margin: "0 0 48px",
            }}
          >
            Now you have the tools. Go build.
          </p>
          <a
            href="#tools"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              borderRadius: 99,
              background: COLORS.cyan,
              color: COLORS.slalomDark,
              fontWeight: 800,
              fontSize: 16,
              textDecoration: "none",
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Choose a tool →
          </a>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              margin: "40px 0 0",
              fontStyle: "italic",
            }}
          >
            P.s. This entire microsite took 5 minutes to build using Claude
          </p>
        </div>
      </div>
    </div>
  );
}
