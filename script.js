const sections = [...document.querySelectorAll('.scene')];
const openGiftBtn = document.getElementById('openGift');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const envelope = document.getElementById('envelope');
const envelopeWrap = document.getElementById('envelopeWrap');
const typedLetter = document.getElementById('typedLetter');
const wishGrid = document.getElementById('wishGrid');
const galleryGrid = document.getElementById('galleryGrid');
const lightbox = document.getElementById('lightbox');
const lightboxStage = document.getElementById('lightboxStage');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxCounter = document.getElementById('lightboxCounter');
const closeLightbox = document.getElementById('closeLightbox');
const prevLightbox = document.getElementById('prevLightbox');
const nextLightbox = document.getElementById('nextLightbox');
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const confettiCanvas = document.getElementById('confettiCanvas');

let current = 0;
let letterTyped = false;
let confettiTriggered = false;
let audioUnlocked = false;

const ENVELOPE_SFX_ENABLED = false;
const ENVELOPE_SFX_URL = '/jiji/assets/music/paper-open.mp3';
let envelopeAudio = null;

const memories = [
  { caption: 'Golden Moments', src: 'https://i.ibb.co/998Y2HcR/memory-1.jpg' },
  { caption: 'Laughter & Light', src: 'https://i.ibb.co/qYJZsSc0/memory-2.jpg' },
  { caption: 'Beautiful Memories', src: 'https://i.ibb.co/cSwRVTzR/memory-3.jpg' },
  { caption: 'Unforgettable Smile', src: 'https://i.ibb.co/35Xnkcr5/memory-4.jpg' },
  { caption: 'Shared Joy', src: 'https://i.ibb.co/qFn1Q35y/memory-5.jpg' },
  { caption: 'Graceful Days', src: 'https://i.ibb.co/spMRfcVR/memory-6.jpg' },
  { caption: 'Special Memories', src: 'https://i.ibb.co/tTH8RqQn/memory-7.jpg' },
  { caption: 'Forever Joyful', src: 'https://i.ibb.co/WNvb32cY/memory-8.jpg' }
];

const lightboxState = {
  isOpen: false,
  index: 0,
  scale: 1,
  minScale: 1,
  maxScale: 4,
  tx: 0,
  ty: 0,
  startX: 0,
  startY: 0,
  originTx: 0,
  originTy: 0,
  dragging: false,
  pinchStartDist: 0,
  pinchStartScale: 1,
  swipeStartX: 0,
  swipeStartY: 0
};

function showSection(index) {
  current = Math.max(0, Math.min(index, sections.length - 1));
  sections.forEach((s, i) => s.classList.toggle('active', i === current));
  sections[current].querySelector('h1,h2,p,button')?.focus?.({ preventScroll: true });

  if (sections[current].id === 'wishes') revealWishes();
  if (sections[current].id === 'blessing' && !confettiTriggered) {
    confettiTriggered = true;
    launchConfetti();
  }
}

prevBtn.addEventListener('click', () => showSection(current - 1));
nextBtn.addEventListener('click', () => showSection(current + 1));

