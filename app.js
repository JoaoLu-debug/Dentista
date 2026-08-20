/**
 * DENTIS LAB - Client Interactions and Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initBookingDrawer();
  initTiltEffect();
  initScrollReveal();
  initHeroBookingHooks();
});

/**
 * 1. Booking Drawer Logic
 */
function initBookingDrawer() {
  const drawer = document.getElementById('booking-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const openBtn = document.getElementById('open-drawer-btn');
  const closeBtn = document.getElementById('close-drawer-btn');
  
  const bookingForm = document.getElementById('booking-form');
  const formContainer = document.getElementById('booking-form-container');
  const successContainer = document.getElementById('booking-success');
  const submitBtn = document.getElementById('submit-booking-btn');
  const closeSuccessBtn = document.getElementById('close-success-btn');

  // Open Drawer
  const openDrawer = () => {
    drawer.classList.add('active');
    document.body.classList.add('overflow-hidden');
  };

  // Close Drawer
  const closeDrawer = () => {
    drawer.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
    // Smoothly reset form state after transition completes
    setTimeout(() => {
      formContainer.classList.remove('hidden');
      successContainer.classList.add('hidden');
      if (bookingForm) bookingForm.reset();
      resetPeriodSelector();
    }, 500);
  };

  if (openBtn) openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeDrawer);

  // Period Selector Toggle
  const periodOptions = document.querySelectorAll('#period-selector .period-option');
  let selectedPeriod = 'manha';

  periodOptions.forEach(option => {
    option.addEventListener('click', () => {
      periodOptions.forEach(opt => {
        opt.classList.remove('bg-neutral-900', 'text-white', 'border-neutral-950');
        opt.classList.add('bg-transparent', 'text-neutral-700', 'border-neutral-200', 'hover:bg-neutral-50');
      });
      option.classList.remove('bg-transparent', 'text-neutral-700', 'border-neutral-200', 'hover:bg-neutral-50');
      option.classList.add('bg-neutral-900', 'text-white', 'border-neutral-950');
      selectedPeriod = option.getAttribute('data-value');
    });
  });

  function resetPeriodSelector() {
    periodOptions.forEach((opt, idx) => {
      opt.classList.remove('bg-neutral-900', 'text-white', 'border-neutral-950');
      opt.classList.add('bg-transparent', 'text-neutral-700', 'border-neutral-200', 'hover:bg-neutral-50');
      if (idx === 0) { // Default morning select
        opt.classList.remove('bg-transparent', 'text-neutral-700', 'border-neutral-200', 'hover:bg-neutral-50');
        opt.classList.add('bg-neutral-900', 'text-white', 'border-neutral-950');
      }
    });
    selectedPeriod = 'manha';
  }

  // Form Submit Handler
  if (submitBtn && bookingForm) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Simple HTML validation trigger
      if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
      }

      // Simulation of sending data
      submitBtn.disabled = true;
      submitBtn.innerText = "ENVIANDO...";

      setTimeout(() => {
        formContainer.classList.add('hidden');
        successContainer.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerText = "ENVIAR SOLICITAÇÃO";
      }, 1200);
    });
  }
}

/**
 * 2. 3D Tilt and Cursor Spotlight Tracking
 */
function initTiltEffect() {
  const cards = document.querySelectorAll('.glass-panel');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const normX = x / rect.width;
      const normY = y / rect.height;

      // Rotate between -6 and +6 degrees based on mouse position
      const rotateX = (0.5 - normY) * 12;
      const rotateY = (normX - 0.5) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      
      // Update custom spotlight coordinate variables
      card.style.setProperty('--mouse-x', `${normX * 100}%`);
      card.style.setProperty('--mouse-y', `${normY * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/**
 * 3. Scroll Reveal via IntersectionObserver
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal-text');
  
  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/**
 * 4. Additional Hero/CTA Booking Triggers
 */
function initHeroBookingHooks() {
  const openDrawerBtn = document.getElementById('open-drawer-btn');
  const heroBookingBtn = document.getElementById('cta-hero-booking');
  const heroBadgeBtn = document.getElementById('cta-hero-badge');
  const finalBookingBtn = document.getElementById('cta-final-booking');

  const triggerDrawerOpen = () => {
    if (openDrawerBtn) openDrawerBtn.click();
  };

  if (heroBookingBtn) heroBookingBtn.addEventListener('click', triggerDrawerOpen);
  if (heroBadgeBtn) heroBadgeBtn.addEventListener('click', triggerDrawerOpen);
  if (finalBookingBtn) finalBookingBtn.addEventListener('click', triggerDrawerOpen);
}
