document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('form');
    const submitBtn = contactForm.querySelector('button');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Visual Feedback: Disable button and show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
            </span>
        `;

        // 2. Simulate API Call (e.g., sending email)
        setTimeout(() => {
            // Success Feedback
            submitBtn.style.backgroundColor = "#8CC63F";
            submitBtn.style.color = "#101F01";
            submitBtn.innerHTML = "Message Sent! ✓";

            // Reset Form
            contactForm.reset();

            // 3. Reset Button after 3 seconds
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                submitBtn.style.backgroundColor = "";
                submitBtn.style.color = "";
            }, 3000);

            console.log("Form successfully submitted to agro up support.");
        }, 1500);
    });
});