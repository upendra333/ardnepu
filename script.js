// Card hover/focus effect for bento cards
// (No page load animation for simplicity and performance)
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.bento-card');
  // Store tilt and scale state for each card
  cards.forEach(card => {
    card._tilt = { x: 0, y: 0 };
    card._scale = 1;
  });

  // 3D tilt effect on hover only, combined with breathing
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      let dx = (x - xc) / xc;
      let dy = (y - yc) / yc;
      dx = Math.max(-1, Math.min(1, dx));
      dy = Math.max(-1, Math.min(1, dy));
      const maxTilt = 5.6;
      card._tilt = { x: dx * maxTilt, y: dy * maxTilt };
      setCardTransform(card);
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(.4,2,.6,1)';
      card._tilt = { x: 0, y: 0 };
      setCardTransform(card);
      setTimeout(() => {
        card.style.transition = '';
      }, 500);
    });
    card.addEventListener('mouseenter', e => {
      card.style.transition = '';
    });
  });

  // Breathing animation for all cards (remains)
  cards.forEach((card, index) => {
    function animateCard() {
      card.style.transition = 'transform 2.0s cubic-bezier(.5,0,.5,1.2), box-shadow 1.2s cubic-bezier(.5,0,.5,1.2)';
      card._scale = 1.015;
      setCardTransform(card);
      card.style.boxShadow = '0 0 30px 0 rgba(33,212,253,0.25)';
      setTimeout(() => {
        card._scale = 1;
        setCardTransform(card);
        card.style.boxShadow = '';
      }, 900);
      setTimeout(animateCard, 2200 + index * 120); // Loop with stagger
    }
    setTimeout(animateCard, index * 200);
  });

  // Helper to combine tilt and scale
  function setCardTransform(card) {
    const t = card._tilt || { x: 0, y: 0 };
    const s = card._scale || 1;
    card.style.transform = `perspective(600px) rotateX(${-t.y}deg) rotateY(${t.x}deg) scale(${s})`;
  }

  // Dark mode toggle
  const toggle = document.getElementById('toggle-darkmode');
  if (toggle) {
    // Load preference or default to dark theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.remove('dark-mode');
      toggle.checked = false;
    } else {
      // Default to dark theme
      document.body.classList.add('dark-mode');
      toggle.checked = true;
      localStorage.setItem('theme', 'dark');
    }
    toggle.addEventListener('change', () => {
      if (toggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // Universal back arrow button logic
  const backButtons = document.querySelectorAll('.back-arrow-btn');
  // Fixed mapping for back arrow destinations
  const backDestinations = {
    // Main pages
    'travel.html': 'index.html',
    'books.html': 'index.html',
    'animation.html': 'index.html',
    'graphicdesign.html': 'index.html',
    'art.html': 'index.html',
    'photography.html': 'index.html',
    'about.html': 'index.html',
    'blog.html': 'index.html',
    'contact.html': 'index.html',
    'apps.html': 'index.html',
    'webpage.html': 'index.html',
    // Animation subpages
    'personalanim.html': 'animation.html',
    'profanim.html': 'animation.html',
    // Design subpages
    'branding.html': 'graphicdesign.html',
    'webdesign.html': 'index.html',
    'creatives.html': 'graphicdesign.html',
    // Photography subpages
    'commercial.html': 'photography.html',
    'general.html': 'photography.html',
    'astrophotography.html': 'photography.html',
    'wildlife.html': 'photography.html',
  };
  const page = location.pathname.split('/').pop();
  let fallback = backDestinations[page] || 'index.html';
  backButtons.forEach(btn => {
    btn.onclick = function(e) {
      e.preventDefault();
      window.location.href = fallback;
    };
  });

  // Blog media modal logic with navigation buttons
  function setupBlogMediaModal() {
    const modal = document.getElementById('blog-media-modal');
    const modalContainer = document.getElementById('blog-modal-media-container');
    const closeBtn = document.getElementById('blog-modal-close');
    const prevBtn = document.getElementById('blog-modal-prev');
    const nextBtn = document.getElementById('blog-modal-next');
    if (!modal || !modalContainer || !closeBtn || !prevBtn || !nextBtn) return;

    let currentMedia = [];
    let currentIndex = 0;

    function showMedia(idx) {
      modalContainer.innerHTML = '';
      const el = currentMedia[idx];
      let clone;
      if (el.tagName === 'IMG') {
        clone = document.createElement('img');
        clone.src = el.src;
        clone.alt = el.alt || '';
        clone.style.maxWidth = '90vw';
        clone.style.maxHeight = '70vh';
      } else if (el.tagName === 'IFRAME') {
        clone = document.createElement('iframe');
        clone.src = el.src;
        clone.width = el.width || '560';
        clone.height = el.height || '315';
        clone.setAttribute('frameborder', '0');
        clone.setAttribute('allowfullscreen', '');
        clone.style.maxWidth = '90vw';
        clone.style.maxHeight = '70vh';
      }
      if (clone) {
        clone.style.flex = '0 0 auto';
        modalContainer.appendChild(clone);
      }
      // Show/hide nav buttons
      prevBtn.style.display = idx > 0 ? 'flex' : 'none';
      nextBtn.style.display = idx < currentMedia.length - 1 ? 'flex' : 'none';
    }

    // Attach click listeners to all blog media
    document.querySelectorAll('.blog-media').forEach(mediaDiv => {
      const mediaEls = Array.from(mediaDiv.querySelectorAll('img,iframe'));
      mediaEls.forEach((el, idx) => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', e => {
          e.preventDefault();
          currentMedia = mediaEls;
          currentIndex = idx;
          showMedia(currentIndex);
          modal.style.display = 'flex';
        });
      });
    });
    // Navigation button logic
    prevBtn.onclick = function(e) {
      e.stopPropagation();
      if (currentIndex > 0) {
        currentIndex--;
        showMedia(currentIndex);
      }
    };
    nextBtn.onclick = function(e) {
      e.stopPropagation();
      if (currentIndex < currentMedia.length - 1) {
        currentIndex++;
        showMedia(currentIndex);
      }
    };
    // Close modal on close button or outside click
    closeBtn.onclick = () => { modal.style.display = 'none'; modalContainer.innerHTML = ''; };
    modal.onclick = e => { if (e.target === modal) { modal.style.display = 'none'; modalContainer.innerHTML = ''; } };
  }
  setupBlogMediaModal();

  // Blog full post modal logic
  function setupBlogFullPostModal() {
    const modal = document.getElementById('blog-media-modal');
    const modalContent = document.getElementById('blog-modal-full-content');
    const closeBtn = document.getElementById('blog-modal-close');
    if (!modal || !modalContent || !closeBtn) return;

    // Open modal with full post content
    document.querySelectorAll('.blog-read-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const post = btn.closest('.blog-post');
        if (!post) return;
        // Clone title, date, and full content
        const title = post.querySelector('.blog-title')?.outerHTML || '';
        const date = post.querySelector('.blog-date')?.outerHTML || '';
        const fullContent = post.querySelector('.blog-full-content')?.innerHTML || '';
        modalContent.innerHTML = `${title}${date}${fullContent}`;
        modal.style.display = 'flex';
      });
    });
    // Close modal on close button or outside click
    closeBtn.onclick = () => { modal.style.display = 'none'; modalContent.innerHTML = ''; };
    modal.onclick = e => { if (e.target === modal) { modal.style.display = 'none'; modalContent.innerHTML = ''; } };
  }
  setupBlogFullPostModal();
});

