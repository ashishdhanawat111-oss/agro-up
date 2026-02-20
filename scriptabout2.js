document.addEventListener('DOMContentLoaded', () => {
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                
                // If it's a stat card, trigger the counter
                if (entry.target.querySelector('.counter')) {
                    startCounter(entry.target.querySelector('.counter'));
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .stat-card').forEach(el => {
        observer.observe(el);
    });

    // Function to handle counting logic
    function startCounter(counter) {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / 100;

        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(() => startCounter(counter), 20);
        } else {
            counter.innerText = target + (target === 100 ? "%" : "+");
        }
    }
});