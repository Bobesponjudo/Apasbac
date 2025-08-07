 const slides = document.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.nav-dot');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        let currentIndex = 0;
        const totalSlides = slides.length;
        
        function showSlide(index) {
            // Esconde todos os slides
            slides.forEach(slide => {
                slide.style.display = 'none';
            });
            
            // Remove a classe 'active' de todos os dots
            dots.forEach(dot => {
                dot.classList.remove('active');
            });
            
            // Mostra o slide atual e ativa o dot correspondente
            slides[index].style.display = 'flex';
            dots[index].classList.add('active');
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
        
        // Adiciona eventos aos botões
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);
        
        // Adiciona eventos aos dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
            });
        });
        
        // Inicia o carrossel
        showSlide(0);
        
        // Auto-avanço (opcional)
        setInterval(nextSlide, 5000);