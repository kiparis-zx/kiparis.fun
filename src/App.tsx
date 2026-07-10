import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';
import Cursor from './components/Cursor';
import CommandPalette from './components/CommandPalette';
import ParticleCanvas from './components/ParticleCanvas';
import DiscordWidget from './components/DiscordWidget';
import ProjectCard from './components/ProjectCard';
import { useLanyard } from './hooks/useLanyard';
import { useGitHubProjects } from './hooks/useGitHubProjects';

// --- TYPEWRITER COMPONENT ---
function Typewriter() {
  const roles = ["Разработчик", "Геймер", "Криэйтор"];
  const [text, setText] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentRole = roles[roleIndex];

    if (!isDeleting) {
      if (text.length < currentRole.length) {
        timeout = setTimeout(() => {
          setText(currentRole.substring(0, text.length + 1));
        }, 70);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 1600);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => {
          setText(currentRole.substring(0, text.length - 1));
        }, 40);
      } else {
        setIsDeleting(false);
        setRoleIndex((i) => (i + 1) % roles.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [text, isDeleting, roleIndex]);

  return <span className="font-mono text-accent-2">{'< '}{text}<span className="animate-pulse"> | </span>{' />'}</span>;
}

// --- ID CARD COMPONENT ---
function IDCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative w-full max-w-[320px] h-[480px] bg-surface-2 rounded-xl border border-border-strong overflow-hidden shadow-2xl mx-auto hidden lg:block group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent-soft to-transparent opacity-20" />
      <div className="scan-line" />
      
      <div className="p-6 h-full flex flex-col relative z-10" style={{ transform: "translateZ(30px)" }}>
        <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
          <span className="font-mono text-text-muted">ID // 07-K</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-mono text-xs text-success">ACTIVE</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative group-hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 rounded-full bg-accent blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
            <img 
              src="https://github.com/kiparis-zx.png" 
              alt="Avatar" 
              className="relative w-[120px] h-[120px] rounded-full border-2 border-border-strong object-cover"
            />
          </div>
          
          <div>
            <h2 className="font-display font-bold text-2xl text-text">kiparis-</h2>
            <p className="font-mono text-accent-2 mt-1">@kiparis-zx</p>
          </div>
        </div>

        <div className="mt-auto border-t border-border pt-4">
          <div className="flex justify-between items-center font-mono text-xs text-text-muted">
            <span>LEVEL: 99</span>
            <span>CLASS: DEV</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [theme, setTheme] = useState('default');
  const [activeSection, setActiveSection] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const { data: lanyardData, loading: lanyardLoading } = useLanyard('594485816408014848');
  const { projects, loading: projectsLoading } = useGitHubProjects();

  // Handle Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('nightbyte-theme') || 'default';
    setTheme(savedTheme);
    if (savedTheme === 'alt') {
      document.documentElement.setAttribute('data-theme', 'alt');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'default' ? 'alt' : 'default';
    setTheme(newTheme);
    localStorage.setItem('nightbyte-theme', newTheme);
    if (newTheme === 'alt') {
      document.documentElement.setAttribute('data-theme', 'alt');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  // Scroll listener for navbar and active section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);

      // Simple Intersection Observer logic via scroll position
      const sections = ['hero', 'about', 'projects', 'contact'];
      let current = 'hero';
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= el.offsetTop - 200) {
          current = section;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { id: 'hero', label: 'Главная', index: '00' },
    { id: 'about', label: 'Обо мне', index: '01' },
    { id: 'projects', label: 'Проекты', index: '02' },
    { id: 'contact', label: 'Контакты', index: '03' },
  ];

  return (
    <div className="min-h-[100dvh] relative selection:bg-accent selection:text-white">
      {/* Global Elements */}
      <div className="fixed inset-0 grid-backdrop pointer-events-none z-[-1] opacity-50" />
      <Cursor />
      <CommandPalette toggleTheme={toggleTheme} />
      
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-accent z-[10000] origin-left" 
        style={{ scaleX }} 
      />

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-[9000] transition-all duration-300 ${scrolled ? 'bg-bg/80 backdrop-blur-md border-b border-border py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => scrollTo('hero')} data-interactive>
            <span className="font-mono font-bold text-accent">[ KPR ]</span>
            <span className="text-border-strong">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="font-mono text-xs text-text-muted hidden sm:inline-block">KIPARIS-</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`font-mono text-sm transition-colors relative group flex gap-2 items-baseline ${activeSection === link.id ? 'text-accent' : 'text-text-muted hover:text-text'}`}
                data-interactive
              >
                <span className="text-[10px] opacity-50">{link.index}</span>
                {link.label}
                {activeSection === link.id && (
                  <motion.div layoutId="navIndicator" className="absolute -bottom-2 left-0 right-0 h-px bg-accent" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:border-accent transition-colors"
              title="Toggle Theme (or use Ctrl+K)"
              data-interactive
            >
              <div className="flex gap-1">
                <span className={`w-2.5 h-2.5 rounded-full ${theme === 'alt' ? 'bg-[#ff7a45]' : 'bg-[#7c5cff]'}`} />
                <span className={`w-2.5 h-2.5 rounded-full ${theme === 'alt' ? 'bg-[#ff3d68]' : 'bg-[#22d3ee]'}`} />
              </div>
            </button>
            
            <button 
              onClick={() => scrollTo('contact')}
              className="hidden sm:block px-5 py-2 bg-surface border border-border text-text font-mono text-sm rounded hover:bg-accent hover:border-accent hover:text-white transition-all"
              data-interactive
            >
              Связаться
            </button>

            <button 
              className="md:hidden text-text p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={mobileMenuOpen}
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border bg-bg/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className="font-mono text-left p-3 border-b border-border/50 text-text-muted hover:text-accent"
                  >
                    <span className="text-xs opacity-50 mr-3">{link.index}</span>
                    {link.label}
                  </button>
                ))}
                <button 
                  onClick={() => scrollTo('contact')}
                  className="mt-2 w-full py-3 bg-accent text-white font-mono text-sm rounded"
                >
                  Связаться
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="hero" className="relative min-h-[100dvh] flex items-center justify-center pt-20 overflow-hidden">
        <ParticleCanvas />
        
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-start"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="font-mono text-[10px] text-text-muted">SYSTEM ONLINE · RUSSIA / REMOTE</span>
              </div>
              
              <h1 
                className="font-display font-bold text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-2 mb-4 glitch-effect"
                data-text="kiparis-"
              >
                kiparis-
              </h1>
              
              <div className="text-xl md:text-2xl mb-6 h-8">
                <Typewriter />
              </div>
              
              <p className="text-text-muted text-lg max-w-lg mb-10 leading-relaxed">
                Собираю интерфейсы и системы на стыке инженерии и игрового дизайна. Пишу код, который приятно трогать — быстрый, аккуратный, живой.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => scrollTo('contact')}
                  className="px-8 py-3 bg-gradient-to-r from-accent to-accent-2 text-white font-medium rounded hover:shadow-[0_0_20px_var(--accent-soft)] transition-all flex items-center gap-2 group"
                  data-interactive
                >
                  Связаться <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => scrollTo('projects')}
                  className="px-8 py-3 bg-surface border border-border text-text font-medium rounded hover:bg-surface-2 transition-colors flex items-center gap-2"
                  data-interactive
                >
                  Смотреть проекты
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              <IDCard />
            </motion.div>
          </div>
        </div>

        <motion.button
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 group"
          onClick={() => scrollTo('about')}
          aria-label="Scroll to about section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {/* HUD scroll indicator */}
          <span className="font-mono text-[9px] tracking-[0.3em] text-accent/60 group-hover:text-accent transition-colors duration-300">
            SCROLL
          </span>
          <div className="relative flex flex-col items-center">
            {/* Track */}
            <div className="w-px h-10 bg-border-strong/50 relative overflow-hidden rounded-full">
              {/* Animated dot sliding down */}
              <motion.div
                className="absolute top-0 left-0 w-full rounded-full"
                style={{ height: '40%', background: 'linear-gradient(to bottom, var(--accent), var(--accent-2))' }}
                animate={{ y: ['0%', '160%', '0%'] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              />
            </div>
            {/* Bottom chevron */}
            <motion.i
              className="fa-solid fa-chevron-down text-[10px] text-accent/50 group-hover:text-accent-2 transition-colors mt-1"
              animate={{ y: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            />
          </div>
        </motion.button>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="py-24 relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="font-mono text-accent text-sm block mb-4">// 01 — ОБО МНЕ</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text">Разработчик утилит и игровых инструментов</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-8 bg-surface-2 border border-border rounded-xl corner-decorators"
          >
            <p className="text-text-muted text-lg mb-6 leading-relaxed">
              Привет, я kiparis-. Создаю инструменты, которые упрощают жизнь геймерам и разработчикам. Люблю превращать рутину в автоматизацию, а сложные процессы — в интуитивно понятные интерфейсы.
            </p>

            <ul className="space-y-4 mb-8 text-text-dim">
              <li><span className="text-accent">▹</span> <strong className="text-text">NoxVeil Client</strong> — быстрый и чистый лаунчер для Minecraft</li>
              <li><span className="text-accent">▹</span> <strong className="text-text">Fishing_Bot_N2E</strong> — автоматизация рыбалки</li>
              <li><span className="text-accent">▹</span> <strong className="text-text">RoundEffects</strong> — плагин для CS2 на C#</li>
            </ul>

            <div className="space-y-3 font-mono text-sm border-t border-border pt-6">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-dim">Локация</span>
                <span className="text-text">Russia</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-text-dim">Специализация</span>
                <span className="text-text">Game Tools · Automation · Full-Stack</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-text-dim">Статус</span>
                <span className="text-success flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Открыт для проектов
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- PROJECTS SECTION --- */}
      <section id="projects" className="py-24 relative bg-surface">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="font-mono text-accent text-sm block mb-4">// 02 — ПРОЕКТЫ</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text">Что я строил в последнее время</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsLoading ? (
              <>
                {[1, 2, 3].map(i => <ProjectCard key={i} isLoading={true} />)}
              </>
            ) : (
              projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="h-full"
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-24 relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="relative p-8 md:p-12 bg-surface-2 border border-border rounded-xl corner-decorators">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 max-w-2xl mx-auto"
            >
              <span className="font-mono text-accent text-sm block mb-4">// 03 — КОНТАКТЫ</span>
              <h2 className="font-display text-4xl font-bold text-text mb-6">Связь & Профили</h2>
              <p className="text-text-muted">
                Открыт к интересным проектам, коллаборациям и просто разговорам о коде и играх. Быстрее всего поймать в Discord или Telegram.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-full"
              >
                <DiscordWidget lanyard={lanyardData} loading={lanyardLoading} />
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Discord', handle: '.kiparis_', color: '#5865F2', icon: 'fa-brands fa-discord', link: '#' },
                  { name: 'GitHub', handle: '@kiparis-zx', color: '#ffffff', icon: 'fa-brands fa-github', link: 'https://github.com/kiparis-zx' },
                  { name: 'Telegram', handle: '@ciskwn', color: '#26A5E4', icon: 'fa-brands fa-telegram', link: 'https://t.me/ciskwn' },
                  { name: 'Steam', handle: 'kiparis-', color: '#66c0f4', icon: 'fa-brands fa-steam', link: 'https://steamcommunity.com/id/kiparis-/' },
                ].map((social, i) => (
                  <motion.a
                    key={social.name}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative p-6 bg-surface border border-border rounded-xl overflow-hidden hover:-translate-y-1 transition-transform"
                    style={{ '--hover-color': social.color } as React.CSSProperties}
                    onClick={(e) => {
                      if (social.name === 'Discord') {
                        e.preventDefault();
                        navigator.clipboard.writeText(social.handle);
                        // Using a simple toast replacement via command palette area or standard alert is enough
                        // But Lanyard widget already has discord copy. 
                      }
                    }}
                    data-interactive
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                      style={{ backgroundColor: 'var(--hover-color)' }}
                    />
                    <i 
                      className={`${social.icon} text-3xl mb-4 transition-colors duration-300`} 
                      style={{ color: 'var(--text-muted)' }}
                    />
                    {/* Hack to apply custom hover color via style block for icon is tricky, using parent hover state instead */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                       <i className="fa-solid fa-arrow-up-right-from-square text-xs" style={{ color: 'var(--hover-color)' }} />
                    </div>
                    <h3 className="font-bold text-text mb-1 group-hover:text-white transition-colors">{social.name}</h3>
                    <p className="font-mono text-xs text-text-dim group-hover:text-[var(--hover-color)] transition-colors">{social.handle}</p>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-border bg-bg py-8 mt-12 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono text-xs text-text-dim flex gap-4">
            <span>© 2026 kiparis-</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">BUILD 2026.07 · СОБРАНО НА REACT</span>
          </div>
          
          <button 
            onClick={() => scrollTo('hero')}
            className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent hover:-translate-y-1 transition-all"
            data-interactive
            aria-label="Back to top"
          >
            <i className="fa-solid fa-arrow-up" />
          </button>
        </div>
      </footer>
      
      {/* Global CSS animation for shimmer */}
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        .fa-brands.group-hover\\:text-\\[var\\(--hover-color\\)\\] {
          transition: color 0.3s;
        }
        .group:hover .fa-brands {
          color: var(--hover-color) !important;
        }
      `}</style>
    </div>
  );
}