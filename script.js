// Audio & Envelope Logic
const bgMusic = document.getElementById('bg-music');
const muteBtn = document.getElementById('mute-btn');
const envScreen = document.getElementById('env-screen');
const mainInv = document.getElementById('main-inv');
const waxSeal = document.getElementById('wax-seal');

let isMusicPlaying = false;
let envelopeOpened = false;

// Audio toggle
muteBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        muteBtn.classList.add('paused');
    } else {
        bgMusic.play().catch(e => console.log("Play prevented"));
        muteBtn.classList.remove('paused');
    }
    isMusicPlaying = !isMusicPlaying;
});

// Create CSS confetti
function fireConfetti() {
    const colors = ['#c9a84c', '#e8d5a0', '#ffffff'];
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.classList.add('confetti-particle');
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
        particle.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 5000);
    }
}

// Open Envelope
waxSeal.addEventListener('click', () => {
    if (envelopeOpened) return;
    envelopeOpened = true;

    // Start music
    bgMusic.volume = 0.5;
    bgMusic.play().then(() => {
        isMusicPlaying = true;
        muteBtn.classList.remove('paused');
    }).catch(e => console.log("Audio play blocked"));

    // Step 1: Flap opens
    envScreen.classList.add('opening');

    // Step 2: Envelope slides away, Invitation emerges
    setTimeout(() => {
        envScreen.classList.add('slide-away');
        mainInv.style.display = 'block';
        
        // Trigger the cinematic 'emerge' animation
        setTimeout(() => {
            mainInv.classList.add('emerge');
            fireConfetti();
            initScratchCard(); // Init scratch card when visible
        }, 50);
    }, 900);

    // Clean up
    setTimeout(() => {
        envScreen.style.display = 'none';
    }, 2500);
});

// Scroll Animations
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal-section').forEach(el => {
    observer.observe(el);
});

// Background Particles
const pContainer = document.getElementById('particles');
for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.width = Math.random() * 6 + 2 + 'px';
    p.style.height = p.style.width;
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = Math.random() * 10 + 10 + 's';
    p.style.animationDelay = Math.random() * 5 + 's';
    pContainer.appendChild(p);
}

// Scratch to Reveal Logic
let scratched = false;
function initScratchCard() {
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    const wrap = document.getElementById('scratch-wrap');
    
    // Strict fixed dimensions to prevent any scaling bugs
    canvas.width = 250;
    canvas.height = 60;

    // Draw gold foil
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#D8C2A0');
    gradient.addColorStop(0.5, '#E5D5BC');
    gradient.addColorStop(1, '#B6A084');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = '#4A3728';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2);

    let isDrawing = false;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;
        
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        
        return {
            x: ((clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
            y: ((clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height
        };
    }

    function startDraw(e) {
        if (scratched) return;
        isDrawing = true;
        scratch(e);
    }

    function stopDraw() {
        isDrawing = false;
    }

    function scratch(e) {
        if (!isDrawing || scratched) return;
        
        if (e.cancelable) {
            e.preventDefault();
        }

        const pos = getPos(e);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
        ctx.fill();

        checkReveal();
    }

    function checkReveal() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentCount = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparentCount++;
        }

        const percentage = (transparentCount / (pixels.length / 4)) * 100;
        
        if (percentage > 45 && !scratched) {
            scratched = true;
            wrap.classList.add('revealed');
            document.getElementById('event-details').classList.remove('blurred');
            fireConfetti();
            canvas.style.transition = "opacity 0.5s ease";
            canvas.style.opacity = "0";
            setTimeout(() => { canvas.style.pointerEvents = "none"; }, 500);
        }
    }

    // Touch events (passive: false is REQUIRED for iOS/Android to prevent scrolling)
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', scratch, { passive: false });
    window.addEventListener('touchend', stopDraw);
    canvas.addEventListener('touchcancel', stopDraw);

    // Mouse events
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', stopDraw);

    // Initially blur the details below it
    document.getElementById('event-details').classList.add('blurred');
}

// Countdown Timer
const targetDate = new Date('May 30, 2026 16:00:00').getTime();
setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    if (distance < 0) return;

    document.getElementById('cd-days').innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
    document.getElementById('cd-hours').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
    document.getElementById('cd-mins').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    document.getElementById('cd-secs').innerText = Math.floor((distance % (1000)) / 1000).toString().padStart(2, '0');
}, 1000);

// RSVP Flow
const btnYes = document.getElementById('rsvp-yes-btn');
const btnNo = document.getElementById('rsvp-no-btn');
const btnBack = document.getElementById('rsvp-back-btn');
const step1 = document.getElementById('rsvp-step1');
const formStep = document.getElementById('rsvp-form');
const successStep = document.getElementById('rsvp-success');
const declineStep = document.getElementById('rsvp-decline');

btnYes.addEventListener('click', () => {
    step1.classList.add('hidden-step');
    setTimeout(() => formStep.classList.remove('hidden-step'), 100);
});

btnNo.addEventListener('click', () => {
    step1.classList.add('hidden-step');
    setTimeout(() => declineStep.classList.remove('hidden-step'), 100);
});

btnBack.addEventListener('click', () => {
    formStep.classList.add('hidden-step');
    setTimeout(() => step1.classList.remove('hidden-step'), 100);
});

formStep.addEventListener('submit', (e) => {
    e.preventDefault();
    formStep.classList.add('hidden-step');
    setTimeout(() => {
        successStep.classList.remove('hidden-step');
        fireConfetti();
    }, 100);
});

// Slideshow Logic
const slides = document.querySelectorAll('#arch-slideshow .slide');
let currentSlide = 0;
if (slides.length > 0) {
    setInterval(() => {
        slides[currentSlide].classList.remove('slide-active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('slide-active');
    }, 4000); // Change image every 4 seconds
}
