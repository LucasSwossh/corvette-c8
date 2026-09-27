import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Lightning,
  Timer,
  Gauge,
  Speedometer,
  Wind,
  Ruler,
  ArrowsOutSimple,
  GearSix,
  Armchair,
  Waves,
  MonitorPlay,
  ArrowUp,
  InstagramLogo,
  TiktokLogo,
} from '@phosphor-icons/react';
import useVideoScrubber from './useVideoScrubber.js';

gsap.registerPlugin(ScrollTrigger);

/* ──────────────────────────────────────────────
   UTILITY HOOKS & REVEAL HELPERS
────────────────────────────────────────────── */
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.classList.add('visible');
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/* ── Motion helpers (GSAP entrances & subtle scroll depth) ── */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isMobile = () =>
  window.matchMedia('(max-width: 768px)').matches;

/* Displacements are halved on small screens */
const motionY = (v) => (isMobile() ? Math.round(v * 0.5) : v);

/* Runs a GSAP builder scoped to the element. Skipped entirely when the
   user prefers reduced motion — elements simply rest in their final state. */
function useGsapScope(builder) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => builder(el), el);
    return () => ctx.revert();
  }, []);
  return ref;
}

/* Entrance timeline: plays when the trigger enters the viewport and
   reverses when scrolling back above it (reversible, never a pin). */
function enterTimeline(el, start = 'top 75%') {
  return gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start,
      toggleActions: 'play none none reverse',
    },
  });
}

function RevealImage({ src, alt, className = 'section-image', direction = 'right', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(el, { opacity: 1, x: 0 });
      return;
    }
    const xFrom = direction === 'right' ? 50 : -50;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      onEnter: () =>
        gsap.fromTo(
          el,
          { opacity: 0, x: xFrom },
          { opacity: 1, x: 0, duration: 1.0, delay, ease: 'power3.out' }
        ),
    });
    return () => trigger.kill();
  }, [direction]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      <img src={src} alt={alt} loading="lazy" />
    </div>
  );
}

