'use strict';

/* ============================================================
   NIGHTBYTE — Portfolio SPA — interactivity
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initThemeToggle();
  initSmoothScroll();
  initActiveNav();
  initFadeInObserver();
  initStackReveal();
  initRoleTypewriter();
  initTiltEffect();
  initParticleField();
  initBackToTop();
  initFooterYear();
  initDiscordWidget();
  fetchGitHubProjects();
});

/* ---------------------------------------------------------
   Header: background/blur on scroll
--------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('navbar');
  if (!header) return;

  const update = () => {
    if (window.scrollY > 24) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ---------------------------------------------------------
   Mobile menu toggle
--------------------------------------------------------- */
function initMobileMenu() {
  const btn = document.getElementById('menu-toggle');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  const close = () => {
    btn.classList.remove('open');
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  };

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', close);
  });
}

/* ---------------------------------------------------------
   Theme toggle (duotone color-mode switch, persisted)
--------------------------------------------------------- */
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  if (!toggle) return;

  const STORAGE_KEY = 'nightbyte-theme';
  const saved = safeGetStorage(STORAGE_KEY);
  if (saved === 'alt') root.setAttribute('data-theme', 'alt');

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'alt' ? 'alt' : 'default';
    const next = current === 'alt' ? 'default' : 'alt';
    if (next === 'default') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'alt');
    }
    safeSetStorage(STORAGE_KEY, next);
  });
}

function safeGetStorage(key) {
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}
function safeSetStorage(key, value) {
  try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
}

