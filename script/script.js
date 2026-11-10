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

// ============ BANCO DE DADOS DOS PETS ESTÁTICOS ============
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
        const animals = api.getList(await api.getAnimals({ isAdopted: false, limit: 12 }));
        const container = document.querySelector('.container-pets');
        if (!container) return;
        container.innerHTML = animals.length
            ? ""
            : "<p style='grid-column: 1/-1; text-align: center;'>Nenhum animal disponível no momento.</p>";

        animals.forEach(pet => {
            container.innerHTML += `
                <div class="card-pet">
                    <img src="${pet.photos?.[0] || 'imagens/Logo.webp'}" alt="${pet.name}">
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
        const animais = api.getList(await api.getAnimals({ isAdopted: false, limit: 12 }));
        if (animais.length === 0) {
            container.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Nenhum animal disponível no momento.</p>";
            return;
        }

        container.innerHTML = '';
        animais.forEach(pet => {
            const genero = pet.sex === 'MALE' ? 'Macho' : 'Fêmea';
            const foto = pet.photos?.[0] || 'imagens/Logo.webp';

            const card = `
                <div class="card-pet">
                    <img src="${foto}" alt="${pet.name}" onerror="this.src='imagens/Logo.webp'">
                    <div class="info-pet">
                        <h2>${pet.name}</h2>
                        <p><strong>Gênero:</strong> ${genero}</p>
                        <p><strong>Raça:</strong> ${pet.breed || 'SRD'}</p>
                        <a href="maisinformacoes.html?id=${pet.id}">
                            <button><strong>Mais informações</strong></button>
                        </a>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    } catch (error) {
        console.error("Erro ao carregar animais:", error);
        container.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--primary);'>Não foi possível carregar os animais.</p>";
    }
}