/* ──────────────────────────────────────────────
   NAVBAR
────────────────────────────────────────────── */
function Nav() {
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      navRef.current?.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Compact mobile menu — closes on Esc, outside tap or returning to desktop */
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const onPointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const scrollToSection = (e, targetId) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav ref={navRef} className={`nav${menuOpen ? ' menu-open' : ''}`} role="navigation" aria-label="Navegação principal">
      <div className="nav-inner">
        <a href="#hero" className="nav-brand" aria-label="Chevrolet Corvette">
          <img
            className="nav-brand-bowtie"
            src="https://www.chevrolet.com/content/dam/chevrolet/na/us/english/portable-nav/chevrolet-bowtie-120.svg"
            alt="Logotipo Chevrolet"
            width="42"
          />
          <span className="nav-brand-label">Corvette C8</span>
        </a>
        <ul id="nav-menu" className={`nav-links${menuOpen ? ' open' : ''}`}>
          <li><a href="#ruptura" onClick={(e) => scrollToSection(e, 'ruptura')}>A Ruptura</a></li>
          <li><a href="#estrutura" onClick={(e) => scrollToSection(e, 'estrutura')}>Estrutura</a></li>
          <li><a href="#lt2" onClick={(e) => scrollToSection(e, 'lt2')}>O LT2</a></li>
          <li><a href="#performance" onClick={(e) => scrollToSection(e, 'performance')}>Dinâmica</a></li>
          <li><a href="#aerodinamica" onClick={(e) => scrollToSection(e, 'aerodinamica')}>Design &amp; Ar</a></li>
          <li><a href="#cockpit" onClick={(e) => scrollToSection(e, 'cockpit')}>O Piloto</a></li>
          <li><a href="#z51" onClick={(e) => scrollToSection(e, 'z51')}>Pacote Z51</a></li>
          <li><a href="#configuracoes" onClick={(e) => scrollToSection(e, 'configuracoes')}>Configurações</a></li>
        </ul>
        <div className="nav-actions">
          <a
            id="nav-explore-cta"
            className="nav-cta"
            href="#ruptura"
            onClick={(e) => scrollToSection(e, 'ruptura')}
          >
            Explorar C8
          </a>
          <button
            type="button"
            className={`nav-toggle${menuOpen ? ' is-open' : ''}`}
            aria-label={menuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ──────────────────────────────────────────────
   01 — HERO (SCROLL-DRIVEN CORVETTE DECONSTRUCTION)
   6 Cinematic Contextual Information States
────────────────────────────────────────────── */
const HERO_STATES = [
  {
    id: 'state-01',
    phase: 'VISÃO GERAL',
    title: 'CORVETTE C8',
    tagline: 'O ÍCONE, REIMAGINADO.',
    desc: 'Uma nova interpretação do Corvette, combinando design, tecnologia e uma arquitetura de motor central-traseira.',
    range: [0.00, 0.00, 0.08, 0.16],
  },
  {
    id: 'state-02',
    phase: 'AERODINÂMICA',
    title: 'AERODINÂMICA ESCULPIDA',
    desc: 'Cada superfície do Corvette combina presença visual com uma função dentro do conjunto aerodinâmico.',
    range: [0.14, 0.20, 0.29, 0.35],
  },
  {
    id: 'state-03',
    phase: 'COCKPIT',
    title: 'TUDO AO REDOR DO MOTORISTA',
    desc: 'O cockpit do C8 coloca o motorista no centro da experiência, com comandos, instrumentos e elementos da cabine orientados para quem está ao volante.',
    range: [0.33, 0.39, 0.49, 0.55],
  },
  {
    id: 'state-04',
    phase: 'MID-ENGINE',
    title: 'O MOTOR MUDOU DE LUGAR',
    desc: 'Uma das maiores mudanças do C8 está em sua arquitetura: o conjunto motriz passou para uma posição central-traseira, alterando a distribuição de massa e a dinâmica do carro.',
    range: [0.53, 0.59, 0.69, 0.75],
  },
  {
    id: 'state-05',
    phase: 'EXPLODED ARCHITECTURE',
    title: 'CADA COMPONENTE TEM UM PAPEL',
    desc: 'Chassi, motor, suspensão, rodas, cabine e carroceria revelam como diferentes sistemas trabalham juntos para formar o Corvette C8.',
    range: [0.73, 0.79, 0.87, 0.92],
  },
  {
    id: 'state-06',
    phase: 'FULL EXPLODED VIEW',
    title: 'CORVETTE C8',
    tagline: 'DESCONSTRUÍDO ATÉ SUA ESSÊNCIA.',
    desc: 'ENGINEERING • DESIGN • PERFORMANCE',
    isMinimal: true,
    range: [0.90, 0.95, 1.00, 1.10],
  },
];

function getStateStyle(p, [enterStart, peakStart, peakEnd, exitEnd]) {
  if (p < enterStart) {
    return { opacity: 0, y: 22, blur: 8, pointerEvents: 'none', visibility: 'hidden' };
  }
  if (p < peakStart) {
    const t = (p - enterStart) / (peakStart - enterStart || 0.001);
    return {
      opacity: t,
      y: 22 * (1 - t),
      blur: (1 - t) * 8,
      pointerEvents: t > 0.6 ? 'auto' : 'none',
      visibility: 'visible',
    };
  }
  if (p <= peakEnd) {
    return {
      opacity: 1,
      y: 0,
      blur: 0,
      pointerEvents: 'auto',
      visibility: 'visible',
    };
  }
  if (p < exitEnd) {
    const t = (p - peakEnd) / (exitEnd - peakEnd || 0.001);
    return {
      opacity: 1 - t,
      y: -22 * t,
      blur: t * 8,
      pointerEvents: 1 - t > 0.6 ? 'auto' : 'none',
      visibility: 'visible',
    };
  }
  return { opacity: 0, y: -22, blur: 8, pointerEvents: 'none', visibility: 'hidden' };
}

/** Asset frame rate (see process_video.ps1) — used by the scrubbing engine. */
const VIDEO_FPS = 24;

function Hero() {
  const containerRef = useRef(null);
  const pinnedRef    = useRef(null);
  const videoRef     = useRef(null);
  const stateRefs    = useRef([]);
  const hudRef       = useRef(null);
  const scrollCueRef = useRef(null);
  const hudFillRef   = useRef(null);
  const counterRef   = useRef(null);
  const phaseTextRef = useRef(null);

  /* Scroll → seek pipeline: coalescing, readiness gate and mobile priming.
     The choreography (progress → time mapping) stays in this component. */
  const scrubber = useVideoScrubber(videoRef, { fps: VIDEO_FPS });

  useEffect(() => {
    const container = containerRef.current;
    const pinned    = pinnedRef.current;
    if (!container || !pinned) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Entrance animation */
    if (!reduced) {
      gsap.timeline({ delay: 0.25 })
        .fromTo(stateRefs.current[0], { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0)
        .fromTo(hudRef.current, { opacity: 0 }, { opacity: 1, duration: 1.0, ease: 'power2.out' }, 0.4);
    } else {
      if (stateRefs.current[0]) {
        stateRefs.current[0].style.opacity = '1';
        stateRefs.current[0].style.visibility = 'visible';
        stateRefs.current[0].style.pointerEvents = 'auto';
      }
      if (hudRef.current) hudRef.current.style.opacity = '1';
    }

    const TOTAL_FRAMES = 192;

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=350%',
      pin: pinned,
      pinSpacing: true,
      scrub: 1.2,
      anticipatePin: 1,
      onUpdate(self) {
        const p = self.progress;

        /* Seek video with stable dwell at final frame — delegated to the
           scrubber: coalesced seeks, readiness gating, never two in flight.
           The progress → time mapping is identical to the approved desktop. */
        const dur = scrubber.getDuration();
        if (dur > 0) {
          const maxVideoTime = Math.max(0, dur - 0.04);
          // Video completes its deconstruction at 92% scroll,
          // remaining stable and steady through 100% for full exploded viewing.
          const videoProgress = Math.min(1, p / 0.92);
          const targetTime = videoProgress * maxVideoTime;
          if (isFinite(targetTime)) scrubber.setTarget(targetTime);
        }

        /* HUD updates */
        if (hudFillRef.current) {
          hudFillRef.current.style.width = `${(p * 100).toFixed(1)}%`;
        }
        if (counterRef.current) {
          const videoProgress = Math.min(1, p / 0.92);
          const currentFrame = Math.min(TOTAL_FRAMES, Math.floor(videoProgress * (TOTAL_FRAMES - 1)) + 1);
          counterRef.current.textContent = `${String(currentFrame).padStart(3, '0')} / ${TOTAL_FRAMES}`;
        }
        if (phaseTextRef.current) {
          phaseTextRef.current.textContent =
            p < 0.15 ? 'VISÃO GERAL' :
            p < 0.34 ? 'AERODINÂMICA' :
            p < 0.54 ? 'COCKPIT' :
            p < 0.74 ? 'MID-ENGINE' :
            p < 0.91 ? 'EXPLODED ARCHITECTURE' :
                       'FULL EXPLODED VIEW';
        }

        /* Fade scroll cue on initial scroll */
        if (scrollCueRef.current) {
          scrollCueRef.current.style.opacity = Math.max(0, 1 - p / 0.05);
        }

        /* Update contextual information states */
        if (!reduced) {
          HERO_STATES.forEach((state, idx) => {
            const el = stateRefs.current[idx];
            if (!el) return;
            const style = getStateStyle(p, state.range);
            el.style.opacity = style.opacity;
            el.style.transform = `translateY(${style.y}px)`;
            el.style.filter = `blur(${style.blur.toFixed(1)}px)`;
            el.style.pointerEvents = style.pointerEvents;
            el.style.visibility = style.visibility;
          });
        }
      },
    });

    return () => {
      st.kill();
    };
    // `scrubber` is a stable API object (created once), so this effect still
    // runs a single time — same as the previous `[]` behaviour.
  }, [scrubber]);

  const scrollToNext = (e, targetId) => {
    e?.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" ref={containerRef} className="hero-scroll-container" aria-label="Corvette C8 — Desconstrução Cinematográfica">
      <div ref={pinnedRef} className="hero-pinned-viewport">
        <video
          ref={videoRef}
          className="hero-video"
          src="/corvette_scroll_5s_scrub.mp4"
          poster="/corvette_scroll_poster.jpg"
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
          aria-hidden="true"
        />
        <div className="hero-overlay" aria-hidden="true" />

        {/* Editorial Presentation Area with 6 Synchronized States */}
        <div className="hero-editorial-zone">
          {HERO_STATES.map((state, idx) => (
            <div
              key={state.id}
              ref={(el) => { stateRefs.current[idx] = el; }}
              className={`hero-state-editorial ${state.isMinimal ? 'state-minimal' : ''}`}
              style={{
                opacity: idx === 0 ? 1 : 0,
                transform: idx === 0 ? 'translateY(0px)' : 'translateY(22px)',
                filter: idx === 0 ? 'blur(0px)' : 'blur(8px)',
                pointerEvents: idx === 0 ? 'auto' : 'none',
                visibility: idx === 0 ? 'visible' : 'hidden',
              }}
            >
              <h1 className="hero-state-title">{state.title}</h1>
              {state.tagline && <div className="hero-state-tagline">{state.tagline}</div>}
              <p className="hero-state-desc">{state.desc}</p>
            </div>
          ))}
        </div>

        {/* HUD Overlay */}
        <div ref={hudRef} className="hero-hud" aria-hidden="true" style={{ opacity: 0 }}>
          <div className="hero-hud-left">
            <span className="hero-hud-status"><span className="pulse-dot" />C8 ARCHITECTURE</span>
            <span ref={phaseTextRef} className="hero-hud-phase">VISÃO GERAL</span>
          </div>
          <div ref={scrollCueRef} className="hero-hud-scroll-cue">
            <span className="scroll-cue-text">SCROLL PARA DESCONSTRUIR</span>
            <div className="scroll-cue-mouse"><div className="scroll-cue-wheel" /></div>
          </div>
          <div className="hero-hud-right">
            <span ref={counterRef} className="hero-hud-counter">001 / 192</span>
            <div className="hero-hud-track"><div ref={hudFillRef} className="hero-hud-fill" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   MARQUEE SEPARATOR
────────────────────────────────────────────── */
function Marquee() {
  const items = [
    'CORVETTE C8',
    'MID-ENGINE ARCHITECTURE',
    '6.2L LT2 V8 N/A',
    '495 HP • 637 NM — COM PERFORMANCE EXHAUST',
    'TREMEC DCT 8-SPEED',
    'AERODINÂMICA FUNCIONAL',
    'COCKPIT DRIVER-FOCUSED',
    'PACOTE Z51 PERFORMANCE',
  ];

  return (
    <div className="marquee-section" aria-hidden="true">
      <div className="marquee-track">
        {items.concat(items).map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <span className="marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   01 — A RUPTURA (Gênese & A Mudança para Mid-Engine)
────────────────────────────────────────────── */
function RupturaSection() {
  const anim = useGsapScope((el) => {
    const tl = enterTimeline(el, 'top 85%');
    tl.fromTo('.section-eyebrow', { opacity: 0, y: motionY(14) }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
      .fromTo('.section-title', { opacity: 0, y: motionY(26) }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
      .fromTo('.section-body', { opacity: 0, y: motionY(18) }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }, '-=0.3')
      .fromTo('.concept-stat', { opacity: 0, y: motionY(16) }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out' }, '-=0.3');
  });

  return (
    <section id="ruptura" className="concept-section" ref={anim}>
      <div className="container">
        <div className="concept-layout">
          <div>
            <div className="section-header">
              <span className="section-eyebrow">01 — A Ruptura de Arquitetura</span>
              <h2 className="section-title">A Mudança<br />de Paradigma</h2>
              <p className="section-body">
                Durante quase sete décadas, o Corvette construiu sua lenda com motor dianteiro longitudinal.
                Com o C8, a Chevrolet concretizou a visão perseguida desde os anos 1960 pelo engenheiro Zora Arkus-Duntov:
                posicionar o bloco atrás do condutor para romper o limite físico de tração e dirigibilidade.
              </p>
              <p className="section-body" style={{ marginTop: '1rem' }}>
                Não foi uma simples mudança de perfil estético. Ao transferir o centro de gravidade e concentrar
                a maior fração da massa sobre o eixo motriz traseiro, o Corvette eliminou a necessidade de concessões
                dinâmicas na dianteira e atingiu resposta instantânea de direção.
              </p>
            </div>
            <div className="concept-stats">
              {[
                { v: '70+', label: 'Anos de Legado (Desde 1953)' },
                { v: 'C8',  label: 'Geração Mid-Engine' },
                { v: '40:60', label: 'Distribuição Diant./Tras.' },
              ].map((c, i) => (
                <div key={i} className="concept-stat">
                  <span className="concept-stat-value">{c.v}</span>
                  <span className="concept-stat-label">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
          <RevealImage
            src="/ruptura.png"
            alt="Chevrolet Corvette C8 Stingray — vista três quartos frontal em estúdio"
            direction="right"
            delay={0.25}
          />
        </div>
      </div>
    </section>
  );
}
/* ──────────────────────────────────────────────
   02 — A ESTRUTURA (Chassi, Distribuição 40/60 & Dinâmica)
────────────────────────────────────────────── */
function StructureSection() {
  const h = useReveal();
  const anim = useGsapScope((el) => {
    const diagram = el.querySelector('.tech-weight-diagram');
    if (diagram) {
      const tl = enterTimeline(diagram, 'top 88%');
      tl.fromTo(diagram, { opacity: 0, y: motionY(16) }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }
    const insights = el.querySelector('.structure-insights');
    if (insights) {
      const tl2 = enterTimeline(insights, 'top 88%');
      tl2.fromTo('.insight-card', { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' });
    }
  });

  return (
    <section id="estrutura" className="structure-section" ref={anim}>
      <div className="container">
        <div className="structure-layout">
          <div>
            <div ref={h} className="reveal section-header">
              <span className="section-eyebrow">02 — A Estrutura &amp; Distribuição</span>
              <h2 className="section-title">Chassi Rígido &amp;<br />Equilíbrio 40/60</h2>
              <p className="section-body">
                Uma nova estrutura de alumínio foi desenvolvida especificamente para a arquitetura de motor central-traseiro.
                A espinha dorsal central proporciona rigidez torcional superior, permitindo que a suspensão trabalhe
                com precisão absoluta sem deformações estruturais — mesmo com o teto targa removido.
              </p>
              <p className="section-body" style={{ marginTop: '0.9rem' }}>
                O cockpit foi deslocado aproximadamente <strong>42 cm para frente</strong> em relação à arquitetura anterior,
                posicionando o piloto próximo ao eixo dianteiro e abrindo o espaço perfeito para que o conjunto motriz
                repouse entre os eixos.
              </p>
            </div>

            {/* Diagrama Visual Técnico: 40% FRONT / 60% REAR */}
            <div className="tech-weight-diagram">
              <div className="weight-diagram-header">
                <span className="weight-diagram-tag">DISTRIBUIÇÃO DE PESO</span>
                <span className="weight-diagram-ratio">40:60</span>
              </div>
              <div className="weight-diagram-track">
                <div className="weight-bar weight-bar-front" style={{ width: '40%' }}>
                  <span className="weight-bar-label">40% DIANTEIRA</span>
                </div>
                <div className="weight-bar weight-bar-rear" style={{ width: '60%' }}>
                  <span className="weight-bar-label">60% TRASEIRA</span>
                </div>
              </div>
              <div className="weight-diagram-legend">
                <div className="weight-legend-item">
                  <span className="weight-legend-dot front-dot" />
                  <span>Direção rápida, capô rebaixado e visibilidade milimétrica</span>
                </div>
                <div className="weight-legend-item">
                  <span className="weight-legend-dot rear-dot" />
                  <span>Tração mecânica pura nas rodas motrizes sob aceleração</span>
                </div>
              </div>
            </div>
          </div>

          <div className="structure-insights">
            <div className="insight-card">
              <span className="insight-number">01</span>
              <div>
                <strong className="insight-title">Cockpit Deslocado 42 cm</strong>
                <p className="insight-desc">
                  Com o cockpit avançado, o motorista passa a ocupar uma posição mais integrada à nova arquitetura de motor central-traseiro.
                </p>
              </div>
            </div>
            <div className="insight-card">
              <span className="insight-number">02</span>
              <div>
                <strong className="insight-title">Túnel Central Estrutural</strong>
                <p className="insight-desc">
                  Uma viga central fechada em alumínio elimina a torção transversal e ancora a suspensão de braços triangulares sobrepostos.
                </p>
              </div>
            </div>
            <div className="insight-card">
              <span className="insight-number">03</span>
              <div>
                <strong className="insight-title">Centro de Gravidade Rebaixado</strong>
                <p className="insight-desc">
                  Com a lubrificação por cárter seco, o bloco LT2 fica assentado mais próximo ao solo, reduzindo a rolagem lateral em curvas severas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



/* ──────────────────────────────────────────────
   03 — O LT2 (Motor Central V8 & Transmissão DCT)
────────────────────────────────────────────── */
function EngineSection() {
  const h = useReveal();
  const anim = useGsapScope((el) => {
    const nums = el.querySelector('.lt2-numbers');
    if (nums) {
      const tl = enterTimeline(nums, 'top 90%');
      tl.fromTo('.lt2-num-main', { opacity: 0, y: motionY(30) }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
        .fromTo('.lt2-num-v8', { opacity: 0, y: motionY(16) }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3')
        .fromTo('.lt2-num-small', { opacity: 0, y: motionY(14) }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, '-=0.25');
    }
    const table = el.querySelector('.midengine-specs');
    if (table) {
      const tl2 = enterTimeline(table, 'top 92%');
      tl2.fromTo('.midengine-row', { opacity: 0, y: motionY(12) }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' });
    }
    const img = el.querySelector('.midengine-image img');
    if (img) {
      const d = isMobile() ? 5 : 12;
      gsap.fromTo(img, { y: -d, scale: 1.08 }, {
        y: d,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    }
  });

  const specs = [
    { name: 'Motor', val: 'Chevrolet Small Block LT2 6.2L V8' },
    { name: 'Aspiração', val: 'Naturalmente Aspirado (Resposta Linear)' },
    { name: 'Potência Homologada', val: '495 HP @ 6.450 rpm (com escape de performance)' },
    { name: 'Torque Máximo', val: '637 Nm (470 lb-ft) @ 5.150 rpm' },
    { name: 'Lubrificação', val: 'Sistema dry-sump com três bombas de sucção (scavenge) dedicadas' },
    { name: 'Transmissão', val: 'Tremec TR-9080 DCT de 8 Marchas' },
    { name: 'Posição', val: 'Central-Traseira Longitudinal' },
    { name: 'Corte de Rotação', val: '6.600 rpm' },
  ];

  return (
    <section id="lt2" className="midengine-section" ref={anim}>
      <div className="container">
        <div className="midengine-layout">
          <RevealImage
            src="/lt2.png"
            alt="Motor LT2 6.2L V8 central-traseiro visível sob a tampa traseira do Corvette C8"
            className="midengine-image"
            direction="left"
          />
          <div>
            <div ref={h} className="reveal section-header">
              <span className="section-eyebrow">03 — O Conjunto Motriz</span>
              <h2 className="section-title">O Coração<br />do C8</h2>
              <p className="section-body">
                Instalado atrás dos bancos, o Small Block LT2 6.2L V8 atmosférico entrega força linear
                sem lag de turbocompressor. O sistema de lubrificação por cárter seco (dry-sump) utiliza três bombas de
                sucção (scavenge) dedicadas para retirar óleo de diferentes pontos do conjunto, mantendo a pressão de óleo
                estável mesmo sob acelerações laterais superiores a 1G.
              </p>
              <p className="section-body" style={{ marginTop: '0.75rem' }}>
                Acoplada diretamente ao bloco, a transmissão Tremec DCT de 8 velocidades com dupla embreagem
                banhada a óleo executa trocas em menos de 100 milissegundos sem interrupção de torque nas rodas traseiras.
              </p>
            </div>
            <div className="lt2-numbers">
              <span className="lt2-num-main">6.2<span className="lt2-num-unit">L</span></span>
              <span className="lt2-num-v8">V8</span>
              <span className="lt2-num-pair">
                <span className="lt2-num-small"><strong>495</strong> HP</span>
                <span className="lt2-num-small"><strong>637</strong> NM</span>
              </span>
            </div>
            <div className="midengine-specs">
              {specs.map((s, i) => (
                <div key={i} className="midengine-row">
                  <span className="midengine-name">{s.name}</span>
                  <span className="midengine-val">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   04 — PERFORMANCE (Dinâmica Comprovada da Arquitetura)
────────────────────────────────────────────── */
function PerformanceSection() {
  const h = useReveal();
  const anim = useGsapScope((el) => {
    const specs = el.querySelector('.perf-specs');
    if (specs) {
      const tl = enterTimeline(specs, 'top 90%');
      tl.fromTo('.spec-card', { opacity: 0, y: motionY(20) }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.09, ease: 'power2.out' })
        .fromTo('.perf-footnote', { opacity: 0, y: motionY(10) }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.1');
    }
    const banner = el.querySelector('.perf-stat-banner');
    if (banner) {
      const tl2 = enterTimeline(banner, 'top 92%');
      tl2.fromTo('.stat-banner-item, .stat-banner-sep', { opacity: 0, y: motionY(12) }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' });
    }
  });

  const numbers = [
    { v: '2,9s',    label: '0 a 60 mph', icon: <Timer size={22} weight="fill" />, note: '0–96 km/h quando equipado com o Pacote Z51' },
    { v: '495 HP',  label: 'Potência Homologada', icon: <Lightning size={22} weight="fill" />, note: 'Especificação oficial Chevrolet com escape de performance' },
    { v: '637 Nm',  label: 'Torque Máximo', icon: <Gauge size={22} weight="fill" />, note: '470 lb-ft @ 5.150 rpm com entrega linear' },
    { v: '194 MPH', label: 'Velocidade Máxima', icon: <Speedometer size={22} weight="fill" />, note: 'Até 194 mph / 312 km/h — dependendo da configuração' },
  ];

  return (
    <section id="performance" className="performance-section" ref={anim}>
      <div className="container">
        <div className="perf-layout">
          <div>
            <div ref={h} className="reveal section-header">
              <span className="section-eyebrow">04 — Resposta Dinâmica</span>
              <h2 className="section-title">O Que a Arquitetura<br />Permite Fazer</h2>
              <p className="section-body">
                Com o peso do motor pressionando o eixo traseiro no momento exato da transferência de carga,
                o Corvette C8 transforma potência em tração com perda mínima de aderência. O resultado é uma saída
                de imobilidade fulminante de 0 a 60 mph em 2,9 segundos.
              </p>
              <p className="section-body" style={{ marginTop: '0.8rem' }}>
                A distribuição de massa equilibrada reduz a inércia na entrada de curva, permitindo aproximações
                mais agressivas e reacelerações imediatas na tangência.
              </p>
            </div>
            <div className="perf-specs">
              {numbers.map((n, i) => (
                <div key={i} className="spec-card">
                  <div className="spec-icon">{n.icon}</div>
                  <div className="spec-value">{n.v}</div>
                  <div className="spec-label">{n.label}</div>
                  <div className="spec-note">{n.note}</div>
                </div>
              ))}
            </div>
            <p className="perf-footnote">
              *Dados de aferição oficial da General Motors para o Corvette C8 Stingray com motor LT2 6.2L V8 em pista fechada.
            </p>
          </div>
          <div className="perf-visual-composition">
            <RevealImage
              src="/performance.png"
              alt="Corvette C8 Stingray em teste dinâmico"
              className="perf-focus-image"
              direction="right"
            />
            <div className="perf-stat-banner">
              <div className="stat-banner-item">
                <span className="stat-banner-val">&gt; 1.0 G</span>
                <span className="stat-banner-lbl">Capacidade Lateral</span>
              </div>
              <div className="stat-banner-sep" />
              <div className="stat-banner-item">
                <span className="stat-banner-val">&lt; 100 ms</span>
                <span className="stat-banner-lbl">Tempo de Troca no Tremec DCT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   05 — O AR (Design, Refrigeração & Proporções)
────────────────────────────────────────────── */
function DesignSection() {
  const h = useReveal();
  const f = useReveal();
  const fx = useGsapScope((el) => {
    const img = el.querySelector('.design-rear-crop img');
    const col = el.querySelector('.design-layout > div:last-child');
    if (img) {
      const d = isMobile() ? 5 : 12;
      gsap.fromTo(img, { y: -d, scale: 1.08 }, {
        y: d,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    }
    if (col) {
      const t = isMobile() ? 5 : 12;
      gsap.fromTo(col, { y: t }, {
        y: -t,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    }
  });

  const attrs = [
    {
      icon: <Wind size={22} weight="fill" />,
      label: 'Tomadas de Ar Laterais Funcionais',
      desc: 'Os dutos laterais em bumerangue captam e pressurizam o fluxo de ar diretamente para os trocadores de calor e para a admissão do motor LT2 central.',
    },
    {
      icon: <Ruler size={22} weight="fill" />,
      label: 'Proporções Esculpidas pelo Chassi',
      desc: 'Com o cockpit avançado e sem bloco sob o capô, a frente pôde ser desenhada ultrabaixa, com linhas afiadas inspiradas em aeronaves táticas.',
    },
    {
      icon: <ArrowsOutSimple size={22} weight="fill" />,
      label: 'Gestão Térmica Integrada',
      desc: 'Cada abertura e extrator traseiro trabalha para expelir o calor acumulado no compartimento central sem gerar arrasto turbulento na esteira do veículo.',
    },
  ];

  return (
    <section id="aerodinamica" className="design-section" ref={fx}>
      <div className="design-bg-line" aria-hidden="true" />
      <div className="container">
        <div className="design-layout">
          <RevealImage
            src="/aero.png"
            alt="Traseira muscular do Corvette C8 com difusores funcionais e extratores de calor"
            className="design-rear-crop"
            direction="left"
          />
          <div>
            <div ref={h} className="reveal section-header">
              <span className="section-eyebrow">05 — Design &amp; Aerodinâmica</span>
              <h2 className="section-title">Forma Nascida<br />da Função</h2>
              <p className="section-body">
                Nenhum vinco na carroceria do Corvette C8 é puramente decorativo. A transição para o motor
                central-traseiro exigiu repensar o caminho do ar: resfriar radiadores nas extremidades,
                alimentar o plenum central e estabilizar o eixo traseiro sem criar arrasto excessivo.
              </p>
            </div>
            <div ref={f} className="reveal design-attrs">
              {attrs.map((a, i) => (
                <div key={i} className="design-attr">
                  <span className="design-attr-icon">{a.icon}</span>
                  <div>
                    <strong className="design-attr-label">{a.label}</strong>
                    <p className="design-attr-desc">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   06 — O MOTORISTA (Cockpit & Ergonomia de Voo)
────────────────────────────────────────────── */
function CockpitSection() {
  const h = useReveal();
  const anim = useGsapScope((el) => {
    const fig = el.querySelector('.cockpit-figure');
    if (fig) {
      const tl = enterTimeline(fig, 'top 90%');
      tl.fromTo('.cockpit-figure-value', { opacity: 0, y: motionY(28) }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
        .fromTo('.cockpit-figure-note', { opacity: 0, y: motionY(10) }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3');
    }
    const list = el.querySelector('.feature-list');
    if (list) {
      const tl2 = enterTimeline(list, 'top 90%');
      tl2.fromTo('.feature-item', { opacity: 0, y: motionY(18) }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' });
    }
  });

  const features = [
    {
      icon: <Armchair size={22} weight="fill" />,
      title: 'Posição de Condução Rebaixada',
      desc: 'O condutor fica assentado rente ao piso estrutural do chassi, no ponto exato onde a percepção das forças dinâmicas e da rotação do carro é mais nítida.',
    },
    {
      icon: <MonitorPlay size={22} weight="fill" />,
      title: 'Cluster Digital Reconfigurável de 12"',
      desc: 'Painel de instrumentos de alta resolução com modos visuais específicos (Tour, Sport e Track) que priorizam conta-giros, telemetria e temperaturas.',
    },
    {
      icon: <GearSix size={22} weight="fill" />,
      title: 'Performance Data Recorder (PDR)',
      desc: 'Sistema de telemetria integrado com câmera frontal 1080p que grava vídeo em alta definição sincronizado com rotação, velocidade, forças G e ângulo de esterço.',
    },
    {
      icon: <Waves size={22} weight="fill" />,
      title: 'Volante Hexagonal de Dois Raios',
      desc: 'Topo e base achatados que liberam a linha de visão do painel e aumentam o espaço para as pernas, com aletas de troca de marcha em magnésio.',
    },
  ];

  return (
    <section id="cockpit" className="cockpit-section" ref={anim}>
      <div className="container">
        <div className="cockpit-layout">
          <div className="cockpit-content">
            <div ref={h} className="reveal section-header">
              <span className="section-eyebrow">06 — O Cockpit do Piloto</span>
              <h2 className="section-title">Tudo ao Redor<br />do Condutor</h2>
              <p className="section-body">
                O habitáculo do C8 foi concebido sob a filosofia aeronáutica do cockpit envolvente.
                Uma coluna central curvada agrupa os botões de controle térmico, criando uma barreira sutil
                que delimita a área do passageiro e coloca cada instrumento no raio de ação imediato do piloto.
              </p>
            </div>
            <div className="cockpit-figure">
              <span className="cockpit-figure-value">42<span className="cockpit-figure-unit">CM</span></span>
              <p className="cockpit-figure-note">deslocamento do cockpit em relação à arquitetura anterior</p>
            </div>
            <div className="feature-list">
              {features.map((f, i) => (
                <div key={i} className="feature-item">
                  <span className="feature-icon">{f.icon}</span>
                  <div className="feature-text">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <RevealImage
            src="/cockpit.png"
            alt="Interior refinado do Corvette C8 com bancos esportivos em couro e painel digital voltado ao condutor"
            className="cockpit-image"
            direction="right"
          />
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   07 — Z51 PERFORMANCE PACKAGE (A Calibração de Pista)
────────────────────────────────────────────── */
function Z51Section() {
  const anim = useGsapScope((el) => {
    const tl = enterTimeline(el, 'top 85%');
    tl.fromTo('.z51-mega', { opacity: 0, y: motionY(28) }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
      .fromTo('.section-eyebrow', { opacity: 0, y: motionY(12) }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3')
      .fromTo('.section-title', { opacity: 0, y: motionY(24) }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
      .fromTo('.section-body', { opacity: 0, y: motionY(16) }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.3')
      .fromTo('.z51-item', { opacity: 0, y: motionY(16) }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out' }, '-=0.25')
      .fromTo('.perf-footnote', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' }, '-=0.1');
    const focus = el.querySelector('.z51-focus-display');
    if (focus) {
      const tl2 = enterTimeline(focus, 'top 90%');
      tl2.fromTo('.z51-macro-image', { opacity: 0, y: motionY(36) }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    }
  });

  const items = [
    {
      label: 'Freios Brembo® Z51',
      text: 'Discos ampliados (345 mm dianteiros / 350 mm traseiros) com pinças monobloco ventiladas para desacelerações consistentes sob alta temperatura.',
    },
    {
      label: 'Performance Suspension',
      text: 'Molas mais rígidas e assentos de mola roscados manualmente para ajuste de altura, calibrados para resposta em pista.',
    },
    {
      label: 'Diferencial Eletrônico eLSD',
      text: 'Vetorização ativa de torque entre as rodas traseiras em milissegundos, permitindo aceleração total na saída de curva sem perda de trajetória.',
    },
    {
      label: 'Performance Exhaust com Válvulas Ativas',
      text: 'Sistema que otimiza o fluxo de escape e atinge os 495 HP e 637 Nm homologados pela Chevrolet.',
    },
    {
      label: 'Pneus Michelin® Pilot® Sport 4S',
      text: 'Composto de verão de alta aderência (245/35ZR19 dianteiros e 305/30ZR20 traseiros) desenvolvido sob medida para a dinâmica do C8.',
    },
    {
      label: 'Refrigeração de Circuito Adicional',
      text: 'Radiador traseiro extra e dutos de arrefecimento dedicados para manter freios e fluidos em faixa térmica ideal durante sessões contínuas de pista.',
    },
    {
      label: 'Aerodinâmica Específica Z51',
      text: 'Splitter dianteiro e asa traseira multiplano desenvolvidos para gerar downforce funcional e estabilidade em alta velocidade.',
    },
  ];

  return (
    <section id="z51" className="z51-section" ref={anim}>
      <div className="z51-bg-accent" aria-hidden="true" />
      <div className="container">
        <div className="z51-layout">
          <div>
            <span className="z51-mega" aria-hidden="true">Z51</span>
            <div className="section-header">
              <span className="section-eyebrow">07 — Calibração para Circuito</span>
              <h2 className="section-title">O Que É o<br />Pacote Z51?</h2>
              <p className="section-body">
                O Z51 Performance Package não é um pacote de adereços: é o conjunto de engenharia que prepara
                o Corvette Stingray para sessões intensas de autódromo, acrescentando arrefecimento pesado,
                downforce funcional e controle de tração de nível de competição.
              </p>
            </div>
            <div className="z51-features">
              {items.map((item, i) => (
                <div key={i} className="z51-item">
                  <strong>{item.label}</strong>
                  {item.text}
                </div>
              ))}
            </div>
            <p className="perf-footnote">
              Magnetic Ride Control 4.0 — sistema de amortecimento magnetoreológico disponível como opcional e combinável
              com o pacote Z51, não sendo um componente obrigatório dele.
            </p>
          </div>
          <div className="z51-focus-display">
            <div className="z51-macro-image">
              <img
                src="/z51.png"
                alt="Detalhe da asa e difusor do Corvette C8 com pacote Z51"
                loading="lazy"
              />
              <div className="z51-badge-overlay">
                <span className="z51-badge-title">Z51 PERFORMANCE</span>
                <span className="z51-badge-sub">Track-Ready Engineering</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   08 — CONFIGURAÇÕES (1LT, 2LT, 3LT — Abordagens de Acabamento)
────────────────────────────────────────────── */
function TrimsSection() {
  const h = useReveal();
  const anim = useGsapScope((el) => {
    const grid = el.querySelector('.trims-editorial-grid');
    if (grid) {
      const tl = enterTimeline(grid, 'top 85%');
      tl.fromTo('.trim-editorial-card', { opacity: 0, y: motionY(26) }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' });
    }
  });

  const trims = [
    {
      name: '1LT',
      subtitle: 'A Pureza da Dinâmica',
      desc: 'Voltado a quem prioriza a conexão direta com o chassi e a redução máxima de peso a bordo.',
      philosophy: 'Foco na Essência Mecânica',
      highlights: [
        'Mesmo motor LT2 6.2L V8 e chassi de alumínio',
        'Teto rígido removível tipo Targa em compósito leve',
        'Bancos esportivos GT1 com regulagem elétrica de 8 vias',
        'Cluster digital configurável de 12 polegadas',
        'Sistema de som premium Bose com 10 alto-falantes',
      ],
    },
    {
      name: '2LT',
      subtitle: 'Tecnologia & Viagens Longas',
      desc: 'Adiciona camadas avançadas de telemetria, visão perimetral e conveniência para uso rodoviário e diário.',
      philosophy: 'Equilíbrio Tecnológico',
      featured: true,
      highlights: [
        'Head-Up Display (HUD) colorido no para-brisa',
        'Performance Data Recorder (telemetria e vídeo)',
        'Bose Performance Series com 14 alto-falantes',
        'Bancos aquecidos e ventilados com memórias',
        'Câmeras de meio-fio dianteiras e retrovisor digital',
      ],
    },
    {
      name: '3LT',
      subtitle: 'Artesanato & Alta Alfaiataria',
      desc: 'O nível mais refinado de revestimentos manuais, couro integral e acabamentos customizados.',
      philosophy: 'Requinte Sob Medida',
      highlights: [
        'Interior totalmente revestido em couro personalizado',
        'Colunas e forro de teto em microfibra camurçada',
        'Bancos GT2 com detalhes em fibra de carbono exposta',
        'Costuras francesas aparentes em todo o habitáculo',
        'Amplo catálogo de composições cromáticas exclusivas',
      ],
    },
  ];

  return (
    <section id="configuracoes" className="trims-section" ref={anim}>
      <div className="container">
        <div ref={h} className="reveal section-header" style={{ textAlign: 'center', maxWidth: '740px', margin: '0 auto 4rem' }}>
          <span className="section-eyebrow">08 — Níveis de Acabamento</span>
          <h2 className="section-title">Três Formas de Interpretar<br />o Mesmo Conceito</h2>
          <p className="section-body" style={{ margin: '1.25rem auto 0' }}>
            A base mecânica é invariável: todo Corvette Stingray conta com a mesma estrutura em alumínio
            e motor LT2 central. As opções 1LT, 2LT e 3LT representam diferentes filosofias de habitáculo,
            indo da pureza dinâmica ao luxo artesanal.
          </p>
        </div>
        <div className="trims-editorial-grid">
          {trims.map((t, i) => (
            <div key={i} className={`trim-editorial-card ${t.featured ? 'is-featured' : ''}`}>
              <div className="trim-editorial-header">
                <span className="trim-editorial-code">{t.name}</span>
                <span className="trim-editorial-phil">{t.philosophy}</span>
              </div>
              <h3 className="trim-editorial-title">{t.subtitle}</h3>
              <p className="trim-editorial-desc">{t.desc}</p>
              <div className="trim-editorial-list">
                {t.highlights.map((hItem, idx) => (
                  <div key={idx} className="trim-editorial-item">
                    <span className="trim-editorial-dash" />
                    <span>{hItem}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   09 — A ESSÊNCIA DO C8 (Síntese)
────────────────────────────────────────────── */
function EssenceSection() {
  const anim = useGsapScope((el) => {
    const tl = enterTimeline(el, 'top 85%');
    tl.fromTo('.essence-mark', { opacity: 0 }, { opacity: 0.7, duration: 0.6, ease: 'power1.out' })
      .fromTo('.essence-text', { opacity: 0, y: motionY(20) }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
      .fromTo('.essence-attribution', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' }, '-=0.3')
      .fromTo('.essence-pillar', { opacity: 0, y: motionY(12) }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }, '-=0.25');
  });

  return (
    <section className="essence-section" ref={anim}>
      <div className="container">
        <div className="essence-inner">
          <span className="essence-mark" aria-hidden="true">"</span>
          <blockquote>
            <p className="essence-text">
              Ao levar o conjunto motriz para trás do habitáculo, o Corvette passou a organizar
              sua massa em torno de uma arquitetura sem compromissos — alinhando o esportivo
              americano aos conceitos mais rigorosos da dinâmica automotiva mundial.
            </p>
          </blockquote>
          <p className="essence-attribution">
            <strong>Engenharia &amp; Desenvolvimento</strong>
            Chevrolet Corvette Performance Team
          </p>

          <div className="essence-pillars">
            {[
              { label: 'ARQUITETURA', sub: 'Motor central-traseiro com distribuição equilibrada 40:60' },
              { label: 'MOTOR LT2', sub: 'V8 atmosférico com até 495 HP com Performance Exhaust e cárter seco' },
              { label: 'TRANSMISSÃO', sub: 'Câmbio Tremec DCT de 8 velocidades com trocas sub-100ms' },
              { label: 'PILOTO', sub: 'Cockpit aeronáutico avançado na nova arquitetura' },
            ].map((p, i) => (
              <div key={i} className="essence-pillar">
                <span className="essence-pillar-label">{p.label}</span>
                <span className="essence-pillar-sub">{p.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   10 — ENCERRAMENTO (Epílogo Editorial)
────────────────────────────────────────────── */
function ClosingSection() {
  const anim = useGsapScope((el) => {
    const tl = enterTimeline(el, 'top 85%');
    tl.fromTo('.closing-eyebrow', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' })
      .fromTo('.closing-title', { opacity: 0, y: motionY(22) }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .fromTo('.closing-sub', { opacity: 0, y: motionY(14) }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.35')
      .fromTo('.closing-actions', { opacity: 0, y: motionY(12) }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3');
  });

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToRuptura = (e) => {
    e.preventDefault();
    document.getElementById('ruptura')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="closing" className="closing-section" aria-labelledby="closing-heading" ref={anim}>
      <div className="closing-bg" role="img" aria-label="Corvette C8 silhueta" />
      <div className="container">
        <div className="closing-content">
          <div className="closing-eyebrow">Epílogo Editorial</div>
          <h2 id="closing-heading" className="closing-title">O Legado em<br />Movimento</h2>
          <p className="closing-sub">
            Uma máquina que transformou a física de sua lenda.
            A passagem para a arquitetura de motor central consolida mais de sete décadas de evolução contínua.
          </p>
          <div className="closing-actions">
            <button
              id="cta-revisit-hero"
              type="button"
              className="btn-primary"
              onClick={scrollToTop}
            >
              <ArrowUp size={16} weight="bold" /> Revisitar a Desconstrução
            </button>
            <button
              id="cta-revisit-concept"
              type="button"
              className="btn-ghost"
              onClick={scrollToRuptura}
            >
              A Ruptura de Arquitetura <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   FOOTER
────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="sig-block">
          <span className="sig-label">Epílogo / Assinatura</span>
          <h3 className="sig-title">Conceived, Designed &amp; Developed by Lucas</h3>
          <p className="sig-text">
            Uma experiência editorial e documental independente dedicada à engenharia, ao design
            e à evolução do Chevrolet Corvette C8 Stingray.
          </p>
        </div>

        <div className="sig-block">
          <span className="sig-label">Sobre o Projeto</span>
          <p className="sig-text">
            Este projeto foi concebido como uma experiência digital imersiva, combinando narrativa editorial,
            direção visual, animação, interação e tecnologia para apresentar a arquitetura, o conjunto motriz,
            a dinâmica, a aerodinâmica, o cockpit e o pacote de performance Z51 do Corvette C8.
          </p>
        </div>

        <div className="sig-block">
          <span className="sig-label">Autoria &amp; Independência</span>
          <p className="sig-text">
            Este é um projeto independente, sem afiliação, patrocínio ou representação oficial
            da General Motors ou da Chevrolet.
          </p>
          <p className="sig-text">
            As informações técnicas apresentadas têm caráter editorial e foram baseadas em materiais
            e especificações públicas do modelo.
          </p>
          <p className="sig-text sig-muted">
            Chevrolet® e Corvette® são marcas registradas da General Motors Company.
          </p>
        </div>

        <div className="sig-block">
          <span className="sig-label">Conecte-se</span>
          <div className="sig-socials">
            <a
              className="sig-social"
              href="https://www.instagram.com/im.lucasz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramLogo size={22} weight="regular" />
              <span>@im.lucasz</span>
            </a>
            <a
              className="sig-social"
              href="https://www.tiktok.com/@im.lucaszs"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TiktokLogo size={22} weight="regular" />
              <span>@im.lucaszs</span>
            </a>
          </div>
        </div>

        <div className="sig-block sig-block-last">
          <span className="sig-label">Crédito Final</span>
          <p className="sig-text">Projeto, direção visual e desenvolvimento: Lucas — © 2026</p>
          <p className="sig-text sig-muted">
            Todos os direitos reservados quanto ao design, código, identidade visual, textos editoriais
            e elementos originais desenvolvidos especificamente para este projeto.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────
   APP ROOT
────────────────────────────────────────────── */
export default function App() {
  return (
    <>
      <Nav />
      <main>
        {/* 01 — Hero: desmontagem cinematográfica scroll-driven com 6 estados */}
        <Hero />

        {/* Separador de transição técnica */}
        <Marquee />

        {/* 01 — A Ruptura: gênese e mudança para motor central */}
        <RupturaSection />

        {/* 02 — A Estrutura: chassi de alumínio, túnel central e equilíbrio 40/60 */}
        <StructureSection />

        {/* 03 — O LT2: 6.2L V8 naturalmente aspirado, cárter seco e Tremec DCT */}
        <EngineSection />

        {/* 04 — Performance: aceleração 2,9s, resposta de tração e dinâmica */}
        <PerformanceSection />

        {/* 05 — O Ar: design nascido da aerodinâmica e gestão térmica */}
        <DesignSection />

        {/* 06 — O Motorista: cockpit rebaixado, volante hexagonal e PDR */}
        <CockpitSection />

        {/* 07 — Pacote Z51: afinação de pista, Brembo, eLSD e refrigeração */}
        <Z51Section />

        {/* 08 — Configurações: filosofias de acabamento 1LT, 2LT e 3LT */}
        <TrimsSection />

        {/* 09 — A Essência do C8: síntese de engenharia */}
        <EssenceSection />

        {/* 10 — Encerramento: epílogo editorial */}
        <ClosingSection />
      </main>
      <Footer />
    </>
  );
}
