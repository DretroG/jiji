// Memory dataset: add new objects here and every section updates automatically.
const memories = [
  {
    type: "photo",
    image: "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1300&q=80",
    title: "Golden Hour Arrival",
    date: "2026-08-04",
    caption: "A gentle sunset welcomed everyone with warmth and laughter.",
    tags: ["birthday", "friends", "fun"],
    location: "Lusaka"
  },
  {
    type: "photo",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1300&q=80",
    title: "Candles and Wishes",
    date: "2026-08-04",
    caption: "One breath, many dreams, and a room full of hope.",
    tags: ["birthday", "family"]
  },
  {
    type: "photo",
    image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1300&q=80",
    title: "Joy Around the Table",
    date: "2026-08-04",
    caption: "Stories, smiles, and the kind of joy that lingers forever.",
    tags: ["birthday", "friends", "church"]
  },
  {
    type: "photo",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1300&q=80",
    title: "A Quiet Portrait",
    date: "2026-09-12",
    caption: "A reflective moment after a season of celebration.",
    tags: ["friends", "school"]
  },
  {
    type: "photo",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1300&q=80",
    title: "Weekend Road Memory",
    date: "2026-12-21",
    caption: "A peaceful drive, soft music, and laughter in every mile.",
    tags: ["travel", "fun", "friends"]
  },
  {
    type: "photo",
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1300&q=80",
    title: "Family Gratitude",
    date: "2027-01-06",
    caption: "A reminder that love remains the center of every memory.",
    tags: ["family", "church"]
  }
];

const state = {
  query: "",
  category: "all",
  filtered: [...memories],
  currentIndex: 0,
  isLightboxOpen: false,
  zoom: 1,
  panX: 0,
  panY: 0,
  slideshowTimer: null,
  touchStartX: 0,
  pinchStartDistance: null,
  pinchStartZoom: 1
};

const $ = (selector) => document.querySelector(selector);
const gallery = $("#gallery");
const categoryFilters = $("#category-filters");
const timelineList = $("#timeline-list");
const lightbox = $("#lightbox");
const lightboxImage = $("#lightbox-image");
const figure = $("#lightbox-figure");
const bgMusic = $("#bg-music");

function formatDate(dateString, options = { year: "numeric", month: "long", day: "numeric" }) {
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleDateString("en-US", options);
}

function pickFeaturedMemory() {
  const featured = memories[Math.floor(Math.random() * memories.length)];
  $("#featured-title").textContent = featured.title;
  $("#featured-caption").textContent = featured.caption;
}

function getAllTags() {
  return [...new Set(memories.flatMap((memory) => memory.tags || []).map((tag) => tag.toLowerCase()))].sort();
}

function buildCategoryFilters() {
  const categories = ["all", ...getAllTags()];
  categoryFilters.innerHTML = categories.map((category) => {
    const isActive = state.category === category;
    const label = category.charAt(0).toUpperCase() + category.slice(1);
    return `<button class="btn category-btn ${isActive ? "active" : ""}" data-category="${category}" role="tab" aria-selected="${isActive}">${label}</button>`;
  }).join("");
}

function buildStats() {
  const dates = memories.map((memory) => memory.date).filter(Boolean).sort();
  const totalVideos = memories.filter((memory) => memory.type === "video").length;
  const totalPhotos = memories.filter((memory) => memory.type !== "video").length;
  const stats = [
    ["Total Photos", totalPhotos],
    ["Total Videos", totalVideos],
    ["Total Memories", memories.length],
    ["Album Started", dates[0] ? formatDate(dates[0]) : "—"],
    ["Latest Update", dates.at(-1) ? formatDate(dates.at(-1)) : "—"]
  ];

  $("#stats").innerHTML = stats.map(([label, value]) => `
    <article class="stat">
      <span class="label">${label}</span>
      <span class="value">${value}</span>
    </article>
  `).join("");
}