/* ---------------------------------------------------------
   Smooth anchor scrolling with fixed-header offset
--------------------------------------------------------- */
function initSmoothScroll() {
  const HEADER_OFFSET = 84;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ---------------------------------------------------------
   Highlight active nav link based on scroll position
--------------------------------------------------------- */
function initActiveNav() {
  const sections = ['home', 'about', 'projects', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const links = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active-link', isActive);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------------------------------------------------------
   Fade-in on scroll (Intersection Observer)
--------------------------------------------------------- */
function initFadeInObserver() {
  const targets = document.querySelectorAll('.fade-in');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   Tech-stack tags: staggered reveal once visible
--------------------------------------------------------- */
function initStackReveal() {
  const grid = document.getElementById('stack-grid');
  if (!grid) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          grid.classList.add('revealed');
          obs.disconnect();
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(grid);
}

/* ---------------------------------------------------------
   Hero role typewriter cycle
--------------------------------------------------------- */
function initRoleTypewriter() {
  const el = document.getElementById('role-text');
  if (!el) return;

  const roles = ['Разработчик', 'Геймер', 'Криэйтор'];
  const TYPE_SPEED = 70;
  const DELETE_SPEED = 40;
  const HOLD_TIME = 1600;

  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = false;

  el.textContent = roles[0];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const tick = () => {
    const word = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      if (charIndex > word.length) {
        deleting = true;
        setTimeout(tick, HOLD_TIME);
        return;
      }
    } else {
      charIndex--;
      if (charIndex < 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        charIndex = 0;
      }
    }

    el.textContent = roles[deleting ? roleIndex : roleIndex].slice(0, Math.max(charIndex, 0));
    setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
  };

  setTimeout(tick, HOLD_TIME);
}

/* ---------------------------------------------------------
   3D tilt effect for cards on mouse move
--------------------------------------------------------- */
function initTiltEffect() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) return;

  const MAX_TILT = 10;
  const els = document.querySelectorAll('.tilt');

  els.forEach((el) => {
    if (el.dataset.tiltInitialized) return;
    el.dataset.tiltInitialized = 'true';

    let frame = null;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rotateX = (-y * MAX_TILT).toFixed(2);
        const rotateY = (x * MAX_TILT).toFixed(2);
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
    });

    el.addEventListener('mouseleave', () => {
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

/* ---------------------------------------------------------
   Hero background: constellation particle field
--------------------------------------------------------- */
function initParticleField() {
  const canvas = document.getElementById('particle-canvas');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, particles;
  let mouse = { x: null, y: null };
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const accentA = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7c5cff';
  const accentB = () => getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim() || '#22d3ee';

  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    createParticles();
  }

  function createParticles() {
    const density = Math.min(90, Math.floor((width * height) / 16000));
    particles = Array.from({ length: density }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);
    const colorA = hexToRgb(accentA());
    const colorB = hexToRgb(accentB());
    const linkDist = 130;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 0.6;
          p.y += (dy / dist) * force * 0.6;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colorB.r}, ${colorB.g}, ${colorB.b}, 0.55)`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDist) {
          const opacity = (1 - dist / linkDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${colorA.r}, ${colorA.g}, ${colorA.b}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (!prefersReducedMotion) {
      requestAnimationFrame(step);
    }
  }

  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  }

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  hero.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', debounce(resize, 200));

  resize();
  step();
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* ---------------------------------------------------------
   Back-to-top button
--------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------------------------------------------------
   Footer year
--------------------------------------------------------- */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = String(new Date().getFullYear());
}

/* ---------------------------------------------------------
   Discord Widget Interactivity & Lanyard API Integration
--------------------------------------------------------- */
function initDiscordWidget() {
  const copyBtn = document.getElementById('discord-copy-btn');
  const toast = document.getElementById('discord-toast');
  const discordLink = document.getElementById('social-discord-btn');
  
  if (!copyBtn || !toast) return;
  
  const copyAction = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText('.kiparis_');
      toast.classList.add('show');
      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Скопировано!';
      
      setTimeout(() => {
        toast.classList.remove('show');
        copyBtn.innerHTML = '<i class="fa-brands fa-discord"></i> Скопировать ник & Написать';
      }, 2500);
      
      // Open Discord Web app or Desktop client after a short delay
      setTimeout(() => {
        window.open('https://discord.com/channels/@me', '_blank');
      }, 800);
      
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  copyBtn.addEventListener('click', copyAction);
  
  if (discordLink) {
    discordLink.addEventListener('click', (e) => {
      e.preventDefault();
      // Scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const offset = 84;
        const top = contactSection.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        
        // Trigger click action after scroll
        setTimeout(() => {
          copyBtn.focus();
          // Add a temporary glow effect
          const card = document.getElementById('discord-card');
          if (card) {
            card.style.borderColor = '#5865f2';
            card.style.boxShadow = '0 0 30px rgba(88, 101, 242, 0.6)';
            setTimeout(() => {
              card.style.borderColor = '';
              card.style.boxShadow = '';
            }, 1500);
          }
        }, 600);
      }
    });
  }

  // Start Lanyard Integration
  initLanyard();
}

function initLanyard() {
  const USER_ID = '594485816408014848';
  let socket = null;
  let heartbeatInterval = null;
  let pollingInterval = null;
  
  async function fetchJapiProfile() {
    try {
      const res = await fetch(`https://japi.rest/discord/v1/user/${USER_ID}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const profile = json.data;
          
          // Set banner image
          const bannerImg = document.getElementById('discord-banner-img');
          if (bannerImg && profile.bannerURL) {
            // Request high-res banner
            const hiResURL = profile.bannerURL.includes('?') 
              ? profile.bannerURL + '&size=600' 
              : profile.bannerURL + '?size=600';
            bannerImg.src = hiResURL;
            bannerImg.style.display = 'block';
          }
          
          // Set avatar decoration
          const decoEl = document.getElementById('discord-avatar-decoration');
          if (decoEl && profile.avatar_decoration_data && profile.avatar_decoration_data.asset) {
            const asset = profile.avatar_decoration_data.asset;
            const ext = asset.startsWith('a_') ? 'png' : 'png'; // APNG uses .png extension
            decoEl.src = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.${ext}?size=160&passthrough=true`;
            decoEl.style.display = 'block';
          }
          
          // Set badges from public_flags_array
          const badgesEl = document.getElementById('discord-badges');
          if (badgesEl && profile.public_flags_array && profile.public_flags_array.length > 0) {
            const flagIcons = {
              'HOUSE_BRAVERY': { icon: 'fa-solid fa-shield-halved', title: 'HypeSquad Bravery' },
              'HOUSE_BRILLIANCE': { icon: 'fa-solid fa-sun', title: 'HypeSquad Brilliance' },
              'HOUSE_BALANCE': { icon: 'fa-solid fa-scale-balanced', title: 'HypeSquad Balance' },
              'ACTIVE_DEVELOPER': { icon: 'fa-solid fa-code', title: 'Active Developer' },
              'NITRO': { icon: 'fa-solid fa-gem', title: 'Nitro Subscriber' },
              'EARLY_SUPPORTER': { icon: 'fa-solid fa-heart', title: 'Early Supporter' },
              'VERIFIED_BOT_DEVELOPER': { icon: 'fa-solid fa-robot', title: 'Verified Bot Developer' },
              'PARTNERED_SERVER_OWNER': { icon: 'fa-solid fa-handshake', title: 'Partner' },
              'BUG_HUNTER_LEVEL_1': { icon: 'fa-solid fa-bug', title: 'Bug Hunter' },
              'BUG_HUNTER_LEVEL_2': { icon: 'fa-solid fa-bug-slash', title: 'Bug Hunter Gold' },
            };
            
            badgesEl.innerHTML = '';
            profile.public_flags_array.forEach(flag => {
              const info = flagIcons[flag];
              if (info) {
                const badge = document.createElement('span');
                badge.className = 'discord-badge';
                badge.title = info.title;
                badge.innerHTML = `<i class="${info.icon}"></i>`;
                badgesEl.appendChild(badge);
              }
            });
          }
          
          // Set "about me" from Lanyard KV or fallback
          const aboutEl = document.getElementById('discord-about-content');
          if (aboutEl) {
            aboutEl.textContent = 'не понимаю почему гугл у меня спрашивает пол и там какой то мужской и женский, у меня пол ламинат';
          }
        }
      }
    } catch (e) {
      console.error('Error fetching profile from japi.rest:', e);
      // Set fallback about me
      const aboutEl = document.getElementById('discord-about-content');
      if (aboutEl) {
        aboutEl.textContent = 'не понимаю почему гугл у меня спрашивает пол и там какой то мужской и женский, у меня пол ламинат';
      }
    }
  }
  
  function connectWS() {
    socket = new WebSocket('wss://api.lanyard.rest/socket');
    
    socket.onopen = () => {
      console.log('Lanyard WebSocket connected');
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    };
    
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      
      if (msg.op === 1) {
        const interval = msg.d.heartbeat_interval;
        heartbeatInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ op: 3 }));
          }
        }, interval);
        
        socket.send(JSON.stringify({
          op: 2,
          d: { subscribe_to_id: USER_ID }
        }));
      } else if (msg.op === 0) {
        if (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') {
          updateLanyardStatus(msg.d);
        }
      }
    };
    
    socket.onerror = (err) => {
      console.error('Lanyard WebSocket error:', err);
    };
    
    socket.onclose = () => {
      console.log('Lanyard WebSocket closed, falling back to REST API polling');
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      startPolling();
    };
  }
  
  function startPolling() {
    if (pollingInterval) return;
    
    const fetchStatus = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${USER_ID}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            updateLanyardStatus(json.data);
          }
        }
      } catch (err) {
        console.error('Lanyard REST fetch error:', err);
      }
    };
    
    fetchStatus();
    pollingInterval = setInterval(fetchStatus, 20000);
  }
  
  fetchJapiProfile();
  connectWS();
}
  
function updateLanyardStatus(data) {
  if (!data) return;
  
  const { discord_user, discord_status, activities, listening_to_spotify, spotify, kv } = data;
  
  // 1. Update Profile Avatar
  const avatarEl = document.getElementById('discord-avatar');
  if (avatarEl && discord_user) {
    if (discord_user.avatar) {
      const extension = discord_user.avatar.startsWith('a_') ? 'gif' : 'png';
      avatarEl.src = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.${extension}?size=128`;
    }
  }
  
  // 2. Update avatar decoration from Lanyard data (backup for japi)
  const decoEl = document.getElementById('discord-avatar-decoration');
  if (decoEl && discord_user && discord_user.avatar_decoration_data && discord_user.avatar_decoration_data.asset) {
    if (!decoEl.src || decoEl.style.display === 'none') {
      const asset = discord_user.avatar_decoration_data.asset;
      decoEl.src = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=160&passthrough=true`;
      decoEl.style.display = 'block';
    }
  }
  
  // 3. Update "About me" from Lanyard KV store or fallback
  const aboutEl = document.getElementById('discord-about-content');
  if (aboutEl) {
    if (kv && kv.bio) {
      aboutEl.textContent = kv.bio;
    } else {
      aboutEl.textContent = 'не понимаю почему гугл у меня спрашивает пол и там какой то мужской и женский, у меня пол ламинат';
    }
  }
  
  // 2. Update Display & User Name
  const dispNameEl = document.getElementById('discord-display-name');
  const usrNameEl = document.getElementById('discord-username');
  if (dispNameEl && discord_user) {
    dispNameEl.textContent = discord_user.global_name || discord_user.display_name || discord_user.username;
  }
  if (usrNameEl && discord_user) {
    usrNameEl.textContent = discord_user.discriminator && discord_user.discriminator !== '0'
      ? `${discord_user.username}#${discord_user.discriminator}`
      : `@${discord_user.username}`;
  }
  
  // 3. Update Status Dot
  const statusEl = document.getElementById('discord-status');
  if (statusEl) {
    statusEl.className = 'discord-status-dot';
    statusEl.classList.add(discord_status || 'offline');
  }
  
  // 4. Update Custom Status
  const customStatusEl = document.getElementById('discord-custom-status');
  const customActivity = activities.find(act => act.type === 4);
  if (customStatusEl) {
    if (customActivity) {
      customStatusEl.style.display = 'flex';
      const emojiSpan = customStatusEl.querySelector('.status-emoji');
      const textSpan = customStatusEl.querySelector('.status-text');
      
      if (emojiSpan) {
        if (customActivity.emoji) {
          if (customActivity.emoji.id) {
            const ext = customActivity.emoji.animated ? 'gif' : 'png';
            emojiSpan.innerHTML = `<img src="https://cdn.discordapp.com/emojis/${customActivity.emoji.id}.${ext}?size=44" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle;">`;
          } else {
            emojiSpan.textContent = customActivity.emoji.name || '';
          }
        } else {
          emojiSpan.textContent = '';
        }
      }
      if (textSpan) {
        textSpan.textContent = customActivity.state || '';
      }
    } else {
      customStatusEl.style.display = 'none';
    }
  }
  
  // 5. Update Activity Section (Game or Spotify)
  const activitySection = document.getElementById('discord-activity-section');
  const gameActivities = activities.filter(act => act.type !== 4);
  
  if (activitySection) {
    if (listening_to_spotify && spotify) {
      activitySection.style.display = 'block';
      activitySection.querySelector('.discord-section-title').textContent = 'Слушает Spotify';
      
      const iconWrap = document.getElementById('discord-activity-icon-wrap');
      if (iconWrap) {
        iconWrap.innerHTML = `<img src="${spotify.album_art_url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`;
      }
      
      const actName = document.getElementById('activity-name');
      const actDetails = document.getElementById('activity-details');
      const actState = document.getElementById('activity-state');
      
      if (actName) actName.textContent = spotify.song;
      if (actDetails) actDetails.textContent = `Исполнитель: ${spotify.artist}`;
      if (actState) actState.textContent = `Альбом: ${spotify.album}`;
      
    } else if (gameActivities.length > 0) {
      const primaryAct = gameActivities[0];
      activitySection.style.display = 'block';
      activitySection.querySelector('.discord-section-title').textContent = 'Играет в';
      
      const iconWrap = document.getElementById('discord-activity-icon-wrap');
      if (iconWrap) {
        if (primaryAct.assets && primaryAct.assets.large_image) {
          let imgUrl = '';
          if (primaryAct.assets.large_image.startsWith('mp:external/')) {
            // Lanyard external proxy URL format resolving
            imgUrl = 'https://' + primaryAct.assets.large_image.split('/https/')[1];
          } else {
            imgUrl = `https://cdn.discordapp.com/app-assets/${primaryAct.application_id}/${primaryAct.assets.large_image}.png`;
          }
          iconWrap.innerHTML = `<img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" onerror="this.src='https://github.com/kiparis-zx.png';">`;
        } else {
          iconWrap.innerHTML = `<i class="fa-solid fa-gamepad discord-activity-icon" style="font-size: 20px; color: #5865f2;"></i>`;
        }
      }
      
      const actName = document.getElementById('activity-name');
      const actDetails = document.getElementById('activity-details');
      const actState = document.getElementById('activity-state');
      
      if (actName) actName.textContent = primaryAct.name;
      if (actDetails) actDetails.textContent = primaryAct.details || '';
      if (actState) actState.textContent = primaryAct.state || '';
      
    } else {
      activitySection.style.display = 'none';
    }
  }
}


/* ---------------------------------------------------------
   Dynamic GitHub Projects Loading
--------------------------------------------------------- */
async function fetchGitHubProjects() {
  const container = document.getElementById('projects-container');
  if (!container) return;
  
  const PROFILE_URL = 'https://api.github.com/users/kiparis-zx/repos';
  const ORG_URL = 'https://api.github.com/orgs/Corrupted-Code/repos';
  
  // Custom pinned projects (shown first, not from GitHub API)
  const pinnedProjects = [
    {
      name: 'NoxVeil Client',
      year: '2026',
      description: 'Кроссплатформенный лаунчер для Minecraft. Быстрый, чистый, умный.',
      language: 'JavaScript',
      tags: ['Launcher', 'Minecraft', 'Electron'],
      html_url: 'https://noxveil.kiparis.fun/',
      homepage: 'https://noxveil.kiparis.fun/',
      isPinned: true
    }
  ];
  
  // Homepage overrides for specific repos
  const homepageOverrides = {
    'Fishing_Bot_N2E': 'https://fishingbot.prvkey.ru/',
    'fishing_bot_n2e': 'https://fishingbot.prvkey.ru/'
  };
  
  // Fallback static projects
  const fallbackProjects = [
    ...pinnedProjects,
    {
      name: 'RoundEffects',
      year: '2026',
      description: 'Плагин для Counter-Strike 2, добавляющий визуальные эффекты в конце каждого раунда.',
      language: 'C#',
      tags: ['CS2', 'C#', 'Plugin'],
      html_url: 'https://github.com/Corrupted-Code/RoundEffects',
      homepage: null
    },
    {
      name: 'Fishing_Bot_N2E',
      year: '2026',
      description: 'Бот для автоматизации рыбалки в игре.',
      language: 'Python',
      tags: ['Bot', 'Automation'],
      html_url: 'https://github.com/Corrupted-Code/Fishing_Bot_N2E',
      homepage: 'https://fishingbot.prvkey.ru/'
    },
    {
      name: 'kiparis-zx',
      year: '2025',
      description: 'Персональный профиль GitHub с проектами, конфигами и инструментами.',
      language: 'JavaScript',
      tags: ['Profile', 'Portfolio'],
      html_url: 'https://github.com/kiparis-zx',
      homepage: null
    }
  ];

  try {
    const [profileRes, orgRes] = await Promise.all([
      fetch(PROFILE_URL).then(r => r.ok ? r.json() : []),
      fetch(ORG_URL).then(r => r.ok ? r.json() : [])
    ]);
    
    let repos = [...profileRes, ...orgRes];
    
    if (repos.length === 0) {
      renderProjects(fallbackProjects);
      return;
    }
    
    // Filter duplicates, forks, and excluded repos
    const uniqueRepos = [];
    const names = new Set();
    const excludeNames = ['osu-cbmsd', 'commit'];
    repos.forEach(repo => {
      const isExcluded = excludeNames.includes(repo.name.toLowerCase());
      if (!names.has(repo.name) && !repo.fork && !isExcluded) {
        names.add(repo.name);
        uniqueRepos.push(repo);
      }
    });
    
    // Sort by stars descending, then by updated date
    uniqueRepos.sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.updated_at) - new Date(a.updated_at);
    });
    
    // Map to our project schema (max 5 from GitHub since 1 pinned)
    const maxFromGitHub = 6 - pinnedProjects.length;
    const ghProjects = uniqueRepos.slice(0, maxFromGitHub).map(repo => {
      const year = repo.created_at ? new Date(repo.created_at).getFullYear() : '2026';
      const tags = [];
      if (repo.language) tags.push(repo.language);
      if (repo.topics && Array.isArray(repo.topics)) {
        tags.push(...repo.topics.slice(0, 2));
      }
      
      // Apply homepage overrides
      let homepage = repo.homepage;
      if (homepageOverrides[repo.name]) {
        homepage = homepageOverrides[repo.name];
      }
      
      return {
        name: repo.name,
        year: year,
        description: repo.description || 'Описание отсутствует.',
        language: repo.language || 'Code',
        tags: tags.length ? tags : ['Repository'],
        html_url: repo.html_url,
        homepage: homepage
      };
    });
    
    // Pinned projects first, then GitHub repos
    renderProjects([...pinnedProjects, ...ghProjects]);
  } catch (e) {
    console.error('Error fetching github projects:', e);
    renderProjects(fallbackProjects);
  }
}

