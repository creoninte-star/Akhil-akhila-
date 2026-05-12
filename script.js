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
        muteBtn.textContent = '🔇';
    } else {
        bgMusic.play().catch(e => console.log("Play prevented"));
        muteBtn.textContent = '🔊';
    }
    isMusicPlaying = !isMusicPlaying;
});

// Create CSS confetti
function fireConfetti() {
    const colors = ['#c9a84c', '#e8d5a0', '#ffffff'];
    for (let i = 0; i < 60; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = Math.random() * 8 + 4 + 'px';
        particle.style.height = Math.random() * 8 + 4 + 'px';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = 50 + (Math.random() * 10 - 5) + 'vw';
        particle.style.top = '60vh';
        particle.style.borderRadius = '2px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        document.body.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const velocity = 15 + Math.random() * 15;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity - 20;

        let x = 0, y = 0, opacity = 1;
        const animate = () => {
            x += vx;
            y += vy + 2; // gravity
            opacity -= 0.02;
            particle.style.transform = `translate(${x}px, ${y}px) rotate(${x*2}deg)`;
            particle.style.opacity = opacity;
            if (opacity > 0) requestAnimationFrame(animate);
            else particle.remove();
        };
        requestAnimationFrame(animate);
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
        muteBtn.textContent = '🔊';
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
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in-up, .fade-in-stagger').forEach(el => {
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
    
    // Set canvas resolution
    const rect = wrap.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw gold foil
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#D8C2A0');
    gradient.addColorStop(0.5, '#E5D5BC');
    gradient.addColorStop(1, '#B6A084');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = '#4A3728';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '3px';
    ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2);

    let isDrawing = false;
    let scratchPoints = 0;

    function getPosition(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function scratch(e) {
        if (!isDrawing || scratched) return;
        e.preventDefault();
        
        const pos = getPosition(e);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
        ctx.fill();

        scratchPoints++;
        if (scratchPoints > 40 && !scratched) {
            scratched = true;
            wrap.classList.add('revealed');
            document.getElementById('event-details').classList.remove('blurred');
            fireConfetti();
        }
    }

    canvas.addEventListener('mousedown', () => { isDrawing = true; });
    canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); });
    window.addEventListener('mouseup', () => { isDrawing = false; });
    window.addEventListener('touchend', () => { isDrawing = false; });
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('touchmove', scratch);
    
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
