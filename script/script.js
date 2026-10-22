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

// ==========================================================================
// NOVO: GERENCIADOR DE PERFIL DO USUÁRIO LOGADO (APASBAC)
// ==========================================================================
const EMAIL_ADMIN_OFICIAL = "apasbac.assis@gmail.com";

function iniciarGerenciadorPerfil() {
    const emailLogado = localStorage.getItem("usuario_logado_email");
    const userActions = document.querySelector('.user-actions');

    if (!userActions || !emailLogado) return;

    // 1. Pega o primeiro nome para exibir no botão
    const nomeCompleto = localStorage.getItem("usuario_logado_nome") || emailLogado.split('@')[0];
    const primeiroNome = nomeCompleto.split(' ')[0];

    // 2. Substitui "Entrar" e "Cadastre-se" pelo ícone de usuário
    userActions.innerHTML = `
        <button type="button" id="btnAbrirPerfil" class="btn-user-profile" title="Minha Conta">
            <i class="fa-solid fa-circle-user"></i>
            <span>Olá, ${primeiroNome}</span>
        </button>
    `;

    // 3. Injeta a janelinha (Modal) de Perfil
    criarModalPerfil();

    // 4. Adiciona o clique para abrir o modal
    const btnPerfil = document.getElementById('btnAbrirPerfil');
    if (btnPerfil) {
        btnPerfil.addEventListener('click', abrirModalPerfil);
    }
}