async function carregarDadosDoPet() {
    const params = new URLSearchParams(window.location.search);
    const petId = params.get('id');

    if (!petId) return;

    try {
        const pet = await api.getAnimalPublic(petId);
        const nomeEl = document.getElementById('pet-name');
        if (nomeEl) nomeEl.innerText = pet.name;
        
        const imgEl = document.getElementById('pet-img');
        if (imgEl) imgEl.src = (pet.photos && pet.photos.length > 0) ? pet.photos[0] : 'imagens/Logo.webp';
        
        const genEl = document.getElementById('pet-gender');
        if (genEl) genEl.innerText = pet.sex === 'MALE' ? 'Macho' : 'Fêmea';
        
        const ageEl = document.getElementById('pet-age');
        const ageInDescription = pet.description?.match(/(?:^|\|\s*)Idade:\s*([^|]+)/i)?.[1]?.trim();
        if (ageEl) ageEl.innerText = pet.age || ageInDescription || "Não informada";
        
        const sizeEl = document.getElementById('pet-size');
        if (sizeEl) sizeEl.innerText = pet.size;
        
        const descEl = document.getElementById('pet-desc');
        if (descEl) descEl.innerText = pet.description;
        
        document.title = `Conheça o ${pet.name} - Apasbac`;
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
}

async function enviarFormularioMonitoramento(dados) {
    return api.request('/monitoring', { method: 'POST', body: dados, auth: true });
}

// ============ MENU HAMBÚRGUER (MOBILE) ============
function iniciarMenuHamburguer() {
    const mainHeader = document.querySelector('.main-header');
    const headerContainer = document.querySelector('.header-container');
    if (!mainHeader || !headerContainer) return;

    if (!document.querySelector('.menu-toggle')) {
        const menuToggle = document.createElement('button');
        menuToggle.classList.add('menu-toggle');
        menuToggle.type = 'button';
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        menuToggle.setAttribute('aria-label', 'Abrir menu');
        menuToggle.setAttribute('aria-expanded', 'false');

        headerContainer.appendChild(menuToggle);

        menuToggle.addEventListener('click', () => {
            const isOpen = mainHeader.classList.toggle('menu-open');
            menuToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
            menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }
}

// ============ ENVIO DO FORMULÁRIO DE VOLUNTÁRIOS ============
function configurarEnvioFormulario() {
    const form = document.querySelector('.volunteer-form-modern');
    const container = document.querySelector('.form-container');
    if (!form || !container) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.submit-btn-modern');
        const originalBtnHtml = submitBtn.innerHTML;

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
                container.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                throw new Error('Falha no envio');
            }
        } catch (error) {
            alert('Ocorreu um erro ao enviar seu formulário. Por favor, verifique sua conexão e tente novamente.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    });
}

// ==========================================================================
// GERENCIADOR DE PERFIL DO USUÁRIO LOGADO (MINHA CONTA + BOTÃO DO ADMIN)
// ==========================================================================
function iniciarGerenciadorPerfil() {
    const user = typeof api !== 'undefined' ? api.getUser() : null;
    const emailLogado = user?.email;
    const userActions = document.querySelector('.user-actions');

    if (!userActions || !emailLogado) return;

    const nomeCompleto = user.fullName || emailLogado.split('@')[0];
    const primeiroNome = nomeCompleto.split(' ')[0];

    const emailLower = emailLogado.toLowerCase();
    const role = user.role ? user.role.toUpperCase() : '';
    const isAdmin = role === 'ADMIN' || role === 'STAFF';

    const btnPainel = isAdmin
        ? `<a href="admin.html" style="background: var(--accent); color: var(--primary-dark) !important; font-weight: 700; margin-right: 6px;"><i class="fa-solid fa-lock"></i> Painel</a>`
        : '';

    // Renderiza ambos: o botão do Painel (se for admin) e o botão "Minha Conta"
    userActions.innerHTML = `
        ${btnPainel}
        <button type="button" id="btnAbrirPerfil" class="btn-user-profile" title="Minha Conta">
            <i class="fa-solid fa-circle-user"></i>
            <span>Olá, ${primeiroNome}</span>
        </button>
    `;

    criarModalPerfil();

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

    document.getElementById('btnFecharPerfil')?.addEventListener('click', fecharModalPerfil);
    document.getElementById('modalMeuPerfil')?.addEventListener('click', (e) => {
        if (e.target.id === 'modalMeuPerfil') fecharModalPerfil();
    });
    document.getElementById('btnSairConta')?.addEventListener('click', deslogarUsuario);
    document.getElementById('formMeuPerfil')?.addEventListener('submit', salvarAlteracoesPerfil);
}

async function abrirModalPerfil() {
    const modal = document.getElementById('modalMeuPerfil');
    if (!modal) return;

    let user = api.getUser();
    document.getElementById('perfil_nome').value = user?.fullName || "";
    document.getElementById('perfil_telefone').value = user?.phone || "";
    document.getElementById('perfil_email').value = user?.email || "";
    document.getElementById('perfil_cpf').value = user?.cpf || "Não informado";

    const adminContainer = document.getElementById('adminLinkContainer');
    if (adminContainer) {
        adminContainer.style.display = ['ADMIN', 'STAFF'].includes(user?.role?.toUpperCase()) ? 'block' : 'none';
    }

    modal.style.display = 'flex';

    try {
        user = await api.getMe();
        api.setUser(user);
        document.getElementById('perfil_nome').value = user.fullName || "";
        document.getElementById('perfil_telefone').value = user.phone || "";
        document.getElementById('perfil_email').value = user.email || "";
        document.getElementById('perfil_cpf').value = user.cpf || "Não informado";
    } catch (error) {
        alert(`Não foi possível carregar os dados atuais do perfil: ${error.message}`);
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
        const user = api.getUser() || await api.getMe();
        const updatedUser = await api.updateUser(user.id, {
            fullName: novoNome,
            phone: novoTelefone
        });
        api.setUser(updatedUser || { ...user, fullName: novoNome, phone: novoTelefone });

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
        try {
            await api.logout(false);
        } catch (error) {
            alert(`A sessão foi encerrada neste dispositivo, mas a API não confirmou o logout: ${error.message}`);
        }
        window.location.href = 'index.html';
    }
}

// Inicializador de carregamento
document.addEventListener('DOMContentLoaded', () => {
    iniciarMenuHamburguer(); 
    configurarEnvioFormulario();
    iniciarGerenciadorPerfil();
});