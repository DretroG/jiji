const sections = [...document.querySelectorAll('.scene')];
const openGiftBtn = document.getElementById('openGift');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const envelope = document.getElementById('envelope');
const typedLetter = document.getElementById('typedLetter');
const wishGrid = document.getElementById('wishGrid');
const galleryGrid = document.getElementById('galleryGrid');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const closeLightbox = document.getElementById('closeLightbox');
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const confettiCanvas = document.getElementById('confettiCanvas');

let current = 0;
let letterTyped = false;
let confettiTriggered = false;
let audioUnlocked = false;

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
    width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;
    top:${e.clientY - rect.top - size/2}px;background:rgba(255,255,255,.4);
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

const letterText = `On this precious day, I celebrate the beauty of your heart,
  the strength of your spirit, and the light you bring to everyone around you.
  May this year be wrapped in joy, wonder, and divine favor.`;

function typeLetter() {
  if (letterTyped) return;
  letterTyped = true;
  let i = 0;
  const timer = setInterval(() => {
    typedLetter.textContent += letterText[i] || '';
    i++;
    if (i >= letterText.length) clearInterval(timer);
  }, 34);
}

function openEnvelope() {
  envelope.classList.add('open');
  envelope.setAttribute('aria-expanded', 'true');
  typeLetter();
}

envelope.addEventListener('click', openEnvelope);
envelope.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openEnvelope();
  }
});

const wishes = ['Joy', 'Peace', 'Good Health', 'Success', 'Wisdom', "God's Favor", 'Love', 'Protection', 'Grace', 'Purpose'];
wishGrid.innerHTML = wishes.map(w => `<article class="wish-card"><h3>${w}</h3></article>`).join('');

function revealWishes() {
  [...wishGrid.children].forEach((card, i) => {
    setTimeout(() => card.classList.add('show'), i * 130);
  });
}


const memories = [
  { caption: 'Golden Moments', src: 'https://i.ibb.co/998Y2HcR/memory-1.jpg' },
  { caption: 'Laughter & Light', src: 'https://i.ibb.co/qYJZsSc0/memory-2.jpg' },
  { caption: 'Beautiful Memories', src: 'https://i.ibb.co/cSwRVTzR/memory-3.jpg' },
  { caption: 'Unforgettable Smile', src: 'https://i.ibb.co/35Xnkcr5/memory-4.jpg' },
  { caption: 'Shared Joy', src: 'https://i.ibb.co/qFn1Q35y/memory-5.jpg' },
  { caption: 'Graceful Days', src: 'https://i.ibb.co/spMRfcVR/memory-6.jpg' },
  { caption: 'Special Memories', src: 'https://i.ibb.co/tTH8RqQn/memory-7.jpg' },
  { caption: 'Forever Blessed', src: 'https://i.ibb.co/WNvb32cY/memory-8.jpg' }
];
galleryGrid.innerHTML = memories.map((item) => `
  <figure class="memory" data-src="${item.src}" data-caption="${item.caption}">
    <img src="${item.src}" alt="${item.caption}" loading="lazy" referrerpolicy="no-referrer" />
    <figcaption>${item.caption}</figcaption>
  </figure>`).join('');

galleryGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.memory');
  if (!card) return;
  lightboxImg.src = card.dataset.src;
  lightboxImg.onerror = () => { lightboxImg.src = card.querySelector('img').src; };
  lightboxCaption.textContent = card.dataset.caption;
  lightbox.classList.add('show');
  lightbox.setAttribute('aria-hidden', 'false');
});

closeLightbox.addEventListener('click', () => {
  lightbox.classList.remove('show');
  lightbox.setAttribute('aria-hidden', 'true');
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox.click();
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
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.a += .05;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    });
    frame++;
    if (frame < 200) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
  requestAnimationFrame(tick);
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') showSection(current + 1);
  if (e.key === 'ArrowLeft') showSection(current - 1);
});

showSection(0);
