// ===================================
// AGRO-UP Farmer Partnership Wizard
// With Vapi.ai Voice Agent Integration
// ===================================

// ========== CONFIGURATION ==========
// Replace these with your actual Vapi.ai credentials
const VAPI_PUBLIC_KEY = 'f7368bb1-6386-4b92-9880-4d0c2cc2abd2';  // Get from: https://dashboard.vapi.ai → Organization → API Keys
const VAPI_ASSISTANT_ID = 'e41d8f35-4c9e-4c63-ae97-bdcb9bb639f7';   // Create assistant in Vapi Dashboard

// ========== SLIDE NAVIGATION ==========
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function nextSlide() {
    // Validate before proceeding (skip validation for slide 0 — the welcome screen)
    if (currentSlide > 0 && !validateCurrentSlide()) {
        return;
    }

    slides[currentSlide].classList.remove('active');
    currentSlide++;
    if (currentSlide < slides.length) {
        slides[currentSlide].classList.add('active');
    }
}

// ========== VALIDATION ==========
function validateCurrentSlide() {
    const isHindi = document.getElementById('lang-hi').checked;

    switch (currentSlide) {
        case 1: { // Step 1: Name
            const name = document.getElementById('name').value.trim();
            if (!name) {
                showValidationAlert(
                    isHindi ? 'कृपया अपना पूरा नाम दर्ज करें' : 'Please enter your full name'
                );
                document.getElementById('name').focus();
                return false;
            }
            return true;
        }
        case 2: // Step 2: Crop selection (option buttons call nextSlide directly, always valid)
            return true;

        case 3: { // Step 3: Location / Pincode
            const location = document.getElementById('location').value.trim();
            if (!location) {
                showValidationAlert(
                    isHindi ? 'कृपया अपना पिनकोड या स्थान दर्ज करें' : 'Please enter your pincode or location'
                );
                document.getElementById('location').focus();
                return false;
            }
            return true;
        }
        case 4: { // Step 4: Phone number
            const phone = document.getElementById('phone').value.trim();
            if (!phone) {
                showValidationAlert(
                    isHindi ? 'कृपया अपना मोबाइल नंबर दर्ज करें' : 'Please enter your mobile number'
                );
                document.getElementById('phone').focus();
                return false;
            }
            // Check for 10-digit number
            const digitsOnly = phone.replace(/\D/g, '');
            if (digitsOnly.length !== 10) {
                showValidationAlert(
                    isHindi ? 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number'
                );
                document.getElementById('phone').focus();
                return false;
            }
            return true;
        }
        default:
            return true;
    }
}

function showValidationAlert(message) {
    // Remove any existing alert
    const existing = document.querySelector('.validation-alert');
    if (existing) existing.remove();

    // Create alert element
    const alert = document.createElement('div');
    alert.className = 'validation-alert';
    alert.innerHTML = `
        <span class="validation-alert-icon">⚠️</span>
        <span class="validation-alert-text">${message}</span>
    `;

    // Insert at the top of the current slide
    const currentSlideEl = slides[currentSlide];
    currentSlideEl.insertBefore(alert, currentSlideEl.firstChild);

    // Shake the input to draw attention
    const input = currentSlideEl.querySelector('input');
    if (input) {
        input.classList.add('input-shake');
        setTimeout(() => input.classList.remove('input-shake'), 500);
    }

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.classList.add('validation-alert-hide');
            setTimeout(() => alert.remove(), 300);
        }
    }, 3000);
}

function prevSlide() {
    if (currentSlide > 0) {
        slides[currentSlide].classList.remove('active');
        currentSlide--;
        slides[currentSlide].classList.add('active');
    }
}