function matchesQuery(memory, query) {
  if (!query) return true;
  const haystack = [
    memory.title,
    memory.caption,
    memory.date,
    memory.location || "",
    ...(memory.tags || [])
  ].join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function filterMemories() {
  state.filtered = memories.filter((memory) => {
    const categoryPass = state.category === "all" || (memory.tags || []).map((tag) => tag.toLowerCase()).includes(state.category);
    return categoryPass && matchesQuery(memory, state.query);
  });
  renderGallery();
  renderTimeline();
}

function renderGallery() {
  if (!state.filtered.length) {
    gallery.innerHTML = `<p>No memories matched your search yet.</p>`;
    return;
  }

  gallery.innerHTML = state.filtered.map((memory, index) => `
    <article class="card" role="listitem" tabindex="0" aria-label="Open memory ${memory.title}" data-index="${index}">
      <img src="${memory.image}" alt="${memory.title}" loading="lazy" />
      <div class="card-body">
        <p class="card-title">${memory.title}</p>
        <p class="muted">${formatDate(memory.date)}</p>
        <p>${memory.caption}</p>
        <div class="chips">${(memory.tags || []).map((tag) => `<span>#${tag}</span>`).join("")}</div>
      </div>
    </article>
  `).join("");
}

function groupLabel(dateString) {
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function renderTimeline() {
  if (!state.filtered.length) {
    timelineList.innerHTML = "";
    return;
  }

  const grouped = state.filtered.reduce((acc, memory) => {
    const label = groupLabel(memory.date);
    acc[label] ??= [];
    acc[label].push(memory);
    return acc;
  }, {});

  timelineList.innerHTML = Object.entries(grouped).map(([label, group], idx) => `
    <article class="timeline-item">
      <button class="timeline-trigger" aria-expanded="${idx === 0}" data-timeline="${idx}">${label} (${group.length})</button>
      <div class="timeline-content" ${idx === 0 ? "" : "hidden"}>
        ${group.map((memory) => `<p>• ${memory.title}</p>`).join("")}
      </div>
    </article>
  `).join("");
}

function resetTransform() {
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  lightboxImage.style.transform = "translate(0px, 0px) scale(1)";
}

function applyTransform() {
  lightboxImage.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
}

function openLightbox(index) {
  if (!state.filtered.length) return;
  state.currentIndex = index;
  state.isLightboxOpen = true;
  lightbox.hidden = false;
  document.body.classList.add("no-scroll");
  updateLightbox();
}

function closeLightbox() {
  state.isLightboxOpen = false;
  lightbox.hidden = true;
  document.body.classList.remove("no-scroll");
  stopSlideshow();
}

function updateLightbox() {
  const memory = state.filtered[state.currentIndex];
  if (!memory) return;
  lightboxImage.src = memory.image;
  lightboxImage.alt = memory.title;
  $("#lightbox-counter").textContent = `${state.currentIndex + 1} / ${state.filtered.length}`;
  $("#lightbox-title").textContent = memory.title;
  $("#lightbox-date").textContent = formatDate(memory.date);
  $("#lightbox-caption").textContent = memory.caption;
  $("#lightbox-location").textContent = memory.location ? `Location: ${memory.location}` : "";
  $("#lightbox-tags").innerHTML = (memory.tags || []).map((tag) => `<span>${tag}</span>`).join("");
  resetTransform();
}

function nextMemory() {
  if (!state.filtered.length) return;
  state.currentIndex = (state.currentIndex + 1) % state.filtered.length;
  lightboxImage.classList.add("fade");
  updateLightbox();
  setTimeout(() => lightboxImage.classList.remove("fade"), 250);
}

function prevMemory() {
  if (!state.filtered.length) return;
  state.currentIndex = (state.currentIndex - 1 + state.filtered.length) % state.filtered.length;
  lightboxImage.classList.add("fade");
  updateLightbox();
  setTimeout(() => lightboxImage.classList.remove("fade"), 250);
}

function startSlideshow() {
  if (!state.filtered.length) return;
  if (!state.isLightboxOpen) openLightbox(0);
  stopSlideshow();
  state.slideshowTimer = setInterval(nextMemory, 5000);
  $("#slideshow-toggle").textContent = "⏸ Pause Memories";
}

function stopSlideshow() {
  if (state.slideshowTimer) {
    clearInterval(state.slideshowTimer);
    state.slideshowTimer = null;
  }
  $("#slideshow-toggle").textContent = "▶ Play Memories";
}

function toggleSlideshow() {
  if (state.slideshowTimer) {
    stopSlideshow();
  } else {
    startSlideshow();
  }
}

function attachEvents() {
  $("#enter-album").addEventListener("click", () => {
    $("#album").hidden = false;
    $("#landing").hidden = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("#search").addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    filterMemories();
  });

  categoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    buildCategoryFilters();
    filterMemories();
  });

  gallery.addEventListener("click", (event) => {
    const card = event.target.closest(".card");
    if (!card) return;
    openLightbox(Number(card.dataset.index));
  });

  gallery.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".card");
    if (!card) return;
    event.preventDefault();
    openLightbox(Number(card.dataset.index));
  });

  timelineList.addEventListener("click", (event) => {
    const trigger = event.target.closest(".timeline-trigger");
    if (!trigger) return;
    const content = trigger.nextElementSibling;
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!expanded));
    content.hidden = expanded;
  });

  $("#play-music").addEventListener("click", async () => {
    try { await bgMusic.play(); } catch { /* User can retry after interaction */ }
  });
  $("#pause-music").addEventListener("click", () => bgMusic.pause());
  $("#mute-music").addEventListener("click", () => {
    bgMusic.muted = !bgMusic.muted;
    $("#mute-music").textContent = bgMusic.muted ? "Unmute" : "Mute";
  });
  $("#volume").addEventListener("input", (event) => {
    bgMusic.volume = Number(event.target.value);
  });

  $("#close-lightbox").addEventListener("click", closeLightbox);
  $("#lightbox-close-backdrop").addEventListener("click", closeLightbox);
  $("#next-memory").addEventListener("click", nextMemory);
  $("#prev-memory").addEventListener("click", prevMemory);
  $("#slideshow-toggle").addEventListener("click", toggleSlideshow);

  document.addEventListener("keydown", (event) => {
    if (!state.isLightboxOpen) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") nextMemory();
    if (event.key === "ArrowLeft") prevMemory();
    if (event.key === "+" || event.key === "=") {
      state.zoom = Math.min(4, state.zoom + 0.2);
      applyTransform();
    }
    if (event.key === "-") {
      state.zoom = Math.max(1, state.zoom - 0.2);
      if (state.zoom === 1) {
        state.panX = 0;
        state.panY = 0;
      }
      applyTransform();
    }
  });

  figure.addEventListener("wheel", (event) => {
    if (!state.isLightboxOpen) return;
    event.preventDefault();
    state.zoom = Math.min(4, Math.max(1, state.zoom + (event.deltaY > 0 ? -0.1 : 0.1)));
    if (state.zoom === 1) {
      state.panX = 0;
      state.panY = 0;
    }
    applyTransform();
  }, { passive: false });

  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  figure.addEventListener("pointerdown", (event) => {
    if (state.zoom <= 1) return;
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    figure.setPointerCapture(event.pointerId);
  });

  figure.addEventListener("pointermove", (event) => {
    if (!isDragging || state.zoom <= 1) return;
    state.panX += event.clientX - lastX;
    state.panY += event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    applyTransform();
  });

  figure.addEventListener("pointerup", () => {
    isDragging = false;
  });

  figure.addEventListener("touchstart", (event) => {
    if (event.touches.length === 1) {
      state.touchStartX = event.touches[0].clientX;
    }
    if (event.touches.length === 2) {
      const [t1, t2] = event.touches;
      state.pinchStartDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      state.pinchStartZoom = state.zoom;
    }
  }, { passive: true });

  figure.addEventListener("touchmove", (event) => {
    if (event.touches.length !== 2 || !state.pinchStartDistance) return;
    const [t1, t2] = event.touches;
    const currentDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    const ratio = currentDistance / state.pinchStartDistance;
    state.zoom = Math.min(4, Math.max(1, state.pinchStartZoom * ratio));
    applyTransform();
  }, { passive: true });

  figure.addEventListener("touchend", (event) => {
    if (event.touches.length < 2) state.pinchStartDistance = null;
    if (event.changedTouches.length === 1 && state.zoom === 1) {
      const diff = event.changedTouches[0].clientX - state.touchStartX;
      if (Math.abs(diff) > 45) {
        diff < 0 ? nextMemory() : prevMemory();
      }
    }
  }, { passive: true });
}

function init() {
  bgMusic.volume = 0.6;
  pickFeaturedMemory();
  buildCategoryFilters();
  buildStats();
  filterMemories();
  attachEvents();
}

init();
