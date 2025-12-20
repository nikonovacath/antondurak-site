// Get ticker track and store necessary references
const tickerTrack = document.getElementById('tickerTrack');

// Get the 4 original spans as a NodeList/Array
const originalSpans = Array.from(tickerTrack.children);

// Helper to get viewport width:
function getViewportWidth() {
  return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
}

// Duplicate spans to fill at least 2 screen widths
function fillRepeats() {
  // Remove any duplicates from previous runs, keep only the first 4
  while(tickerTrack.children.length > 4) {
    tickerTrack.removeChild(tickerTrack.lastChild);
  }

  // Calculate width of the tickerTrack if it only has one set of spans
  let singleSetWidth = tickerTrack.scrollWidth;

  // Find how many sets are needed to exceed 2x viewport width
  const targetWidth = getViewportWidth() * 100;
  let setsNeeded = Math.ceil(targetWidth / singleSetWidth);

  if (setsNeeded < 2) setsNeeded = 2; // Always at least 2 to avoid short loops

  // Fill tickerTrack with repeated spans
  for (let i = 1; i < setsNeeded; i++) {
    originalSpans.forEach(span => {
      const clone = span.cloneNode(true);
      tickerTrack.appendChild(clone);
    });
  }

  // Set tickerTrack width, unset in case previously set
  tickerTrack.style.width = 'auto';

  // Impose the exact pixel width
  tickerTrack.style.width = tickerTrack.scrollWidth + 'px';

  return tickerTrack.scrollWidth;
}

// Set up and run the animation
let animationFrame;
let animationTime = 0;
let trackWidth = 0;
const SCROLL_PIXELS_PER_SECOND = 50;

function animateTicker(time) {
  // Calculate elapsed time (in seconds)
  if (!animationTime) animationTime = time;
  let elapsed = (time - animationTime) / 1000;
  // Move ticker left by this many pixels
  let pxOffset = (elapsed * SCROLL_PIXELS_PER_SECOND) % trackWidth;
  tickerTrack.style.transform = `translateX(${-pxOffset}px)`;
  animationFrame = requestAnimationFrame(animateTicker);
}

// Initialize everything
function startTicker() {
  // Prepare .ticker__track contents
  trackWidth = fillRepeats();
  // Reset transforms
  tickerTrack.style.transform = 'translateX(0)';
  // Cancel previous frame
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationTime = 0;
  animationFrame = requestAnimationFrame(animateTicker);
}

// Re-init when window resizes (throttled)
let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(startTicker, 200);
});

// Start on load
startTicker();

function openPopup(id) {
  document.getElementById(id).style.display = 'flex';
}

function closePopup(id) {
  document.getElementById(id).style.display = 'none';
}

// Close popup when clicking on overlay (outside the popup-content)
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.popup-overlay').forEach(function(popup) {
    popup.addEventListener('click', function(e) {
      // Only close if click is directly on the overlay (not inside the popup-content)
      if (e.target === popup) {
        popup.style.display = 'none';
      }
    });
  });
});
// Theme radio button logic: switch --main to green/blue, update "active" toggle class, change logo, change popup close icon, and change arrow icon
document.addEventListener('DOMContentLoaded', function() {

  function setTheme(theme) {
    if (theme === "green") {
      // Set main color to green
      document.documentElement.style.setProperty('--main', getComputedStyle(document.documentElement).getPropertyValue('--green'));
      // Change logo image
      let logo = document.querySelector('header img');
      if (logo) logo.src = "logo-green.svg";
      // Change all popup close icons to green
      document.querySelectorAll('.popup-header img[alt="Закрыть"]').forEach(function(closeIcon) {
        closeIcon.src = "close-icon-green.svg";
      });
      // Change all arrow icons in buttons to green version
      document.querySelectorAll('button.action-button img[alt="Стрелка"]').forEach(function(arrowImg) {
        arrowImg.src = "arrow-green.svg";
      });
    } else if (theme === "blue") {
      // Set main color to blue
      document.documentElement.style.setProperty('--main', getComputedStyle(document.documentElement).getPropertyValue('--blue'));
      // Restore logo image
      let logo = document.querySelector('header img');
      if (logo) logo.src = "logo.svg";
      // Restore all popup close icons to blue version
      document.querySelectorAll('.popup-header img[alt="Закрыть"]').forEach(function(closeIcon) {
        closeIcon.src = "close-icon.svg";
      });
      // Restore all arrow icons in buttons to blue version
      document.querySelectorAll('button.action-button img[alt="Стрелка"]').forEach(function(arrowImg) {
        arrowImg.src = "arrow.svg";
      });
    }
  }

  document.querySelectorAll('.toggle-option input[name="theme"]').forEach(function(input) {
    input.addEventListener('change', function() {
      if (input.checked) {
        setTheme(input.value);
      }
      // update active class
      document.querySelectorAll('.toggle-option').forEach(function(label) {
        label.classList.remove('active');
      });
      input.closest('.toggle-option').classList.add('active');
    });
  });

  // On page load, apply the checked theme
  let checkedTheme = document.querySelector('.toggle-option input[name="theme"]:checked');
  if (checkedTheme) {
    setTheme(checkedTheme.value);
    checkedTheme.closest('.toggle-option').classList.add('active');
  }
});