function criarModalPerfil() {
    if (document.getElementById('modalMeuPerfil')) return;

    const modalHtml = `
        <div id="modalMeuPerfil" class="modal-overlay" style="display: none;">
            <div class="modal-box" style="max-width: 480px; background: #fffcf7; border: 1.5px solid var(--border); border-radius: 20px; padding: 30px; box-shadow: var(--shadow-lg); position: relative;">
                <button type="button" class="modal-close" id="btnFecharPerfil" style="position: absolute; top: 16px; right: 20px; font-size: 1.8rem; border: none; background: none; cursor: pointer; color: var(--text-light);">&times;</button>
                
                <div style="text-align: center; margin-bottom: 22px;">
                    <div style="width: 72px; height: 72px; border-radius: 50%; background: #fff1cf; color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 2.4rem; margin: 0 auto 12px; border: 2px solid var(--border);">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <h2 style="font-family: 'Playfair Display', serif; color: var(--primary); font-size: 1.55rem; margin-bottom: 4px;">Minha Conta</h2>
                    <p style="font-size: 0.85rem; color: var(--text-light); margin: 0;">Gerencie suas informações cadastrais</p>
                </div>

                <form id="formMeuPerfil">
                    <div class="input-group" style="margin-bottom: 15px;">
                        <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-mid); display: block; margin-bottom: 6px;">
                            <i class="fa-solid fa-pen" style="color: var(--accent); font-size: 0.8rem;"></i> Nome Completo (Editável)
                        </label>
                        <input type="text" id="perfil_nome" required style="width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 8px; background: white; font-family: inherit; font-size: 0.9rem;">
                    </div>

                    <div class="input-group" style="margin-bottom: 15px;">
                        <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-mid); display: block; margin-bottom: 6px;">
                            <i class="fa-solid fa-phone" style="color: var(--accent); font-size: 0.8rem;"></i> Telefone / WhatsApp (Editável)
                        </label>
                        <input type="tel" id="perfil_telefone" required style="width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 8px; background: white; font-family: inherit; font-size: 0.9rem;">
                    </div>

                    <div class="input-group" style="margin-bottom: 15px;">
                        <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-light); display: block; margin-bottom: 6px;">
                            <i class="fa-solid fa-lock" style="font-size: 0.8rem;"></i> E-mail (Fixo)
                        </label>
                        <input type="email" id="perfil_email" disabled readonly style="width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 8px; background: #eee4d5; color: #666; font-family: inherit; font-size: 0.9rem; cursor: not-allowed;">
                    </div>

                    <div class="input-group" style="margin-bottom: 20px;">
                        <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-light); display: block; margin-bottom: 6px;">
                            <i class="fa-solid fa-lock" style="font-size: 0.8rem;"></i> CPF (Não pode ser alterado)
                        </label>
                        <input type="text" id="perfil_cpf" disabled readonly style="width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 8px; background: #eee4d5; color: #666; font-family: inherit; font-size: 0.9rem; cursor: not-allowed;">
                        <small style="color: var(--text-light); font-size: 0.75rem; display: block; margin-top: 4px;">O CPF e o e-mail são dados de segurança da conta e não podem ser alterados.</small>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button type="submit" id="btnSalvarPerfil" class="submit-btn-modern" style="padding: 13px; font-size: 0.95rem; border-radius: 999px;">
                            <i class="fa-solid fa-floppy-disk"></i> Salvar Alterações
                        </button>

                        <div id="adminLinkContainer" style="display: none;">
                            <a href="admin.html" class="action-btn secondary" style="display: block; text-align: center; padding: 11px; font-size: 0.9rem; border-color: var(--accent); color: var(--primary); text-decoration: none; border-radius: 999px;">
                                <i class="fa-solid fa-shield-halved"></i> Acessar Painel do Administrador
                            </a>
                        </div>

                        <button type="button" id="btnSairConta" style="background: #a92222; color: white; border: none; padding: 12px; border-radius: 999px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="fa-solid fa-right-from-bracket"></i> Sair da Conta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('btnFecharPerfil').addEventListener('click', fecharModalPerfil);
    document.getElementById('modalMeuPerfil').addEventListener('click', (e) => {
        if (e.target.id === 'modalMeuPerfil') fecharModalPerfil();
    });
    document.getElementById('btnSairConta').addEventListener('click', deslogarUsuario);
    document.getElementById('formMeuPerfil').addEventListener('submit', salvarAlteracoesPerfil);
}

async function abrirModalPerfil() {
    const modal = document.getElementById('modalMeuPerfil');
    if (!modal) return;

    document.getElementById('perfil_nome').value = localStorage.getItem("usuario_logado_nome") || "";
    document.getElementById('perfil_telefone').value = localStorage.getItem("usuario_logado_telefone") || "";
    document.getElementById('perfil_email').value = localStorage.getItem("usuario_logado_email") || "";
    document.getElementById('perfil_cpf').value = localStorage.getItem("usuario_logado_cpf") || "Não informado";

    const email = localStorage.getItem("usuario_logado_email") || "";
    const adminContainer = document.getElementById('adminLinkContainer');
    if (adminContainer) {
        adminContainer.style.display = (email.toLowerCase() === EMAIL_ADMIN_OFICIAL.toLowerCase()) ? 'block' : 'none';
    }

    modal.style.display = 'flex';

    if (typeof db !== 'undefined') {
        try {
            const { data: { user } } = await db.auth.getUser();
            if (user && user.user_metadata) {
                const meta = user.user_metadata;
                if (meta.full_name) {
                    document.getElementById('perfil_nome').value = meta.full_name;
                    localStorage.setItem("usuario_logado_nome", meta.full_name);
                }
                if (meta.phone) {
                    document.getElementById('perfil_telefone').value = meta.phone;
                    localStorage.setItem("usuario_logado_telefone", meta.phone);
                }
                if (meta.cpf) {
                    document.getElementById('perfil_cpf').value = meta.cpf;
                    localStorage.setItem("usuario_logado_cpf", meta.cpf);
                }
            }
        } catch (e) {}
    }
}

function fecharModalPerfil() {
    const modal = document.getElementById('modalMeuPerfil');
    if (modal) modal.style.display = 'none';
}

async function salvarAlteracoesPerfil(e) {
    e.preventDefault();

    const btnSalvar = document.getElementById('btnSalvarPerfil');
    const originalHtml = btnSalvar.innerHTML;
    btnSalvar.disabled = true;
    btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

    const novoNome = document.getElementById('perfil_nome').value.trim();
    const novoTelefone = document.getElementById('perfil_telefone').value.trim();

    try {
        if (typeof db !== 'undefined') {
            const { error } = await db.auth.updateUser({
                data: {
                    full_name: novoNome,
                    phone: novoTelefone
                }
            });
            if (error) throw error;
        }

        localStorage.setItem("usuario_logado_nome", novoNome);
        localStorage.setItem("usuario_logado_telefone", novoTelefone);

        const spanNome = document.querySelector('#btnAbrirPerfil span');
        if (spanNome) {
            spanNome.innerText = `Olá, ${novoNome.split(' ')[0]}`;
        }

        alert("Seus dados foram atualizados com sucesso!");
        fecharModalPerfil();
    } catch (err) {
        alert("Erro ao atualizar dados: " + err.message);
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = originalHtml;
    }
}

async function deslogarUsuario() {
    if (confirm("Deseja realmente sair da sua conta?")) {
        if (typeof db !== 'undefined') {
            try {
                await db.auth.signOut();
            } catch (e) {}
        }

        localStorage.removeItem("usuario_logado_email");
        localStorage.removeItem("usuario_logado_nome");
        localStorage.removeItem("usuario_logado_telefone");
        localStorage.removeItem("usuario_logado_cpf");

        window.location.reload();
    }
}

// Inicia o perfil assim que carregar a página
document.addEventListener('DOMContentLoaded', iniciarGerenciadorPerfil);
