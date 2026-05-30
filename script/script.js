const API_BASE_URL = "https://apasbac-api.vercel.app/api/v1"; // Substitua pela URL real

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
// ============ BANCO DE DADOS DOS PETS ============
const petsData = {
    'theo-augusto': {
        nome: "Théo Augusto",
        img: "imagens/animal2.jpeg",
        genero: "Macho",
        idade: "4 meses",
        porte: "Pequeno",
        desc: "O Théo é um gatinho extremamente carinhoso e brincalhão. Foi resgatado em uma caixa de papelão e agora busca um lar onde possa receber muito amor e sachê. Ele se dá bem com outros gatos!"
    },
    'thor': {
        nome: "Thor",
        img: "imagens/animal1.jpeg",
        genero: "Macho",
        idade: "2 anos",
        porte: "Grande",
        desc: "Thor é um cão forte, leal e muito protetor. Apesar do tamanho, é um 'bobão' que ama brincar com bolinhas. Precisa de uma casa com quintal espaçoso para correr."
    },
    'duque': {
        nome: "Duque",
        img: "imagens/animal3.jpeg",
        genero: "Macho",
        idade: "9 meses",
        porte: "Médio",
        desc: "Duque é um jovem cheio de energia! Adora passeios e já aprendeu a dar a pata. É o companheiro ideal para quem gosta de fazer caminhadas ao ar livre."
    },
    'dina': {
        nome: "Dina",
        img: "imagens/animal4.jpeg",
        genero: "Fêmea",
        idade: "2 anos e 5 meses",
        porte: "Médio",
        desc: "Dina é uma cadelinha tranquila e observadora. Ela é um pouco tímida no começo, mas depois que confia, não desgruda do dono. Perfeita para apartamentos ou casas calmas."
    }
};

async function listarAnimais() {
    try {
        const response = await fetch(`${API_BASE_URL}/animals`);
        const animals = await response.json();
        
        const container = document.querySelector('.container-pets');
        container.innerHTML = ""; // Limpa os estáticos

        animals.forEach(pet => {
            container.innerHTML += `
                <div class="card-pet">
                    <img src="${pet.imageUrl || 'imagens/placeholder.jpg'}" alt="${pet.name}">
                    <div class="info-pet">
                        <h2>${pet.name}</h2>
                        <p><strong>Gênero:</strong> ${pet.sex === 'MALE' ? 'Macho' : 'Fêmea'}</p>
                        <p><strong>Porte:</strong> ${pet.size}</p>
                        <a href="maisinformacoes.html?id=${pet.id}"><button><strong>Mais informações</strong></button></a>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erro ao buscar animais:", error);
    }
}

async function carregarAnimaisDaAPI() {
    const container = document.getElementById('lista-animais');
    if (!container) return;

    try {
        container.innerHTML = "<p>Carregando nossos amiguinhos...</p>";

        const response = await fetch(`${API_BASE_URL}/animals`);
        if (!response.ok) throw new Error("Erro ao buscar animais");

        const respostaCompleta = await response.json();

        // AQUI ESTÁ O SEGREDO: 
        // A lista real de animais está dentro de respostaCompleta.data.data
        const animais = respostaCompleta.data.data;

        // Verificamos se animais é realmente uma lista antes de continuar
        if (!animais || !Array.isArray(animais)) {
            container.innerHTML = "<p>Nenhum animal encontrado no momento.</p>";
            return;
        }

        container.innerHTML = "";

        animais.forEach(pet => {
            const genero = pet.sex === 'MALE' ? 'Macho' : 'Fêmea';
            
            // Usando a primeira foto do array que vem na sua API
            const foto = (pet.photos && pet.photos.length > 0) 
                         ? pet.photos[0] 
                         : 'imagens/Logo.webp';

            const card = `
                <div class="card-pet">
                    <img src="${foto}" alt="${pet.name}">
                    <div class="info-pet">
                        <h2>${pet.name}</h2>
                        <p><strong>Gênero:</strong> ${genero}</p>
                        <p><strong>Raça:</strong> ${pet.breed}</p>
                        <a href="maisinformacoes.html?id=${pet.id}">
                            <button><strong>Mais informações</strong></button>
                        </a>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        container.innerHTML = "<p>Erro ao carregar animais. Verifique o console.</p>";
    }
}

// 3. Chamar a função quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    checkAuth(); // Sua função de autenticação
    carregarAnimaisDaAPI(); // Busca os animais da API
});

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            fullName: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            cpf: document.getElementById('cpf').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirm-password').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Cadastro realizado com sucesso! Faça seu login.");
                window.location.href = 'entrar.html';
            } else {
                const data = await response.json();
                alert("Erro: " + (data.message || "Verifique os dados."));
            }
        } catch (error) {
            alert("Não foi possível conectar ao servidor.");
        }
    });
}

// --- 2. FUNÇÃO DE LOGIN ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                // Salva o token VIP no navegador
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('userName', email); // Opcional: salvar algo para mostrar na tela
                
                window.location.href = 'index.html';
            } else {
                alert("E-mail ou senha incorretos.");
            }
        } catch (error) {
            alert("Erro ao conectar com a API.");
        }
    });
}

