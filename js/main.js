/*
  TJØRNBO SLEEP – Final Build v0.1
  Native <details>/<summary> handles disclosure behavior.
  Principle Sticky Explainer: sticky visual + viewport-center step activation.
*/
document.documentElement.classList.add('js');

(() => {
  const explainer = document.querySelector('[data-principle-explainer]');
  if (!explainer) return;

  const steps = [...explainer.querySelectorAll('[data-step]')];
  const hotspots = [...explainer.querySelectorAll('[data-hotspot]')];
  const mobileQuery = window.matchMedia('(max-width: 767px)');
  let ticking = false;

  const setActive = (id) => {
    steps.forEach((step) => step.classList.toggle('is-active', step.dataset.step === id));
    hotspots.forEach((hotspot) => hotspot.classList.toggle('is-active', hotspot.dataset.hotspot === id));
  };

  const updateActiveStep = () => {
    ticking = false;

    const viewportTarget = window.innerHeight * (mobileQuery.matches ? 0.6 : 0.55);
    let closestStep = steps[0];
    let closestDistance = Infinity;

    steps.forEach((step) => {
      const rect = step.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - viewportTarget);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestStep = step;
      }
    });

    if (closestStep) setActive(closestStep.dataset.step);
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateActiveStep);
  };

  setActive('1');
  updateActiveStep();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  mobileQuery.addEventListener?.('change', updateActiveStep);
})();


(() => {
  const galleries = [...document.querySelectorAll('[data-gallery]')];
  if (!galleries.length) return;

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  galleries.forEach((gallery) => {
    const mainImage = gallery.querySelector('[data-gallery-main]');
    const dots = [...gallery.querySelectorAll('[data-gallery-target]')];
    const interval = Number(gallery.dataset.galleryInterval || 5600);
    let activeIndex = Math.max(0, dots.findIndex((item) => item.classList.contains('is-active')));
    let timer = null;
    let isPaused = false;

    if (!mainImage || !dots.length) return;

    const syncDots = () => {
      dots.forEach((item, index) => {
        const isActive = index === activeIndex;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
    };

    const swapImage = (dot) => {
      const nextSrc = dot.dataset.galleryTarget;
      const nextAlt = dot.dataset.galleryAlt || mainImage.alt;
      if (mainImage.getAttribute('src') === nextSrc && mainImage.alt === nextAlt) return;

      mainImage.classList.add('is-fading');
      window.setTimeout(() => {
        mainImage.src = nextSrc;
        mainImage.alt = nextAlt;
      }, 170);
      window.setTimeout(() => {
        mainImage.classList.remove('is-fading');
      }, 210);
    };

    const activateByIndex = (index, { userInitiated = false } = {}) => {
      activeIndex = (index + dots.length) % dots.length;
      syncDots();
      swapImage(dots[activeIndex]);
      if (userInitiated) startAuto();
    };

    const stopAuto = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const startAuto = () => {
      stopAuto();
      if (reduceMotionQuery.matches || isPaused || dots.length < 2) return;
      timer = window.setInterval(() => {
        activateByIndex(activeIndex + 1);
      }, interval);
    };

    gallery.addEventListener('mouseenter', () => {
      isPaused = true;
      stopAuto();
    });

    gallery.addEventListener('mouseleave', () => {
      isPaused = false;
      startAuto();
    });

    gallery.addEventListener('focusin', () => {
      isPaused = true;
      stopAuto();
    });

    gallery.addEventListener('focusout', () => {
      const focusedInside = gallery.contains(document.activeElement);
      if (focusedInside) return;
      isPaused = false;
      startAuto();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => activateByIndex(index, { userInitiated: true }));
    });

    reduceMotionQuery.addEventListener?.('change', startAuto);
    syncDots();
    startAuto();
  });
})();