function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const icons = {
    'javascript': 'fa-brands fa-js',
    'typescript': 'fa-solid fa-code',
    'c#': 'fa-solid fa-cube',
    'python': 'fa-brands fa-python',
    'html': 'fa-brands fa-html5',
    'css': 'fa-brands fa-css3-alt',
    'c++': 'fa-solid fa-gamepad',
    'go': 'fa-solid fa-network-wired',
    'rust': 'fa-solid fa-gear'
  };

  projects.forEach((proj, idx) => {
    const thumbClass = `project-thumb-${(idx % 6) + 1}`;
    const langLower = (proj.language || '').toLowerCase();
    const iconClass = icons[langLower] || 'fa-solid fa-code';
    
    const article = document.createElement('article');
    article.className = 'project-card tilt fade-in revealed';
    
    const tagsHTML = proj.tags.map(t => `<span class="project-tag">${t}</span>`).join('');
    
    const demoLinkHTML = proj.homepage && proj.homepage !== '#' && proj.homepage !== ''
      ? `<a href="${proj.homepage}" target="_blank" rel="noopener noreferrer" class="project-link">Сайт <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`
      : '';
    
    // For pinned projects without a GitHub repo, only show site link
    const isGitHubUrl = proj.html_url && proj.html_url.includes('github.com');
    const codeLinkHTML = isGitHubUrl
      ? `<a href="${proj.html_url}" target="_blank" rel="noopener noreferrer" class="project-link">Код <i class="fa-brands fa-github"></i></a>`
      : '';
      
    article.innerHTML = `
      <div class="project-thumb ${thumbClass}">
        <i class="${iconClass} project-thumb-icon"></i>
      </div>
      <div class="project-body">
        <div class="project-top">
          <h3 class="project-title">${proj.name}</h3>
          <span class="project-year">${proj.year}</span>
        </div>
        <p class="project-desc">${proj.description}</p>
        <div class="project-tags">
          ${tagsHTML}
        </div>
        <div class="project-links">
          ${demoLinkHTML}
          ${codeLinkHTML}
        </div>
      </div>
    `;
    
    container.appendChild(article);
  });
  
  // Re-initialize tilt effect for newly created cards
  initTiltEffect();
}
