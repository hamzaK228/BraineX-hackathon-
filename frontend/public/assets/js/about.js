// About Page Functionality
document.addEventListener('DOMContentLoaded', function () {
  // 1. Impact Stats Animation
  const statsSection = document.querySelector('.impact-stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statsObserver.observe(statsSection);
  }

  function animateCounters() {
    const counters = document.querySelectorAll('.stat-item h3');
    counters.forEach((counter) => {
      const target = counter.textContent;
      const isPercentage = target.includes('%');
      const isCurrency = target.includes('$');
      const suffix = target.includes('+') ? '+' : '';
      const numericTarget = parseInt(target.replace(/[^\d]/g, ''));

      let current = 0;
      const duration = 2000; // 2 seconds
      const stepTime = 50;
      const steps = duration / stepTime;
      const increment = numericTarget / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= numericTarget) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          let displayValue = Math.ceil(current).toLocaleString();
          if (isCurrency) displayValue = '$' + displayValue;
          if (isPercentage) displayValue += '%';
          else displayValue += suffix;
          counter.textContent = displayValue;
        }
      }, stepTime);
    });
  }

  // 2. Section Reveal Animations
  const sections = document.querySelectorAll('section');
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  // sections.forEach(section => {
  //     section.style.opacity = '0';
  //     section.style.transform = 'translateY(30px)';
  //     section.style.transition = 'all 0.8s ease-out';
  //     sectionObserver.observe(section);
  // });
  // Instead just observe them for the 'revealed' class if needed, or skip hiding.
  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

  // CSS for revealed state (injected if not present)
  if (!document.getElementById('reveal-styles')) {
    const style = document.createElement('style');
    style.id = 'reveal-styles';
    style.textContent = `
            section.revealed {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
    document.head.appendChild(style);
  }

  // 3. Contact Form Handling
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      // Basic validation
      const email = document.getElementById('contactEmail').value;
      if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }

      // Simulate API call
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      setTimeout(() => {
        showToast('Message sent successfully! We will get back to you soon.', 'success');
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 1500);
    });
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Style the toast
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      color: '#fff',
      backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: '1000',
      transition: 'opacity 0.3s ease',
    });

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});
