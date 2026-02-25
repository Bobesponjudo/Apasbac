// ============ CARROSSEL ============
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.nav-dot');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentIndex = 0;
const totalSlides = slides.length;
let autoTimer;

if (slides.length > 0) {
    function showSlide(index) {
        slides.forEach(slide => { slide.style.display = 'none'; });
        dots.forEach(dot => { dot.classList.remove('active'); });
        slides[index].style.display = 'flex';
        if (dots[index]) dots[index].classList.add('active');
        currentIndex = index;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(currentIndex);
    }

    function resetTimer() {
        clearInterval(autoTimer);
        autoTimer = setInterval(nextSlide, 5000);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { showSlide(index); resetTimer(); });
    });

    showSlide(0);
    autoTimer = setInterval(nextSlide, 5000);

    // Swipe support
    let touchStartX = 0;
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        carousel.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; });
        carousel.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 40) { diff > 0 ? nextSlide() : prevSlide(); resetTimer(); }
        });
    }
}

// ============ DOAÇÕES ============
const amountBtns = document.querySelectorAll('.amount-btn');
const customInput = document.getElementById('custom-value');

amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        amountBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (customInput) customInput.value = '';
    });
});

if (customInput) {
    customInput.addEventListener('input', () => {
        if (customInput.value) {
            amountBtns.forEach(b => b.classList.remove('active'));
        }
    });
}

const switchBtns = document.querySelectorAll('.switch-btn');
switchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

const methodBtns = document.querySelectorAll('.method-btn');
const creditCardInfo = document.getElementById('credit-card-info');
methodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        methodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (creditCardInfo) {
            creditCardInfo.style.display = btn.textContent.includes('Cartão') ? 'block' : 'none';
        }
    });
});

// ============ ANIMAÇÃO DE ENTRADA ============
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.card-pet, .caixa').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});