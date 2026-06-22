/* ==========================================================================
   REBARATOZ - Main Javascript Control Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initPortfolioTabs();
  initContactSalesLink();
});

/* ==========================================================================
   1. Sticky Header & Mobile Nav Toggle
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navActions = document.getElementById('nav-actions');
  const navLinks = document.querySelectorAll('.nav-link');

  // Shadow and blur transition on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    navActions.classList.toggle('active');
  });

  // Close menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      navActions.classList.remove('active');
    });
  });
}

/* ==========================================================================
   2. Scroll-Triggered Reveal Animations
   ========================================================================== */
function initScrollAnimations() {
  const revealItems = document.querySelectorAll('.reveal-item');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // Trigger only once
        }
      });
    }, observerOptions);

    revealItems.forEach(item => {
      observer.observe(item);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    revealItems.forEach(item => {
      item.classList.add('revealed');
    });
  }
}

/* ==========================================================================
   3. Portfolio Tabs Switcher & SVG Lightbox
   ========================================================================== */
function initPortfolioTabs() {
  const tabs = document.querySelectorAll('.portfolio-tab');
  const panels = document.querySelectorAll('.portfolio-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Activate clicked tab
      tab.classList.add('active');

      // Hide all panels
      panels.forEach(panel => panel.classList.remove('active'));
      
      // Show corresponding panel
      const targetPanelId = tab.getAttribute('data-target');
      const targetPanel = document.getElementById(targetPanelId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

// Lightbox controller for high-resolution vector blueprints
function openLightbox(element) {
  const lightbox = document.getElementById('portfolio-lightbox');
  const mediaContainer = document.getElementById('lightbox-media-container');
  const caption = document.getElementById('lightbox-caption');
  
  // Clear previous media
  mediaContainer.innerHTML = '';
  
  // Clone the SVG element from inside the clicked portfolio item
  const originalSvg = element.querySelector('.portfolio-item-img');
  if (originalSvg) {
    const clonedSvg = originalSvg.cloneNode(true);
    // Remove any classes that restrict size
    clonedSvg.removeAttribute('class');
    clonedSvg.style.width = '100%';
    clonedSvg.style.height = 'auto';
    clonedSvg.style.maxWidth = '100%';
    clonedSvg.style.maxHeight = '70vh';
    mediaContainer.appendChild(clonedSvg);
  }
  
  // Set caption text
  const overlayTitle = element.querySelector('h4').innerText;
  const overlaySubtitle = element.querySelector('span').innerText;
  caption.innerHTML = `<strong>${overlayTitle}</strong> — ${overlaySubtitle} (CAD Template Placeholder)`;
  
  // Activate lightbox
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // Lock background scrolling
}

function closeLightbox() {
  const lightbox = document.getElementById('portfolio-lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = ''; // Unlock background scrolling
}

// Close lightbox on escape key press
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLightbox();
    closeCheckout();
  }
});

/* ==========================================================================
   4. Contact Form Submission
   ========================================================================== */
function handleContactSubmit(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('form-submit-btn');
  const name = document.getElementById('form-name').value;
  const email = document.getElementById('form-email').value;
  
  submitBtn.disabled = true;
  submitBtn.innerText = 'Sending message...';

  // Simulate server communication
  setTimeout(() => {
    alert(`Thank you, ${name}! Your message has been sent successfully. Our engineering support team will reach out to you at ${email} shortly.`);
    
    // Reset form
    document.getElementById('contact-form').reset();
    submitBtn.disabled = false;
    submitBtn.innerText = 'Send Message';
  }, 1200);
}

/* ==========================================================================
   5. Enterprise Contact Sales Auto-Fill
   ========================================================================== */
function initContactSalesLink() {
  window.contactSales = function() {
    const contactSection = document.getElementById('contact');
    const messageField = document.getElementById('form-message');
    
    // Scroll smoothly to contact
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    // Auto fill message with request template
    messageField.value = "Hello REBARATOZ Team,\n\nI am writing to inquire about your Enterprise subscription plan. Our structural engineering team is looking to automate our drawing workflows and integrate custom detailing rules. Please contact us to schedule a demo and discuss volume license pricing.";
    messageField.focus();
  };
}

/* ==========================================================================
   6. UPI Payment Checkout Flow & Simulator
   ========================================================================== */
let checkoutTimerInterval = null;
let currentSelectedPlan = '';
let currentSelectedPrice = 0;

function openCheckout(planName, price) {
  currentSelectedPlan = planName;
  currentSelectedPrice = price;

  const modal = document.getElementById('checkout-modal');
  const planSummaryName = document.getElementById('checkout-summary-name');
  const planSummaryPrice = document.getElementById('checkout-summary-price');
  
  planSummaryName.innerText = `${planName} Plan`;
  planSummaryPrice.innerText = `₹${price.toLocaleString('en-IN')}`;

  // Reset modal screens to standard billing view
  document.getElementById('checkout-gateway-view').style.display = 'block';
  document.getElementById('checkout-success-view').classList.remove('active');
  document.getElementById('payment-status-block').style.display = 'none';
  document.getElementById('checkout-vpa-input').value = '';

  // Generate UPI QR Code URL via QR Server API
  // Merchant VPA: rebaratoz@upi (will resolve to a generic merchant in India, testing layout only)
  const merchantVpa = 'rebaratoz@okaxis';
  const merchantName = 'REBARATOZ';
  const txRef = 'TXN' + Math.floor(Math.random() * 900000000000 + 100000000000);
  const upiPayload = `upi://pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${price}.00&cu=INR&tn=${encodeURIComponent(planName + ' Detailing Subscription')}&tr=${txRef}`;
  
  // Set image source
  const upiQrImage = document.getElementById('upi-qr-image');
  const qrSpinner = document.getElementById('qr-spinner');
  
  qrSpinner.style.display = 'block';
  upiQrImage.style.display = 'none';
  upiQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayload)}`;

  // Default to QR payment tab display
  switchPaymentTab('qr');

  // Start 5 minute countdown timer
  startCheckoutTimer(300);

  // Display modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCheckout(reloadDashboard = false) {
  const modal = document.getElementById('checkout-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  
  // Clear any active timer intervals
  if (checkoutTimerInterval) {
    clearInterval(checkoutTimerInterval);
    checkoutTimerInterval = null;
  }

  if (reloadDashboard) {
    // Simply alert in prototype, simulate going to live dashboard
    alert('Simulating redirect to REBARATOZ Cloud Workspace CAD Dashboard. Project limits updated.');
  }
}

function switchPaymentTab(tabName) {
  const tabQrBtn = document.getElementById('tab-qr-btn');
  const tabVpaBtn = document.getElementById('tab-vpa-btn');
  const panelQr = document.getElementById('panel-qr');
  const panelVpa = document.getElementById('panel-vpa');

  if (tabName === 'qr') {
    tabQrBtn.classList.add('active');
    tabVpaBtn.classList.remove('active');
    panelQr.classList.add('active');
    panelVpa.classList.remove('active');
  } else {
    tabQrBtn.classList.remove('active');
    tabVpaBtn.classList.add('active');
    panelQr.classList.remove('active');
    panelVpa.classList.add('active');
  }
}

function startCheckoutTimer(seconds) {
  const timerDisplay = document.getElementById('checkout-timer-display');
  
  if (checkoutTimerInterval) {
    clearInterval(checkoutTimerInterval);
  }

  let timeLeft = seconds;
  
  checkoutTimerInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    
    // Format displays
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    const displaySecs = secs < 10 ? '0' + secs : secs;
    
    timerDisplay.innerText = `${displayMinutes}:${displaySecs}`;
    
    if (timeLeft <= 0) {
      clearInterval(checkoutTimerInterval);
      alert('Payment window expired. Please click checkout again to generate a new transaction session.');
      closeCheckout();
    }
    
    timeLeft--;
  }, 1000);
}

function submitVPA() {
  const vpaInput = document.getElementById('checkout-vpa-input').value.trim();
  const statusBlock = document.getElementById('payment-status-block');
  const statusText = document.getElementById('payment-status-text');

  if (!vpaInput || !vpaInput.includes('@')) {
    alert('Please enter a valid UPI ID (VPA), e.g. user@okaxis');
    return;
  }

  statusBlock.style.display = 'flex';
  statusText.innerText = `Sending payment request to ${vpaInput}...`;

  setTimeout(() => {
    statusText.innerText = 'Request sent! Please open your BHIM/GPay/PhonePe app and authorize the payment of ₹' + currentSelectedPrice.toLocaleString('en-IN');
  }, 1500);
}

/* ==========================================================================
   7. B2B Checkout Simulator Controls
   ========================================================================== */
function simulatePaymentSuccess() {
  // Clear countdown timer
  if (checkoutTimerInterval) {
    clearInterval(checkoutTimerInterval);
  }

  const statusBlock = document.getElementById('payment-status-block');
  const statusText = document.getElementById('payment-status-text');
  
  statusBlock.style.display = 'flex';
  statusText.innerText = 'Verifying received UPI payment notification...';

  setTimeout(() => {
    // Hide standard billing overlay
    document.getElementById('checkout-gateway-view').style.display = 'none';
    
    // Show success view with correct pricing inputs
    const successView = document.getElementById('checkout-success-view');
    document.getElementById('receipt-plan-name').innerText = `${currentSelectedPlan} Plan`;
    document.getElementById('receipt-amount').innerText = `₹${currentSelectedPrice.toLocaleString('en-IN')}`;
    
    const randomRef = 'TXN' + Math.floor(Math.random() * 900000000 + 100000000);
    document.getElementById('receipt-tx-ref').innerText = randomRef;

    successView.classList.add('active');
  }, 1500);
}

function simulatePaymentFailure() {
  const statusBlock = document.getElementById('payment-status-block');
  const statusText = document.getElementById('payment-status-text');

  statusBlock.style.display = 'flex';
  statusText.innerText = 'Checking transaction status...';

  setTimeout(() => {
    statusBlock.style.display = 'none';
    alert('UPI Transaction verification failed: Insufficient funds or Request declined. Please try scanning the QR code again or use a different UPI ID.');
  }, 1500);
}

/* ==========================================================================
   8. Production Integration Note (Razorpay Standard Web)
   ========================================================================== 
   
   To switch from simulation mode to active production payment collection:
   
   1. Include Razorpay Checkout script in the <head> of index.html:
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      
   2. Call this function instead of openCheckout():
   
   function handleRazorpayCheckout(planName, priceINR) {
     const options = {
       "key": "YOUR_RAZORPAY_KEY_ID", // Enter API Key here
       "amount": priceINR * 100,      // Razorpay expects paise (e.g. ₹999 = 99900 paise)
       "currency": "INR",
       "name": "REBARATOZ",
       "description": planName + " Detailing Subscription",
       "image": "assets/logo.png",
       "handler": function (response) {
         // This block handles payment callback details from Razorpay:
         console.log(response.razorpay_payment_id);
         console.log(response.razorpay_order_id);
         console.log(response.razorpay_signature);
         
         // Trigger server checkout success webhook or route user to app dashboard
         alert("Payment successful. ID: " + response.razorpay_payment_id);
         window.location.href = "/dashboard?plan=" + planName;
       },
       "prefill": {
         "name": document.getElementById('form-name') ? document.getElementById('form-name').value : "",
         "email": document.getElementById('form-email') ? document.getElementById('form-email').value : "",
         "contact": ""
       },
       "theme": {
         "color": "#1B3A5C" // Deep Navy Brand Color
       }
     };
     const rzp = new Razorpay(options);
     rzp.open();
   }
*/