function rippleEffect(button, e) {
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;
    width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;
    top:${e.clientY - rect.top - size / 2}px;background:rgba(255,255,255,.4);
    transform:scale(0);animation:ripple .6s ease-out;`;
  button.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

const dynamicStyle = document.createElement('style');
dynamicStyle.textContent = `@keyframes ripple{to{transform:scale(2);opacity:0;}}`;
document.head.appendChild(dynamicStyle);

openGiftBtn.addEventListener('click', (e) => {
  rippleEffect(openGiftBtn, e);
  showSection(1);
  if (!audioUnlocked) {
    audioUnlocked = true;
    bgMusic.play().catch(() => {});
    musicToggle.setAttribute('aria-pressed', 'true');
    musicToggle.textContent = '❚❚ Music';
  }
});

musicToggle.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play().catch(() => {});
    musicToggle.setAttribute('aria-pressed', 'true');
    musicToggle.textContent = '❚❚ Music';
  } else {
    bgMusic.pause();
    musicToggle.setAttribute('aria-pressed', 'false');
    musicToggle.textContent = '▶ Music';
  }
});

const letterText = `I celebrate the beauty of your heart,
  the strength of your spirit, and the light you bring to everyone around you.
  May this year bring unforgettable joy, new adventures, and wonderful memories.`;

function typeLetter() {
  if (letterTyped) return;
  letterTyped = true;
  let i = 0;
  const timer = setInterval(() => {
    typedLetter.textContent += letterText[i] || '';
    i += 1;
    if (i >= letterText.length) clearInterval(timer);
  }, 28);
}

function openEnvelope() {
  if (envelope.classList.contains('open')) return;
  envelopeWrap.classList.add('opened');
  envelope.classList.add('open');
  envelope.setAttribute('aria-expanded', 'true');
  typeLetter();

  if (ENVELOPE_SFX_ENABLED) {
    if (!envelopeAudio) envelopeAudio = new Audio(ENVELOPE_SFX_URL);
    envelopeAudio.currentTime = 0;
    envelopeAudio.play().catch(() => {});
  }
}

envelope.addEventListener('click', openEnvelope);
envelope.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openEnvelope();
  }
});

const wishes = ['Joy', 'Peace', 'Good Health', 'Success', 'Wisdom', 'Inspiration', 'Love', 'Protection', 'Grace', 'Purpose'];
wishGrid.innerHTML = wishes.map((w) => `<article class="wish-card"><h3>${w}</h3></article>`).join('');

function revealWishes() {
  [...wishGrid.children].forEach((card, i) => {
    setTimeout(() => card.classList.add('show'), i * 130);
  });
}

galleryGrid.innerHTML = memories
  .map(
    (item, index) => `
  <figure class="memory" data-src="${item.src}" data-caption="${item.caption}" data-index="${index}">
    <img src="${item.src}" alt="${item.caption}" loading="lazy" referrerpolicy="no-referrer" />
    <figcaption>${item.caption}</figcaption>
  </figure>`
  )
  .join('');

function updateCounterAndCaption() {
  const item = memories[lightboxState.index];
  lightboxCounter.textContent = `${lightboxState.index + 1} of ${memories.length}`;
  lightboxCaption.textContent = item.caption;
}

function clampTranslation() {
  const stage = lightboxStage.getBoundingClientRect();
  if (!stage.width || !stage.height || !lightboxImg.naturalWidth || !lightboxImg.naturalHeight) return;

  const fitRatio = Math.min(stage.width / lightboxImg.naturalWidth, stage.height / lightboxImg.naturalHeight);
  const baseW = lightboxImg.naturalWidth * fitRatio;
  const baseH = lightboxImg.naturalHeight * fitRatio;
  const maxX = Math.max(0, (baseW * lightboxState.scale - stage.width) / 2);
  const maxY = Math.max(0, (baseH * lightboxState.scale - stage.height) / 2);

  lightboxState.tx = Math.min(maxX, Math.max(-maxX, lightboxState.tx));
  lightboxState.ty = Math.min(maxY, Math.max(-maxY, lightboxState.ty));
}

function applyImageTransform() {
  clampTranslation();
  lightboxImg.style.transform = `translate(${lightboxState.tx}px, ${lightboxState.ty}px) scale(${lightboxState.scale})`;
}

function resetZoomPan() {
  lightboxState.scale = 1;
  lightboxState.tx = 0;
  lightboxState.ty = 0;
  applyImageTransform();
}

function setLightboxImage(index, sourceImg) {
  lightboxState.index = (index + memories.length) % memories.length;
  const item = memories[lightboxState.index];

  lightboxImg.style.opacity = '0';
  lightboxImg.src = item.src;
  updateCounterAndCaption();

  lightboxImg.onload = () => {
    resetZoomPan();

    if (sourceImg) {
      animateImageIntoLightbox(sourceImg);
    } else {
      lightboxImg.style.opacity = '1';
      lightboxImg.animate(
        [
          { transform: 'translate(0, 16px) scale(.92)', opacity: 0 },
          { transform: 'translate(0, 0) scale(1)', opacity: 1 }
        ],
        { duration: 280, easing: 'cubic-bezier(.22,.61,.36,1)' }
      );
      lightboxImg.style.opacity = '1';
    }
  };
}

function animateImageIntoLightbox(sourceImg) {
  const sourceRect = sourceImg.getBoundingClientRect();
  const targetRect = lightboxImg.getBoundingClientRect();

  const clone = sourceImg.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = `${sourceRect.left}px`;
  clone.style.top = `${sourceRect.top}px`;
  clone.style.width = `${sourceRect.width}px`;
  clone.style.height = `${sourceRect.height}px`;
  clone.style.borderRadius = '16px';
  clone.style.zIndex = '120';
  clone.style.objectFit = 'cover';
  clone.style.pointerEvents = 'none';
  document.body.appendChild(clone);

  clone.animate(
    [
      {
        left: `${sourceRect.left}px`,
        top: `${sourceRect.top}px`,
        width: `${sourceRect.width}px`,
        height: `${sourceRect.height}px`,
        opacity: 1
      },
      {
        left: `${targetRect.left}px`,
        top: `${targetRect.top}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        opacity: 1
      }
    ],
    { duration: 350, easing: 'cubic-bezier(.22,.61,.36,1)' }
  ).onfinish = () => {
    clone.remove();
    lightboxImg.style.opacity = '1';
  };
}

function openLightbox(index, sourceImg) {
  lightboxState.isOpen = true;
  lightbox.classList.add('show');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  setLightboxImage(index, sourceImg);
}

function closeLightboxModal() {
  lightboxState.isOpen = false;
  lightbox.classList.remove('show');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  resetZoomPan();
}

function showPrevMemory() {
  setLightboxImage(lightboxState.index - 1);
}

function showNextMemory() {
  setLightboxImage(lightboxState.index + 1);
}

galleryGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.memory');
  if (!card) return;
  const img = card.querySelector('img');
  openLightbox(Number(card.dataset.index), img);
});

closeLightbox.addEventListener('click', closeLightboxModal);
prevLightbox.addEventListener('click', showPrevMemory);
nextLightbox.addEventListener('click', showNextMemory);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightboxModal();
});