// ========== LANGUAGE TOGGLE ==========
function toggleLanguage(lang) {
    const elements = document.querySelectorAll('[data-en]');

    elements.forEach(el => {
        if (lang === 'hi') {
            el.innerText = el.getAttribute('data-hi');
        } else {
            el.innerText = el.getAttribute('data-en');
        }
    });

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

// ========== VAPI VOICE AGENT ==========
let vapiInstance = null;
let callTimerInterval = null;
let callStartTime = null;

function finish() {
    const farmerName = document.getElementById('name').value || 'Farmer';
    const farmerPhone = document.getElementById('phone').value || '';
    const farmerLocation = document.getElementById('location').value || '';
    const isHindi = document.getElementById('lang-hi').checked;

    // Move to voice call slide (slide 6)
    slides[currentSlide].classList.remove('active');
    currentSlide = slides.length - 1; // Go to last slide (voice call)
    slides[currentSlide].classList.add('active');

    // Update UI with farmer's name
    const subtitle = document.getElementById('voice-subtitle');
    if (isHindi) {
        subtitle.textContent = `${farmerName}, आपको AI सहायक से जोड़ रहे हैं...`;
    } else {
        subtitle.textContent = `Connecting you to your advisor, ${farmerName}...`;
    }

    // Set connecting state
    setCallStatus('connecting');

    // Start Vapi voice call
    startVapiCall(farmerName, farmerPhone, farmerLocation, isHindi);
}

function setCallStatus(status) {
    const statusEl = document.getElementById('call-status');
    const statusText = document.getElementById('status-text');
    const pulseRing = document.getElementById('pulse-ring');
    const endBtn = document.getElementById('end-call-btn');

    if (statusEl) statusEl.className = 'call-status ' + status;

    switch (status) {
        case 'connecting':
            if (statusText) statusText.textContent = 'Connecting...';
            if (pulseRing) pulseRing.classList.remove('active');
            if (endBtn) endBtn.classList.remove('hidden');
            break;
        case 'active':
            if (statusText) statusText.textContent = 'Connected';
            if (pulseRing) pulseRing.classList.add('active');
            if (endBtn) endBtn.classList.remove('hidden');
            startTimer();
            break;
        case 'ended':
            if (statusText) statusText.textContent = 'Call Ended';
            if (pulseRing) pulseRing.classList.remove('active');
            if (endBtn) endBtn.classList.add('hidden');
            stopTimer();
            break;
        case 'error':
            if (statusText) statusText.textContent = 'Connection Failed';
            if (pulseRing) pulseRing.classList.remove('active');
            if (endBtn) endBtn.classList.add('hidden');
            stopTimer();
            break;
    }
}

function startTimer() {
    callStartTime = Date.now();
    const timerEl = document.getElementById('call-timer');

    callTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
}

function stopTimer() {
    if (callTimerInterval) {
        clearInterval(callTimerInterval);
        callTimerInterval = null;
    }
}

function addTranscript(role, text) {
    const container = document.getElementById('transcript-messages');

    // Remove placeholder if present
    const placeholder = container.querySelector('.transcript-placeholder');
    if (placeholder) placeholder.remove();

    const msg = document.createElement('div');
    msg.className = `transcript-msg ${role}`;
    msg.textContent = text;
    container.appendChild(msg);

    // Auto-scroll to bottom
    const scrollContainer = document.getElementById('transcript-container');
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
}

async function startVapiCall(farmerName, farmerPhone, farmerLocation, isHindi) {
    // Check if API key is configured
    if (VAPI_PUBLIC_KEY === 'YOUR_VAPI_PUBLIC_KEY' || VAPI_ASSISTANT_ID === 'YOUR_ASSISTANT_ID') {
        // Demo mode - show setup instructions
        setCallStatus('error');
        showSetupInstructions(farmerName, isHindi);
        return;
    }

    try {
        // Wait for Vapi SDK — it's loaded as an ES module and fires 'vapi-ready' event
        if (!window.VapiSDK) {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Vapi SDK timed out')), 10000);
                window.addEventListener('vapi-ready', () => {
                    clearTimeout(timeout);
                    resolve();
                }, { once: true });
                // In case it already loaded
                if (window.VapiSDK) { clearTimeout(timeout); resolve(); }
            });
        }

        if (!window.VapiSDK) {
            throw new Error('Vapi SDK failed to load.');
        }

        // Initialize Vapi
        vapiInstance = new window.VapiSDK(VAPI_PUBLIC_KEY);

        // Set up event listeners
        vapiInstance.on('call-start', () => {
            setCallStatus('active');
            const greeting = isHindi
                ? `${farmerName} जी, नमस्ते! मैं AGRO-UP AI सहायक हूं।`
                : `Namaste ${farmerName}! I am your AGRO-UP AI Assistant.`;
            addTranscript('ai', greeting);
        });

        vapiInstance.on('call-end', () => {
            setCallStatus('ended');
            showCallSummary(farmerName, isHindi);
        });

        vapiInstance.on('message', (message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const role = message.role === 'assistant' ? 'ai' : 'user';
                addTranscript(role, message.transcript);

                // Animate avatar when AI speaks
                const avatar = document.getElementById('voice-avatar');
                if (role === 'ai' && avatar) {
                    avatar.classList.add('speaking');
                    setTimeout(() => avatar.classList.remove('speaking'), 1500);
                }
            }
        });

        vapiInstance.on('error', (error) => {
            console.error('Vapi Error:', error);
            const errorMsg = error?.errorMsg || error?.message || 'Unknown error';

            // Don't show error UI if it's just a meeting-end event
            if (errorMsg.includes('Meeting has ended') || errorMsg.includes('ejection')) {
                setCallStatus('ended');
                showCallSummary(farmerName, isHindi);
                return;
            }

            setCallStatus('error');
            showErrorUI(farmerName, isHindi, errorMsg);
        });

        // Start the voice call with assistant ID
        // Pass farmer context via assistantOverrides
        await vapiInstance.start(VAPI_ASSISTANT_ID, {
            firstMessage: isHindi
                ? `नमस्ते ${farmerName} जी! मैं AGRO-UP का AI सहायक हूं। मैं आपको ${farmerLocation} क्षेत्र में आपकी फसल की कीमत तय करने में मदद करूंगा। आप मुझसे कुछ भी पूछ सकते हैं।`
                : `Namaste ${farmerName}! I am the AGRO-UP AI Assistant. I will help you set prices for your crops in the ${farmerLocation} area. Feel free to ask me anything about selling on our platform.`
        });

    } catch (error) {
        console.error('Failed to start Vapi call:', error);
        setCallStatus('error');
        showErrorUI(farmerName, isHindi, error?.message || 'Connection failed');
    }
}

