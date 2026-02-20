document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', () => {
    // Example: Scroll to a section with id="shop"
    const shopSection = document.getElementById('shop');
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.log("Button clicked! You can link this to your shop page.");
    }
  });
});


// Function to handle fade-in on scroll
const observerOptions = {
  threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Select the section to animate
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector('.info-container');
  section.style.opacity = "0";
  section.style.transform = "translateY(30px)";
  section.style.transition = "all 0.8s ease-out";
  observer.observe(section);
});



document.querySelectorAll('.feature-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    const img = item.querySelector('.feature-img');
    if(img) img.style.transform = "scale(1.02)";
    if(img) img.style.transition = "transform 0.3s ease";
  });
  
  item.addEventListener('mouseleave', () => {
    const img = item.querySelector('.feature-img');
    if(img) img.style.transform = "scale(1)";
  });
});


const reviewObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in-visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.review-card').forEach(card => {
  card.style.opacity = "0";
  card.style.transform = "translateY(20px)";
  card.style.transition = "all 0.6s ease-out";
  reviewObserver.observe(card);
});

// Add this to your CSS for the JS to trigger
/*
.fade-in-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
*/


const finalButtons = document.querySelectorAll('.cta-actions a');

finalButtons.forEach(btn => {
  btn.addEventListener('mousedown', () => {
    btn.style.transform = "scale(0.96)";
  });
  btn.addEventListener('mouseup', () => {
    btn.style.transform = "scale(1)";
  });
});



document.addEventListener("DOMContentLoaded", () => {
  const aboutSection = document.querySelector('.about-container');
  
  // Initial hidden state
  aboutSection.style.opacity = "0";
  aboutSection.style.transform = "translateY(30px)";
  aboutSection.style.transition = "all 0.8s ease-out";

  const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.2 });

  aboutObserver.observe(aboutSection);
});



document.addEventListener("DOMContentLoaded", () => {
  const copyrightContainer = document.querySelector('.copyright');
  const currentYear = new Date().getFullYear();
  copyrightContainer.innerHTML = `© ${currentYear} agro up. All rights reserved.`;
});