lightboxStage.addEventListener('click', (e) => {
  if (e.target === lightboxStage) closeLightboxModal();
});

function wheelZoom(e) {
  if (!lightboxState.isOpen) return;
  e.preventDefault();
  const direction = e.deltaY > 0 ? -0.2 : 0.2;
  lightboxState.scale = Math.min(lightboxState.maxScale, Math.max(lightboxState.minScale, lightboxState.scale + direction));
  if (lightboxState.scale === 1) {
    lightboxState.tx = 0;
    lightboxState.ty = 0;
  }
  applyImageTransform();
}

lightboxStage.addEventListener('wheel', wheelZoom, { passive: false });

lightboxStage.addEventListener('mousedown', (e) => {
  if (!lightboxState.isOpen || lightboxState.scale <= 1) return;
  lightboxState.dragging = true;
  lightboxState.startX = e.clientX;
  lightboxState.startY = e.clientY;
  lightboxState.originTx = lightboxState.tx;
  lightboxState.originTy = lightboxState.ty;
  lightboxStage.classList.add('dragging');
});

window.addEventListener('mousemove', (e) => {
  if (!lightboxState.dragging) return;
  lightboxState.tx = lightboxState.originTx + (e.clientX - lightboxState.startX);
  lightboxState.ty = lightboxState.originTy + (e.clientY - lightboxState.startY);
  applyImageTransform();
});

window.addEventListener('mouseup', () => {
  lightboxState.dragging = false;
  lightboxStage.classList.remove('dragging');
});

function touchDistance(t1, t2) {
  return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
}

lightboxStage.addEventListener(
  'touchstart',
  (e) => {
    if (!lightboxState.isOpen) return;

    if (e.touches.length === 2) {
      lightboxState.pinchStartDist = touchDistance(e.touches[0], e.touches[1]);
      lightboxState.pinchStartScale = lightboxState.scale;
      return;
    }

    const touch = e.touches[0];
    lightboxState.swipeStartX = touch.clientX;
    lightboxState.swipeStartY = touch.clientY;

    if (lightboxState.scale > 1) {
      lightboxState.dragging = true;
      lightboxState.startX = touch.clientX;
      lightboxState.startY = touch.clientY;
      lightboxState.originTx = lightboxState.tx;
      lightboxState.originTy = lightboxState.ty;
    }
  },
  { passive: true }
);

lightboxStage.addEventListener(
  'touchmove',
  (e) => {
    if (!lightboxState.isOpen) return;

    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = touchDistance(e.touches[0], e.touches[1]);
      const nextScale = lightboxState.pinchStartScale * (dist / lightboxState.pinchStartDist);
      lightboxState.scale = Math.min(lightboxState.maxScale, Math.max(lightboxState.minScale, nextScale));
      if (lightboxState.scale === 1) {
        lightboxState.tx = 0;
        lightboxState.ty = 0;
      }
      applyImageTransform();
      return;
    }

    if (lightboxState.dragging && lightboxState.scale > 1) {
      e.preventDefault();
      const touch = e.touches[0];
      lightboxState.tx = lightboxState.originTx + (touch.clientX - lightboxState.startX);
      lightboxState.ty = lightboxState.originTy + (touch.clientY - lightboxState.startY);
      applyImageTransform();
    }
  },
  { passive: false }
);

lightboxStage.addEventListener('touchend', (e) => {
  if (!lightboxState.isOpen) return;

  if (lightboxState.dragging && lightboxState.scale > 1) {
    lightboxState.dragging = false;
    return;
  }

  if (lightboxState.scale > 1) return;

  const changed = e.changedTouches[0];
  if (!changed) return;

  const deltaX = changed.clientX - lightboxState.swipeStartX;
  const deltaY = changed.clientY - lightboxState.swipeStartY;

  if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 40) {
    if (deltaX > 0) showPrevMemory();
    else showNextMemory();
  }
});

window.addEventListener('keydown', (e) => {
  if (lightboxState.isOpen) {
    if (e.key === 'Escape') closeLightboxModal();
    if (e.key === 'ArrowRight') showNextMemory();
    if (e.key === 'ArrowLeft') showPrevMemory();
    return;
  }

  if (e.key === 'ArrowRight') showSection(current + 1);
  if (e.key === 'ArrowLeft') showSection(current - 1);
});

function launchConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  confettiCanvas.width = innerWidth * dpr;
  confettiCanvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = ['#d8b26a', '#f4d9df', '#dce8f5', '#e5def7', '#f4e4c8'];
  const particles = Array.from({ length: 90 }, () => ({
    x: Math.random() * innerWidth,
    y: -20 - Math.random() * innerHeight * 0.2,
    r: 2 + Math.random() * 4,
    c: colors[(Math.random() * colors.length) | 0],
    vx: -1 + Math.random() * 2,
    vy: 1 + Math.random() * 2.4,
    a: Math.random() * Math.PI
  }));

  let frame = 0;
  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.a += 0.05;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    });
    frame += 1;
    if (frame < 200) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
  requestAnimationFrame(tick);
}

showSection(0);
