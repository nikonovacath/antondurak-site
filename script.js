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
  while (tickerTrack.children.length > 4) {
    tickerTrack.removeChild(tickerTrack.lastChild);
  }

  // IMPORTANT: Temporarily set width to 'auto' & transform to none for measurement
  tickerTrack.style.width = 'auto';
  tickerTrack.style.transform = 'none'; // This is key for measurement (solves mobile jump)

  // Calculate width of the tickerTrack if it only has one set of spans
  let singleSetWidth = tickerTrack.scrollWidth;

  // Find how many sets are needed to exceed 2x viewport width (use 2 instead of 100!)
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

  // Recalculate with all repeats
  tickerTrack.style.width = 'auto'; // unset for new measurement
  tickerTrack.style.transform = 'none';
  let totalWidth = tickerTrack.scrollWidth;

  // Set explicit width (prevents "jump" on mobile from scrollWidth changing)
  tickerTrack.style.width = totalWidth + 'px';

  return totalWidth;
}

// Set up and run the animation
let animationFrame;
let trackWidth = 0;
let animationStart = null;
const SCROLL_PIXELS_PER_SECOND = 50;

// Use RAF time as clean base for all platforms
function animateTicker(timestamp) {
  if (!animationStart) animationStart = timestamp;
  let elapsed = (timestamp - animationStart) / 1000;
  let pxOffset = (elapsed * SCROLL_PIXELS_PER_SECOND) % trackWidth;
  tickerTrack.style.transform = `translateX(${-pxOffset}px)`;
  animationFrame = requestAnimationFrame(animateTicker);
}

// Initialize everything
function startTicker() {
  // Cancel previous frame in case
  if (animationFrame) cancelAnimationFrame(animationFrame);

  // Prepare .ticker__track contents, always reset transform before measuring!
  tickerTrack.style.transform = 'none';
  trackWidth = fillRepeats();

  // Reset transforms and animation timing
  tickerTrack.style.transform = 'translateX(0)';
  animationStart = null;
  animationFrame = requestAnimationFrame(animateTicker);
}

// Re-init when window resizes (throttled)
let resizeTimeout;
window.addEventListener('resize', function () {
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
      // Change all arrow icons in action buttons (fix selector for <a> and <button>)
      document.querySelectorAll('.action-button img[alt="Стрелка"]').forEach(function(arrowImg) {
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
      // Restore all arrow icons in action buttons (<button> and <a>) to blue version
      document.querySelectorAll('.action-button img[alt="Стрелка"]').forEach(function(arrowImg) {
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
// Secret section reveal with strong scroll gesture

(function() {
  // Selectors for the "final" block and the secret section
  var finalBlock = document.querySelector('.final:last-of-type');
  var secretSection = document.querySelector('.secret-section');
  if (!finalBlock || !secretSection) return;

  // State tracking
  var secretRevealed = false;
  var resistanceCounter = 0;
  var RESISTANCE_THRESHOLD = 2; // Number of strong scrolls required
  var STRONG_SCROLL_DELTA = 80; // px threshold for "strong" wheel gesture

  // Hide secret section initially, if not already
  secretSection.style.display = 'none';

  // Helper: check if user at (or very near) bottom of main content
  function isAtFinalBlock() {
    var rect = finalBlock.getBoundingClientRect();
    // When bottom of .final is visible at the bottom of viewport or just above
    return rect.bottom - window.innerHeight < 50;
  }

  // Handler for "wheel" event
  function onWheel(e) {
    if (secretRevealed) return;
    if (!isAtFinalBlock()) {
      resistanceCounter = 0;
      return;
    }

    // Only act on strong downward scrolls
    if (e.deltaY > STRONG_SCROLL_DELTA) {
      resistanceCounter++;
    } else if (e.deltaY < -STRONG_SCROLL_DELTA) {
      // If user scrolls up strong, reset counter
      resistanceCounter = 0;
      return;
    }

    if (resistanceCounter >= RESISTANCE_THRESHOLD) {
      revealSecretSection();
    }
  }

  function revealSecretSection() {
    secretRevealed = true;
    // Show the section (will be full screen block)
    secretSection.style.display = 'flex';
    // Optionally, scroll smoothly to it
    secretSection.scrollIntoView({ behavior: 'smooth' });
  }

  // Listen for wheel events globally
  window.addEventListener('wheel', onWheel, { passive: false });

  // Optional: If user scrolls back up to main, hide the secret section again.
  // Uncomment below if you want to let user "go back".
  /*
  window.addEventListener('scroll', function() {
    if (!secretRevealed) return;
    var rect = finalBlock.getBoundingClientRect();
    if (rect.bottom - window.innerHeight > 60) {
      secretSection.style.display = 'none';
      secretRevealed = false;
      resistanceCounter = 0;
    }
  });
  */
})();

