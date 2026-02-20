document.querySelectorAll('.pricing-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
    card.style.transition = "all 0.3s ease";
  });
  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = "none";
  });
});