function applyBentoCardSizing() {
  const cards = document.querySelectorAll('.astro-card');
  cards.forEach(card => {
    // Extract image URL from background-image style
    const bg = card.style.backgroundImage;
    if (!bg || !bg.startsWith('url(')) return;
    const url = bg.slice(5, -2);
    const img = new window.Image();
    img.onload = function() {
      // Remove any previous size class
      card.classList.remove('size2x2', 'size2x1', 'size1x2', 'size1x1');
      const aspect = img.width / img.height;
      // Assign size class based on aspect ratio
      if (img.width > 1200 || img.height > 1200) {
        card.classList.add('size2x2');
      } else if (aspect > 1.4) {
        card.classList.add('size2x1');
      } else if (aspect < 0.7) {
        card.classList.add('size1x2');
      } else {
        card.classList.add('size1x1');
      }
      // Ensure the entire image fits as the card cover
      card.style.backgroundSize = 'contain';
      card.style.backgroundPosition = 'center';
      card.style.backgroundRepeat = 'no-repeat';
    };
    img.src = url;
  });
}
window.addEventListener('DOMContentLoaded', function() {
  applyBentoCardSizing();
});
window.applyBentoCardSizing = applyBentoCardSizing;

// Modal navigation logic for astro-cards
(function() {
  let astroCards = [];
  let currentIndex = -1;
  function openModalAt(index) {
    if (index < 0 || index >= astroCards.length) return;
    const card = astroCards[index];
    const video = card.dataset.video;
    const modalImg = document.getElementById('astro-modal-img');
    const modalVideo = document.getElementById('astro-modal-video');
    if (video) {
      modalImg.style.display = 'none';
      modalVideo.src = video + '?autoplay=1';
      modalVideo.style.display = 'block';
    } else {
      modalVideo.src = '';
      modalVideo.style.display = 'none';
      modalImg.src = card.style.backgroundImage.slice(5, -2);
      modalImg.style.display = 'block';
    }
    document.getElementById('astro-modal-title').textContent = card.dataset.title;
    document.getElementById('astro-modal-desc').textContent = card.dataset.description;
    document.querySelector('.astro-modal-tag').textContent = card.dataset.tag.charAt(0).toUpperCase() + card.dataset.tag.slice(1);
    document.getElementById('astro-modal').style.display = 'flex';
    currentIndex = index;
  }
  window.addEventListener('DOMContentLoaded', function() {
    astroCards = Array.from(document.querySelectorAll('.astro-card'));
    document.querySelectorAll('.astro-card').forEach((card, idx) => {
      card.addEventListener('click', function() {
        const idxInAll = astroCards.indexOf(card);
        if (idxInAll !== -1) openModalAt(idxInAll);
      });
    });
    document.querySelector('.astro-modal-prev').onclick = function(e) {
      e.stopPropagation();
      if (astroCards.length > 0 && currentIndex > 0) openModalAt(currentIndex - 1);
    };
    document.querySelector('.astro-modal-next').onclick = function(e) {
      e.stopPropagation();
      if (astroCards.length > 0 && currentIndex < astroCards.length - 1) openModalAt(currentIndex + 1);
    };
    // Optional: keyboard navigation
    document.getElementById('astro-modal').addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        if (astroCards.length > 0 && currentIndex > 0) openModalAt(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        if (astroCards.length > 0 && currentIndex < astroCards.length - 1) openModalAt(currentIndex + 1);
      }
    });
    // Focus modal for keyboard navigation
    document.getElementById('astro-modal').addEventListener('show', function() {
      this.focus();
    });
  });
})();

// Remove zoom-in cursor and new tab open for modal image
window.addEventListener('DOMContentLoaded', function() {
  var modalImg = document.getElementById('astro-modal-img');
  if (modalImg) {
    modalImg.style.cursor = '';
    modalImg.onclick = null;
  }
});
// Disable right-click context menu on all images (including future images)
document.addEventListener('contextmenu', function(e) {
  if (e.target && e.target.tagName === 'IMG') {
    e.preventDefault();
  }
}); 