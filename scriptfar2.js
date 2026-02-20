let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide++;
    if (currentSlide < slides.length) {
        slides[currentSlide].classList.add('active');
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        slides[currentSlide].classList.remove('active');
        currentSlide--;
        slides[currentSlide].classList.add('active');
    }
}

function toggleLanguage(lang) {
    // Find all elements with data-en and data-hi attributes
    const elements = document.querySelectorAll('[data-en]');
    
    elements.forEach(el => {
        if (lang === 'hi') {
            el.innerText = el.getAttribute('data-hi');
        } else {
            el.innerText = el.getAttribute('data-en');
        }
    });

    // Update placeholders separately
    const nameInput = document.getElementById('name');
    const locInput = document.getElementById('location');
    const phoneInput = document.getElementById('phone');

    if (lang === 'hi') {
        nameInput.placeholder = "पूरा नाम दर्ज करें";
        locInput.placeholder = "गांव / जिला दर्ज करें";
        phoneInput.placeholder = "मोबाइल नंबर";
    } else {
        nameInput.placeholder = "Enter full name";
        locInput.placeholder = "Enter Village / District";
        phoneInput.placeholder = "Mobile Number";
    }
}

function finish() {
    const farmerName = document.getElementById('name').value;
    const isHindi = document.getElementById('lang-hi').checked;
    const greeting = isHindi ? "नमस्ते " : "Namaste ";
    const message = isHindi ? "! आपको आपके AI सहायक से जोड़ा जा रहा है।" : "! Connecting you to your AI Assistant now.";
    
    alert(greeting + farmerName + message);
    window.location.href = "https://your-ai-assistant-link.com"; 
}