// --- 3. CONTROLE DE INTERFACE (LOGADO vs DESLOGADO) ---
function checkAuth() {
    const token = localStorage.getItem('accessToken');
    const userActions = document.querySelector('.user-actions');

    if (token && userActions) {
        // Se estiver logado, muda o menu
        userActions.innerHTML = `
            <span style="color: #8b1a1a; font-weight: 600; margin-right: 10px;">Olá!</span>
            <a href="#" id="logoutBtn" style="background: #5c0f0f;">Sair</a>
        `;

        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userName');
            window.location.href = 'index.html';
        });
    }
}

async function carregarDadosDoPet() {
    const params = new URLSearchParams(window.location.search);
    const petId = params.get('id'); // Agora pegamos o ID numérico

    if (!petId) return;

    try {
        // Usando o endpoint público de detalhes que está no seu Swagger
        const response = await fetch(`${API_BASE_URL}/animals/public/${petId}`);
        
        if (!response.ok) {
            window.location.href = 'queroadotar.html';
            return;
        }

        const pet = await response.json();

        // Preenche o HTML com os dados reais da API
        document.getElementById('pet-name').innerText = pet.name;
        document.getElementById('pet-img').src = (pet.photos && pet.photos.length > 0) ? pet.photos[0] : 'imagens/Logo.webp';
        document.getElementById('pet-gender').innerText = pet.sex === 'MALE' ? 'Macho' : 'Fêmea';
        document.getElementById('pet-age').innerText = pet.age || "Não informada";
        document.getElementById('pet-size').innerText = pet.size;
        document.getElementById('pet-desc').innerText = pet.description;
        
        document.title = `Conheça o ${pet.name} - Apasbac`;

    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
}

async function enviarFormularioMonitoramento(dados) {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/monitoring`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Aqui vai o token de login
        },
        body: JSON.stringify(dados)
    });
}

// ============ ADAPTAÇÃO PARA MENU HAMBÚRGUER (CELULAR) ============

// ============ ADAPTAÇÃO PARA MENU HAMBÚRGUER (DROPDOWN) ============

function iniciarMenuHamburguer() {
    const mainHeader = document.querySelector('.main-header');
    const headerContainer = document.querySelector('.header-container');
    if (!mainHeader || !headerContainer) return;

    // Cria o botão hambúrguer dinamicamente se ele não existir
    if (!document.querySelector('.menu-toggle')) {
        const menuToggle = document.createElement('button');
        menuToggle.classList.add('menu-toggle');
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        menuToggle.setAttribute('aria-label', 'Abrir menu');

        headerContainer.appendChild(menuToggle);

        menuToggle.addEventListener('click', () => {
            const isOpen = mainHeader.classList.toggle('menu-open');
            
            // Alterna o ícone do botão
            if (isOpen) {
                menuToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            } else {
                menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
        });
    }
}

// Inicializador de carregamento
document.addEventListener('DOMContentLoaded', () => {
    checkAuth(); 
    carregarAnimaisDaAPI(); 
    iniciarMenuHamburguer(); 
});

// ============ ENVIO DO FORMULÁRIO DE VOLUNTÁRIOS VIA AJAX ============

function configurarEnvioFormulario() {
    const form = document.querySelector('.volunteer-form-modern');
    const container = document.querySelector('.form-container');
    if (!form || !container) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o navegador de recarregar ou redirecionar a página

        const submitBtn = form.querySelector('.submit-btn-modern');
        const originalBtnHtml = submitBtn.innerHTML;

        // Desativa o botão de envio para evitar cliques duplos e adiciona um spinner de carregamento
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Enviando...</span> <i class="fas fa-spinner fa-spin"></i>';

        const formData = new FormData(form);
        const actionUrl = form.getAttribute('action');

        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Substitui o formulário por um card de sucesso com animação suave
                container.innerHTML = `
                    <div class="success-container">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h2>Enviado com Sucesso!</h2>
                        <p>Agradecemos imensamente pelo seu interesse em ajudar a <strong>Apasbac</strong>. Recebemos sua inscrição de voluntário e entraremos em contato em breve através do e-mail ou telefone informados.</p>
                        <a href="index.html" class="success-back-btn">Voltar para o Início</a>
                    </div>
                `;
                // Rola a página suavemente até o topo da caixa de sucesso
                container.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                throw new Error('Falha no envio');
            }
        } catch (error) {
            alert('Ocorreu um erro ao enviar seu formulário. Por favor, verifique sua conexão e tente novamente.');
            
            // Restaura o estado do botão original em caso de falha
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    });
}

// Inicializador de carregamento consolidado
document.addEventListener('DOMContentLoaded', () => {
    checkAuth(); 
    carregarAnimaisDaAPI(); 
    iniciarMenuHamburguer(); 
    configurarEnvioFormulario(); // Ativa a interceptação de envio seguro do formulário
});

document.addEventListener('DOMContentLoaded', checkAuth);

