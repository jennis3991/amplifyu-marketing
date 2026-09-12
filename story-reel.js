/*
 * AmplifyU StoryReel — vanilla-JS port of the app's React StoryReel.jsx.
 * Self-contained, always-on autoplaying scene carousel: starts playing as
 * soon as it mounts, loops continuously, fills whatever fixed-size box its
 * container gives it (so every scene renders at the same size).
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
    backgroundImage: 'd8-story-book.jpg',
    mediaEyebrow: 'The Story Architect',
    mediaHeadline: 'Build a story that moves people.'
  };

  var STYLE = document.createElement('style');
  STYLE.textContent =
    '@keyframes storyReelKenBurns{0%{transform:scale(1);}100%{transform:scale(1.14);}}' +
    '.story-reel-card button{outline:none;-webkit-tap-highlight-color:transparent;font:inherit;}' +
    '.story-reel-kenburns{animation:storyReelKenBurns 32s ease-in-out infinite alternate;}' +
    '#story-reel{width:100%;height:100%;}' +
    '.story-reel-card{width:100%;height:100%;}' +
    '.story-reel-body{display:flex;flex-direction:row;height:100%;}' +
    '.story-reel-media{flex:0 0 40%;}' +
    '.story-reel-content{padding:16px 18px;}' +
    '.story-reel-eyebrow{font-size:8px;margin-bottom:5px;}' +
    '.story-reel-quote{font-size:14px;margin:0 0 5px;line-height:1.25;}' +
    '.story-reel-bodytext{font-size:10.5px;line-height:1.42;margin:0 0 7px;}' +
    '.story-reel-navbtn{font-size:10px;}' +
    '.story-reel-navlabel{font-size:9px;}' +
    '.story-reel-mediacap{left:14px;right:14px;bottom:12px;}' +
    '.story-reel-mediaeyebrow{font-size:8px;margin-bottom:3px;}' +
    '.story-reel-mediaheadline{font-size:11px;line-height:1.25;}' +
    '@media (min-width:900px){' +
    '.story-reel-content{padding:28px 34px;}' +
    '.story-reel-eyebrow{font-size:10px;margin-bottom:10px;}' +
    '.story-reel-quote{font-size:19px;margin:0 0 10px;line-height:1.3;}' +
    '.story-reel-bodytext{font-size:13.5px;line-height:1.55;margin:0 0 14px;}' +
    '.story-reel-mediacap{left:24px;right:24px;bottom:20px;}' +
    '.story-reel-mediaeyebrow{font-size:10px;margin-bottom:5px;}' +
    '.story-reel-mediaheadline{font-size:15px;line-height:1.25;}' +
    '.story-reel-navbtn{font-size:11px;}' +
    '.story-reel-navlabel{font-size:10px;}' +
    '}' +
    '@media (prefers-reduced-motion:reduce){.story-reel-kenburns{animation:none !important;}}';
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

  function StoryReel(root, opts) {
    var scenes = opts.scenes, total = scenes.length;
    var reducedMotion = prefersReducedMotion();
    var state = { activeScene: 0, isPaused: false };

    var rafId = null, startTs = null, elapsed = 0;

    function clearRaf() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }
    function isRunning() { return !state.isPaused && !reducedMotion; }
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
        if (i < state.activeScene) w = '100%';
        else if (i > state.activeScene) w = '0%';
        else w = ((reducedMotion ? 1 : p) * 100) + '%';
        fill.style.width = w;
        fill.style.transition = (reducedMotion || i === state.activeScene) ? 'none' : 'width 150ms ease';
      });
    }

    function goTo(i) { state.activeScene = ((i % total) + total) % total; onSceneChange(); }
    function next() { goTo(state.activeScene + 1); }
    function prev() { goTo(state.activeScene - 1); }
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

    function render() {
      root.innerHTML = '';
      var scene = scenes[state.activeScene];
      var card = h('div', {
        className: 'story-reel-card',
        style: { position: 'relative', borderRadius: '14px', overflow: 'hidden', background: INK },
        onMouseenter: pauseOn, onMouseleave: pauseOff,
        onTouchstart: pauseOn, onTouchend: pauseOff, onTouchcancel: pauseOff
      });

      // Segmented progress bar
      var bar = h('div', { style: { display: 'flex', gap: '4px', padding: '14px 18px 0', position: 'absolute', top: '0', left: '0', right: '0', zIndex: '3' } });
      scenes.forEach(function (sc, i) {
        var track = h('div', { style: { height: '2px', borderRadius: '1px', background: 'rgba(240,235,226,0.28)', overflow: 'hidden' } });
        var fill = h('div', { className: 'story-reel-fill', style: { height: '100%', background: SAGE, width: '0%' } });
        track.appendChild(fill);
        var segBtn = h('button', {
          'aria-label': 'Go to scene ' + (i + 1) + ': ' + sc.title,
          style: { flex: '1', background: 'transparent', border: 'none', padding: '4px 0', cursor: 'pointer' },
          onClick: function () { goTo(i); }
        }, [track]);
        bar.appendChild(segBtn);
      });

      // Tap zones — bottom layer, so real controls win over them
      var tapZones = h('div', { style: { position: 'absolute', inset: '0', display: 'flex', zIndex: '1' } }, [
        h('button', { 'aria-label': 'Previous scene', style: { flex: '1', background: 'transparent', border: 'none', cursor: 'pointer' }, onClick: prev }),
        h('button', { 'aria-label': 'Next scene', style: { flex: '1', background: 'transparent', border: 'none', cursor: 'pointer' }, onClick: next })
      ]);

      // Media pane — each scene can carry its own image (falls back to the shared default)
      var currentImage = scene.image || opts.backgroundImage;
      var mediaImg = h('img', {
        loading: 'lazy', src: currentImage, alt: '',
        className: reducedMotion ? '' : 'story-reel-kenburns',
        style: { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover' }
      });
      var mediaGradient = h('div', { style: { position: 'absolute', inset: '0', background: 'linear-gradient(180deg, rgba(26,23,20,0.1) 0%, rgba(26,23,20,0.7) 100%)' } });
      var mediaCaption = null;
      if (opts.mediaEyebrow || opts.mediaHeadline) {
        mediaCaption = h('div', { className: 'story-reel-mediacap', style: { position: 'absolute' } }, [
          opts.mediaEyebrow ? h('div', { className: 'story-reel-mediaeyebrow', style: { fontFamily: FONT_SANS, fontWeight: '700', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'rgba(168,179,163,0.9)' } }, [opts.mediaEyebrow]) : null,
          opts.mediaHeadline ? h('div', { className: 'story-reel-mediaheadline', style: { fontFamily: FONT_SERIF, fontWeight: '500', color: CREAM, letterSpacing: '-0.2px' } }, [opts.mediaHeadline]) : null
        ]);
      }

      var media = h('div', { className: 'story-reel-media', style: { position: 'relative', overflow: 'hidden' } });
      media.appendChild(mediaImg);
      media.appendChild(mediaGradient);
      if (mediaCaption) media.appendChild(mediaCaption);

      // Content pane
      var content = h('div', { className: 'story-reel-content', style: { position: 'relative', flex: '1', background: CREAM, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' } });
      var page = h('div', {});

      var sceneInner = h('div', {}, [
        h('div', { className: 'story-reel-eyebrow', style: { fontFamily: FONT_SANS, fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(26,23,20,0.42)' } }, ['Scene ' + (state.activeScene + 1) + ' of ' + total + ' · ' + scene.title]),
        h('h3', { className: 'story-reel-quote', style: { fontFamily: FONT_SERIF, fontWeight: '500', color: INK, letterSpacing: '-0.3px' } }, ['“' + scene.quote + '”']),
        h('p', {
          className: 'story-reel-bodytext',
          style: { fontFamily: FONT_SANS, color: 'rgba(26,23,20,0.72)' }
        }, [scene.body]),
        h('span', {
          style: {
            display: 'inline-block', fontFamily: FONT_SANS, fontSize: '11px', fontWeight: '700', letterSpacing: '1px',
            textTransform: 'uppercase', color: SAGE, background: 'rgba(107,124,110,0.14)', border: '1px solid rgba(107,124,110,0.3)',
            borderRadius: '16px', padding: '6px 14px', opacity: '0', transform: 'scale(0.85)',
            transition: reducedMotion ? 'none' : 'opacity 260ms ease 160ms, transform 260ms ease 160ms'
          }
        }, [scene.emotion])
      ]);
      page.appendChild(sceneInner);
      content.appendChild(page);

      // Wipe overlay (re-mounted per scene change) — covers the full content
      // pane (a sibling of `page`, not nested inside it, so it always spans
      // the card's real height regardless of how much text a scene has).
      // Set the starting transform, force a synchronous style flush by
      // reading a layout property, then set the end transform so the
      // browser is guaranteed to animate between the two states rather than
      // possibly coalescing them into a single no-op frame.
      if (!reducedMotion) {
        var wipe = h('div', {
          'aria-hidden': 'true',
          style: { position: 'absolute', inset: '0', background: CREAM, pointerEvents: 'none', transform: 'translateX(0%)', transition: 'transform 750ms cubic-bezier(.65,0,.35,1)' }
        });
        content.appendChild(wipe);
        void wipe.offsetHeight;
        wipe.style.transform = 'translateX(-100%)';
      }

      // Nav row
      var navRow = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', pointerEvents: 'auto' } });
      navRow.appendChild(h('button', {
        className: 'story-reel-navbtn',
        style: { background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontWeight: '600', color: INK, padding: '4px 0' },
        onClick: prev
      }, ['← Previous']));
      navRow.appendChild(h('span', { className: 'story-reel-navlabel', style: { fontFamily: FONT_SANS, color: 'rgba(26,23,20,0.4)' } }, ['Scene ' + (state.activeScene + 1) + ' of ' + total]));
      navRow.appendChild(h('button', {
        className: 'story-reel-navbtn',
        style: { background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontWeight: '600', color: INK, padding: '4px 0' },
        onClick: next
      }, ['Next →']));
      content.appendChild(navRow);

      var body = h('div', { className: 'story-reel-body', style: { position: 'relative', zIndex: '2', pointerEvents: 'none' } }, [media, content]);

      card.appendChild(bar);
      card.appendChild(tapZones);
      card.appendChild(body);
      root.appendChild(card);
      updateProgressBar(0);

      // Fade in the emotion pill after the wipe has had time to sweep
      var pill = card.querySelector('.story-reel-content span');
      if (pill) {
        setTimeout(function () {
          pill.style.opacity = '1';
          pill.style.transform = 'scale(1)';
        }, reducedMotion ? 0 : 30);
      }
    }

    render();
    syncRaf();
  }

  function init() {
    var root = document.getElementById('story-reel');
    if (!root) return;
    StoryReel(root, {
      scenes: SCENES,
      backgroundImage: CONFIG.backgroundImage,
      mediaEyebrow: CONFIG.mediaEyebrow,
      mediaHeadline: CONFIG.mediaHeadline
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
