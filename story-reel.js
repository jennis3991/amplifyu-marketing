/*
 * AmplifyU StoryReel — vanilla-JS port of the app's React StoryReel.jsx.
 * Self-contained, Instagram-Stories-style scene player. Ported line-for-line
 * from the app component (colors, timing, copy) so the marketing site shows
 * the same widget users see in the app's Story tab.
 * Include with: <div id="story-reel"></div><script src="story-reel.js" defer></script>
 */
(function () {
  var INK = '#1a1714';
  var CREAM = '#f0ebe2';
  var SAGE = '#6b7c6e';
  var FONT_SERIF = "'Cormorant Garamond','Georgia',serif";
  var FONT_SANS = "'Inter',-apple-system,sans-serif";
  var SCENE_MS = 7000;

  var SCENES = [
    {
      title: "The Return",
      quote: "I came back to a career that still mattered.",
      body: "A year ago, I returned from maternity leave. Two small children at home, a career that mattered to me, and a hard new reality: I could no longer afford to be anything less than precise. Every meeting, every conversation had to earn its place.",
      emotion: "Determination",
      image: "story-laptop-night.jpg"
    },
    {
      title: "The Realisation",
      quote: "Communication became the skill that multiplied everything else.",
      body: "I quickly realised that my ability to communicate clearly, to structure my thinking under pressure, to tell stories that landed, was the single highest-leverage skill I could develop. When I communicate well, I work faster, influence more, and come home with something left to give.",
      emotion: "Clarity"
    },
    {
      title: "Building the System",
      quote: "I needed more than instinct. I needed a system.",
      body: "I had strong instincts for communication and had built real credibility. But coming back, I wanted something I could call on when tired, when stretched, when operating across two full worlds simultaneously. I built AmplifyU because the tools I needed didn't exist.",
      emotion: "Purpose"
    },
    {
      title: "The Practice",
      quote: "Every session made improvement visible.",
      body: "The programme moves through fourteen deliberate modules: clarity, structure, voice. Then storytelling, connection, managing pressure. Then the hardest work: building presence, communicating ambition, creating exposure. Every session includes coaching that responds to your specific words, tools to rewrite and rehearse.",
      emotion: "Focus"
    },
    {
      title: "The Transformation",
      quote: "It wasn't talent. It was practice.",
      body: "I believe every person can become a better communicator. Not gifted. Not naturally smooth. But deliberate. Precise. Compelling. The professionals who transformed their communication did it through practice, repetition, and a system that made improvement visible to themselves and the people around them.",
      emotion: "Confidence"
    },
    {
      title: "The Life It Builds",
      quote: "When you communicate well, everything else expands.",
      body: "This platform was built in the margins of a full life. It is designed to be used in exactly the same way. Because the professionals who need these tools most are also the ones with the least time to waste, and the most to gain.",
      emotion: "Wholeness",
      image: "story-microphone.jpg"
    }
  ];

  var CONFIG = {
    coverImage: 'founder-photo.jpg',
    backgroundImage: 'd8-story-book.jpg',
    caption: "Here's my story, crafted with my own AmplifyU Speechwriter.",
    mediaEyebrow: 'The Story Architect',
    mediaHeadline: 'Build a story that moves people.',
    introHeadline: 'A working mother rebuilding her career through deliberate communication practice',
    introSubhead: 'Communication multiplies everything else'
  };

  var STYLE = document.createElement('style');
  STYLE.textContent =
    '@keyframes storyReelKenBurns{0%{transform:scale(1);}100%{transform:scale(1.14);}}' +
    '@keyframes storyReelPulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.12);opacity:0.75;}}' +
    '.story-reel-card button{outline:none;-webkit-tap-highlight-color:transparent;font:inherit;}' +
    '.story-reel-kenburns{animation:storyReelKenBurns 32s ease-in-out infinite alternate;}' +
    '.story-reel-pulse{animation:storyReelPulse 2.2s ease-in-out infinite;}' +
    '.story-reel-body{display:flex;flex-direction:column;}' +
    '.story-reel-media{flex:0 0 220px;}' +
    '.story-reel-content{padding:28px 24px 24px;}' +
    '.story-reel-quote{font-size:19px;}' +
    '.story-reel-cover-title{font-size:24px;}' +
    '.story-reel-segment{height:2px;border-radius:1px;}' +
    '@media (min-width:720px){' +
    '.story-reel-body{flex-direction:row;}' +
    '.story-reel-media{flex:0 0 42%;}' +
    '.story-reel-content{padding:44px 48px;}' +
    '.story-reel-quote{font-size:21px;}' +
    '.story-reel-cover-title{font-size:32px;}' +
    '.story-reel-segment{height:3px;border-radius:2px;}' +
    '}' +
    '@media (prefers-reduced-motion:reduce){.story-reel-kenburns,.story-reel-pulse{animation:none !important;}}';
  document.head.appendChild(STYLE);

  function prefersReducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'style') Object.assign(el.style, attrs.style);
        else if (k === 'className') el.className = attrs[k];
        else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else el.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  function playGlyphEl(reducedMotion) {
    var wrap = h('div', {
      className: reducedMotion ? '' : 'story-reel-pulse',
      style: {
        width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(240,235,226,0.12)',
        border: '1px solid rgba(240,235,226,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }
    });
    wrap.innerHTML = '<svg width="18" height="20" viewBox="0 0 18 20" fill="none"><path d="M1 1.5v17l16-8.5-16-8.5z" fill="' + CREAM + '"/></svg>';
    return wrap;
  }

  function closeIconSVG() {
    return '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="' + CREAM + '" stroke-width="1.6" stroke-linecap="round"/></svg>';
  }

  function StoryReel(root, opts) {
    var scenes = opts.scenes, total = scenes.length;
    var reducedMotion = prefersReducedMotion();
    var state = { isOpen: false, started: !opts.introHeadline, activeScene: 0, isPaused: false };

    var rafId = null, startTs = null, elapsed = 0;

    function clearRaf() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

    function isRunning() { return state.isOpen && state.started && !state.isPaused && !reducedMotion; }

    function resetProgress() { elapsed = 0; startTs = null; clearRaf(); }

    function tickLoop() {
      function tick(ts) {
        if (startTs == null) startTs = ts - elapsed;
        elapsed = ts - startTs;
        var p = Math.min(elapsed / SCENE_MS, 1);
        updateProgressBar(p);
        if (p >= 1) { next(); return; }
        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }

    function updateProgressBar(p) {
      var fills = root.querySelectorAll('.story-reel-fill');
      fills.forEach(function (fill, i) {
        var w;
        if (!state.started) w = '0%';
        else if (i < state.activeScene) w = '100%';
        else if (i > state.activeScene) w = '0%';
        else w = ((reducedMotion ? 1 : p) * 100) + '%';
        fill.style.width = w;
        fill.style.transition = (reducedMotion || i === state.activeScene) ? 'none' : 'width 150ms ease';
      });
    }

    function goTo(i) { state.activeScene = ((i % total) + total) % total; onSceneChange(); }
    function next() { goTo(state.activeScene + 1); }
    function prev() { goTo(state.activeScene - 1); }
    function begin() { state.started = true; onSceneChange(); }
    function close() {
      state.isOpen = false;
      state.started = !opts.introHeadline;
      state.activeScene = 0;
      resetProgress();
      render();
    }
    function pauseOn() { state.isPaused = true; syncRaf(); }
    function pauseOff() { state.isPaused = false; syncRaf(); }

    function onSceneChange() {
      resetProgress();
      render();
      syncRaf();
    }

    function syncRaf() {
      clearRaf();
      if (isRunning()) tickLoop();
    }

    // ── Cover (closed) state ──
    function renderCover() {
      root.innerHTML = '';
      var btn = h('button', {
        'aria-label': 'Play: The Story Behind AmplifyU',
        style: {
          all: 'unset', cursor: 'pointer', display: 'block', width: '100%', position: 'relative',
          borderRadius: '14px', overflow: 'hidden', minHeight: '340px'
        },
        onClick: function () { state.isOpen = true; resetProgress(); render(); syncRaf(); }
      });

      var img = h('img', {
        loading: 'lazy', src: opts.coverImage, alt: '',
        style: {
          position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 12%',
          filter: 'grayscale(0.5) sepia(0.18) brightness(0.6) contrast(1.05)'
        }
      });
      var vignette = h('div', { style: { position: 'absolute', inset: '0', background: 'radial-gradient(ellipse at 50% 25%, rgba(26,23,20,0.1) 0%, rgba(26,23,20,0.94) 88%)' } });

      var inner = h('div', {
        style: {
          position: 'relative', minHeight: '340px', padding: '40px 28px', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', textAlign: 'center'
        }
      }, [
        playGlyphEl(reducedMotion),
        h('h2', { className: 'story-reel-cover-title', style: { fontFamily: FONT_SERIF, fontWeight: '600', color: CREAM, margin: '0', letterSpacing: '-0.3px' } }, ['The Story Behind AmplifyU']),
        h('span', { style: { fontFamily: FONT_SANS, fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(240,235,226,0.55)' } }, ['Tap to play']),
        opts.caption ? h('p', { style: { fontFamily: FONT_SERIF, fontSize: '14px', fontStyle: 'italic', color: 'rgba(240,235,226,0.7)', margin: '4px 0 0', maxWidth: '320px' } }, [opts.caption]) : null
      ]);

      btn.appendChild(img);
      btn.appendChild(vignette);
      btn.appendChild(inner);
      root.appendChild(btn);
    }

    // ── Open (playing) state ──
    function renderOpen() {
      root.innerHTML = '';
      var card = h('div', {
        className: 'story-reel-card',
        style: { position: 'relative', borderRadius: '14px', overflow: 'hidden', background: INK },
        onMouseenter: pauseOn, onMouseleave: pauseOff,
        onTouchstart: pauseOn, onTouchend: pauseOff, onTouchcancel: pauseOff
      });

      // Segmented progress bar
      var bar = h('div', { style: { display: 'flex', gap: '4px', padding: '11px 16px 0', position: 'relative', zIndex: '2' } });
      scenes.forEach(function (sc, i) {
        var track = h('div', { className: 'story-reel-segment', style: { background: 'rgba(240,235,226,0.28)', overflow: 'hidden' } });
        var fill = h('div', { className: 'story-reel-segment story-reel-fill', style: { background: SAGE, width: '0%' } });
        track.appendChild(fill);
        var segBtn = h('button', {
          'aria-label': 'Go to scene ' + (i + 1) + ': ' + sc.title,
          style: { flex: '1', background: 'transparent', border: 'none', padding: '6px 0', cursor: state.started ? 'pointer' : 'default' },
          onClick: function () { if (state.started) goTo(i); }
        }, [track]);
        bar.appendChild(segBtn);
      });

      // Tap zones
      var tapZones = h('div', { style: { position: 'absolute', inset: '0', display: 'flex', zIndex: '1' } }, [
        h('button', {
          'aria-label': state.started ? 'Previous scene' : 'Story intro',
          style: { flex: '1', background: 'transparent', border: 'none', cursor: state.started ? 'pointer' : 'default' },
          onClick: function () { if (state.started) prev(); }
        }),
        h('button', {
          'aria-label': state.started ? 'Next scene' : 'Begin story',
          style: { flex: '1', background: 'transparent', border: 'none', cursor: 'pointer' },
          onClick: function () { state.started ? next() : begin(); }
        })
      ]);

      // Media pane — each scene can carry its own image (falls back to the shared default)
      var currentImage = state.started ? (scenes[state.activeScene].image || opts.backgroundImage) : opts.backgroundImage;
      var mediaImg = h('img', {
        loading: 'lazy', src: currentImage, alt: '',
        className: reducedMotion ? '' : 'story-reel-kenburns',
        style: { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover' }
      });
      var mediaGradient = h('div', { style: { position: 'absolute', inset: '0', background: 'linear-gradient(180deg, rgba(26,23,20,0.1) 0%, rgba(26,23,20,0.7) 100%)' } });
      var mediaCaption = null;
      if (opts.mediaEyebrow || opts.mediaHeadline) {
        mediaCaption = h('div', { style: { position: 'absolute', bottom: '18px', left: '20px', right: '20px' } }, [
          opts.mediaEyebrow ? h('div', { style: { fontFamily: FONT_SANS, fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(168,179,163,0.9)', marginBottom: '8px' } }, [opts.mediaEyebrow]) : null,
          opts.mediaHeadline ? h('div', { style: { fontFamily: FONT_SERIF, fontWeight: '500', color: CREAM, fontSize: '19px', lineHeight: '1.2', letterSpacing: '-0.3px' } }, [opts.mediaHeadline]) : null
        ]);
      }
      var closeBtn = h('button', {
        'aria-label': 'Close story',
        style: {
          position: 'absolute', top: '14px', right: '14px', width: '30px', height: '30px', borderRadius: '50%',
          border: 'none', background: 'rgba(26,23,20,0.5)', cursor: 'pointer', pointerEvents: 'auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        },
        onClick: close
      });
      closeBtn.innerHTML = closeIconSVG();

      var media = h('div', { className: 'story-reel-media', style: { position: 'relative', overflow: 'hidden', minHeight: '200px' } });
      media.appendChild(mediaImg);
      media.appendChild(mediaGradient);
      if (mediaCaption) media.appendChild(mediaCaption);
      media.appendChild(closeBtn);

      // Content pane
      var content = h('div', { className: 'story-reel-content', style: { flex: '1', background: CREAM, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' } });
      var page = h('div', { style: { position: 'relative' } });

      if (!state.started) {
        var introInner = h('div', {}, [
          h('h3', { className: 'story-reel-quote', style: { fontFamily: FONT_SERIF, fontWeight: '500', color: INK, margin: '0 0 10px', lineHeight: '1.3', letterSpacing: '-0.3px' } }, [opts.introHeadline]),
          opts.introSubhead ? h('p', { style: { fontFamily: FONT_SANS, fontSize: '13px', color: 'rgba(26,23,20,0.5)', margin: '0' } }, [opts.introSubhead]) : null
        ]);
        page.appendChild(introInner);
      } else {
        var scene = scenes[state.activeScene];
        var sceneInner = h('div', {}, [
          h('div', { style: { fontFamily: FONT_SANS, fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(26,23,20,0.42)', marginBottom: '12px' } }, ['Scene ' + (state.activeScene + 1) + ' of ' + total + ' · ' + scene.title]),
          h('h3', { className: 'story-reel-quote', style: { fontFamily: FONT_SERIF, fontWeight: '500', color: INK, margin: '0 0 16px', lineHeight: '1.3', letterSpacing: '-0.3px' } }, ['“' + scene.quote + '”']),
          h('p', { style: { fontFamily: FONT_SANS, fontSize: '14.5px', color: 'rgba(26,23,20,0.72)', lineHeight: '1.7', margin: '0 0 20px' } }, [scene.body]),
          h('span', {
            style: {
              display: 'inline-block', fontFamily: FONT_SANS, fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px',
              textTransform: 'uppercase', color: SAGE, background: 'rgba(107,124,110,0.14)', border: '1px solid rgba(107,124,110,0.3)',
              borderRadius: '20px', padding: '6px 14px', opacity: '0', transform: 'scale(0.85)',
              transition: reducedMotion ? 'none' : 'opacity 260ms ease 160ms, transform 260ms ease 160ms'
            }
          }, [scene.emotion])
        ]);
        page.appendChild(sceneInner);
      }

      // Wipe overlay (re-mounted per scene change, matching React's key-remount trick)
      if (!reducedMotion) {
        var wipe = h('div', {
          'aria-hidden': 'true',
          style: { position: 'absolute', inset: '0', background: CREAM, pointerEvents: 'none', transform: 'translateX(0%)', transition: 'transform 750ms cubic-bezier(.65,0,.35,1)' }
        });
        page.appendChild(wipe);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { wipe.style.transform = 'translateX(-100%)'; });
        });
      }

      content.appendChild(page);

      // Nav row
      var navRow = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', pointerEvents: 'auto' } });
      if (state.started) {
        navRow.appendChild(h('button', {
          style: { background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: '13px', fontWeight: '600', color: INK, padding: '6px 0' },
          onClick: prev
        }, ['← Previous']));
        navRow.appendChild(h('span', { style: { fontFamily: FONT_SANS, fontSize: '12px', color: 'rgba(26,23,20,0.4)' } }, ['Scene ' + (state.activeScene + 1) + ' of ' + total]));
        navRow.appendChild(h('button', {
          style: { background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: '13px', fontWeight: '600', color: INK, padding: '6px 0' },
          onClick: next
        }, ['Next →']));
      } else {
        navRow.appendChild(h('button', {
          style: { marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: '13px', fontWeight: '600', color: INK, padding: '6px 0' },
          onClick: begin
        }, ['Begin →']));
      }
      content.appendChild(navRow);

      var body = h('div', { className: 'story-reel-body', style: { position: 'relative', zIndex: '2', pointerEvents: 'none' } }, [media, content]);

      card.appendChild(bar);
      card.appendChild(tapZones);
      card.appendChild(body);
      root.appendChild(card);
      updateProgressBar(0);

      // Fade in the emotion pill after the wipe has had time to sweep
      if (state.started) {
        var pill = card.querySelector('.story-reel-content span');
        if (pill) {
          setTimeout(function () {
            pill.style.opacity = reducedMotion ? '1' : '1';
            pill.style.transform = 'scale(1)';
          }, reducedMotion ? 0 : 30);
        }
      }
    }

    function render() {
      if (!state.isOpen) renderCover();
      else renderOpen();
    }

    render();
  }

  function init() {
    var root = document.getElementById('story-reel');
    if (!root) return;
    StoryReel(root, {
      scenes: SCENES,
      coverImage: CONFIG.coverImage,
      backgroundImage: CONFIG.backgroundImage,
      caption: CONFIG.caption,
      mediaEyebrow: CONFIG.mediaEyebrow,
      mediaHeadline: CONFIG.mediaHeadline,
      introHeadline: CONFIG.introHeadline,
      introSubhead: CONFIG.introSubhead
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