function endVoiceCall() {
    if (vapiInstance) {
        vapiInstance.stop();
    }
    setCallStatus('ended');
    const farmerName = document.getElementById('name').value || 'Farmer';
    const isHindi = document.getElementById('lang-hi').checked;
    showCallSummary(farmerName, isHindi);
}

function showCallSummary(farmerName, isHindi) {
    const container = document.getElementById('transcript-container');
    const controls = document.querySelector('.call-controls');
    const timer = document.getElementById('call-timer');
    const subtitle = document.getElementById('voice-subtitle');

    const duration = timer.textContent;

    if (isHindi) {
        subtitle.textContent = 'कॉल समाप्त हुआ';
    } else {
        subtitle.textContent = 'Call ended';
    }

    controls.innerHTML = `
        <div class="call-ended-summary">
            <h3>${isHindi ? 'धन्यवाद, ' + farmerName + ' जी!' : 'Thank you, ' + farmerName + '!'}</h3>
            <p>${isHindi ? 'कॉल अवधि: ' + duration : 'Call duration: ' + duration}</p>
            <button class="restart-btn" onclick="window.location.href='index.html'">
                ${isHindi ? 'होमपेज पर जाएं' : 'Go to Homepage'}
            </button>
        </div>
    `;
}

function showErrorUI(farmerName, isHindi, errorMsg) {
    const container = document.querySelector('.voice-call-container');
    const subtitle = document.getElementById('voice-subtitle');
    const controls = document.querySelector('.call-controls');

    if (subtitle) subtitle.textContent = isHindi ? 'कनेक्शन में समस्या आई' : 'Connection issue';

    if (controls) controls.innerHTML = `
        <div class="error-container">
            <div class="error-icon">⚠️</div>
            <p>${isHindi
            ? 'AI सहायक से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।'
            : 'Could not connect to AI assistant. Please try again.'}</p>
            ${errorMsg ? `<p style="font-size: 0.75rem; color: #999; margin-top: -10px;">${errorMsg}</p>` : ''}
            <button class="retry-btn" onclick="retryCall()">
                ${isHindi ? 'पुनः प्रयास करें' : 'Retry'}
            </button>
            <button class="retry-btn" onclick="window.location.href='index.html'" style="background: #ddd; color: #333;">
                ${isHindi ? 'होमपेज' : 'Go Home'}
            </button>
        </div>
    `;
}

function showSetupInstructions(farmerName, isHindi) {
    const subtitle = document.getElementById('voice-subtitle');
    const controls = document.querySelector('.call-controls');
    const transcriptContainer = document.getElementById('transcript-messages');

    subtitle.textContent = 'Setup Required';

    transcriptContainer.innerHTML = `
        <div class="transcript-placeholder" style="text-align: left; font-style: normal; color: #555;">
            <strong>⚙️ Vapi.ai Setup Steps:</strong><br><br>
            1. Sign up at <a href="https://vapi.ai" target="_blank" style="color: #8cc63f;">vapi.ai</a> (free tier)<br><br>
            2. Create an Assistant in the dashboard with this system prompt:<br>
            <em style="color: #888; font-size: 0.8rem;">"You are an AI farming assistant for AGRO-UP, a farm-fresh produce company in Jodhpur. Help farmers set prices for their crops, answer questions about the platform, and guide them on best practices. Be warm and friendly. Greet them by name."</em><br><br>
            3. Copy your <strong>Public Key</strong> and <strong>Assistant ID</strong><br><br>
            4. Open <code>scriptfar2.js</code> and replace:<br>
            <code style="font-size: 0.75rem;">VAPI_PUBLIC_KEY</code> and <code style="font-size: 0.75rem;">VAPI_ASSISTANT_ID</code>
        </div>
    `;

    controls.innerHTML = `
        <div class="error-container">
            <button class="retry-btn" onclick="window.open('https://vapi.ai', '_blank')">
                Open Vapi Dashboard
            </button>
            <button class="retry-btn" onclick="window.location.reload()" style="background: #ddd; color: #333;">
                Reload After Setup
            </button>
        </div>
    `;
}

function retryCall() {
    // Reset UI
    document.getElementById('transcript-messages').innerHTML = `
        <div class="transcript-placeholder">Waiting for connection...</div>
    `;
    document.getElementById('call-timer').textContent = '00:00';
    document.querySelector('.call-controls').innerHTML = `
        <button class="end-call-btn" id="end-call-btn" onclick="endVoiceCall()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 2.59 3.4Z"/>
            </svg>
            <span>End Call</span>
        </button>
    `;

    const farmerName = document.getElementById('name').value || 'Farmer';
    const farmerPhone = document.getElementById('phone').value || '';
    const farmerLocation = document.getElementById('location').value || '';
    const isHindi = document.getElementById('lang-hi').checked;

    setCallStatus('connecting');
    startVapiCall(farmerName, farmerPhone, farmerLocation, isHindi);
}