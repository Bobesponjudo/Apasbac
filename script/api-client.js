/**
 * Cliente de Integração com a API REST da APASBAC (Versão com Fallback e Decodificador JWT)
 */
window.API_BASE_URL = window.API_BASE_URL || 'https://apasbac-api.vercel.app';
var API_BASE_URL = window.API_BASE_URL;

// Função auxiliar para decodificar o Payload do JWT sem bibliotecas externas
function parseJwt(token) {
    try {
        if (!token) return null;
        const clean = token.startsWith('Bearer ') ? token.slice(7) : token;
        const base64Url = clean.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

const api = {
    getToken() {
        return localStorage.getItem('apasbac_access_token');
    },

    getRefreshToken() {
        return localStorage.getItem('apasbac_refresh_token');
    },

    setSession(tokens, user) {
        if (!tokens) return;

        const access = tokens.accessToken ||
            tokens.access_token ||
            tokens.token ||
            (tokens.tokens && (tokens.tokens.accessToken || tokens.tokens.token)) ||
            (tokens.data && (tokens.data.accessToken || tokens.data.token));

        const refresh = tokens.refreshToken ||
            tokens.refresh_token ||
            (tokens.tokens && tokens.tokens.refreshToken) ||
            (tokens.data && tokens.data.refreshToken);

        if (access) {
            const cleanToken = access.startsWith('Bearer ') ? access.slice(7) : access;
            localStorage.setItem('apasbac_access_token', cleanToken);

            if (!user) {
                user = tokens.user || (tokens.data && tokens.data.user);
                if (!user) {
                    const decoded = parseJwt(cleanToken);
                    if (decoded) {
                        user = {
                            id: decoded.sub || decoded.id,
                            email: decoded.email,
                            fullName: decoded.fullName || decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'Usuário'),
                            // FORÇA ADMIN SE FOR O EMAIL OFICIAL
                            role: (decoded.email === 'apasbac.assis@gmail.com') ? 'ADMIN' : (decoded.role || 'USER')
                        };
                    }
                }
            }
        }

        // Garante que o objeto user salvo também tenha a role de admin se for o e-mail oficial
        if (user && user.email === 'apasbac.assis@gmail.com') {
            user.role = 'ADMIN';
        }

        if (refresh) localStorage.setItem('apasbac_refresh_token', refresh);
        if (user) localStorage.setItem('apasbac_user', JSON.stringify(user));
    },

    clearSession() {
        localStorage.removeItem('apasbac_access_token');
        localStorage.removeItem('apasbac_refresh_token');
        localStorage.removeItem('apasbac_user');
        localStorage.removeItem('usuario_logado_email');
        localStorage.removeItem('usuario_logado_nome');
    },

    getUser() {
        const data = localStorage.getItem('apasbac_user');
        return data ? JSON.parse(data) : null;
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        options.headers = options.headers || {};

        const token = this.getToken();
        if (token && !options.headers['Authorization']) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (!(options.body instanceof FormData) && !options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
        }

        let response = await fetch(url, options);

        if (response.status === 401 && this.getRefreshToken() && !endpoint.includes('/auth/')) {
            const renewed = await this.refreshToken();
            if (renewed) {
                options.headers['Authorization'] = `Bearer ${this.getToken()}`;
                response = await fetch(url, options);
            }
        }

        let data = null;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            const errorMsg = (data && (data.message || data.error)) || `Erro HTTP ${response.status}`;
            throw new Error(Array.isArray(errorMsg) ? errorMsg.join(' | ') : errorMsg);
        }

        return data;
    },

    async refreshToken() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.getRefreshToken() })
            });

            if (!res.ok) return false;
            const data = await res.json();
            const newAccess = data.accessToken || data.access_token;
            if (newAccess) {
                localStorage.setItem('apasbac_access_token', newAccess);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    },

    async register(userData) {
        return this.request('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async login(email, password) {
        const res = await this.request('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        this.setSession(res);

        let user = this.getUser();
        try {
            const me = await this.getMe();
            if (me) {
                user = me;
                this.setSession(res, user);
            }
        } catch (err) {
            console.warn('Endpoint /users/me não respondeu, usando dados do token:', err.message);
        }

        if (!user) {
            user = { email: email, role: 'USER' };
            this.setSession(res, user);
        }

        return { tokens: res, user };
    },

    async logout() {
        try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
                await this.request('/api/v1/auth/logout', {
                    method: 'POST',
                    body: JSON.stringify({ refreshToken })
                });
            }
        } catch (e) {
            console.warn('Erro ao deslogar na API:', e);
        } finally {
            this.clearSession();
            window.location.href = 'entrar.html';
        }
    },

    async getMe() {
        return this.request('/api/v1/users/me', { method: 'GET' });
    },

    async getAnimals(params = {}) {
        const query = new URLSearchParams();
        if (params.isAdopted !== undefined) query.append('isAdopted', params.isAdopted);
        if (params.limit) query.append('limit', params.limit);
        if (params.page) query.append('page', params.page);

        const qs = query.toString() ? `?${query.toString()}` : '';
        return this.request(`/api/v1/animals${qs}`, { method: 'GET' });
    },

    async getAnimalPublic(idOrUuid) {
        if (!isNaN(idOrUuid)) {
            return this.request(`/api/v1/animals/public/${idOrUuid}`, { method: 'GET' });
        }
        return this.request(`/api/v1/animals/public/uuid/${idOrUuid}`, { method: 'GET' });
    },

    async createAnimal(animalData) {
        return this.request('/api/v1/animals', {
            method: 'POST',
            body: JSON.stringify(animalData)
        });
    },

    async updateAnimal(id, updateData) {
        return this.request(`/api/v1/animals/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updateData)
        });
    },

    async deleteAnimal(id) {
        return this.request(`/api/v1/animals/${id}`, { method: 'DELETE' });
    }
};

// Renderização automática do Menu do Cabeçalho
document.addEventListener('DOMContentLoaded', () => {
    const user = api.getUser();
    const userActions = document.querySelector('.user-actions');

    if (user && userActions) {
        const email = (user.email || localStorage.getItem('usuario_logado_email') || '').toLowerCase();
        const role = (user.role || '').toUpperCase();
        const isAdmin = email === 'apasbac.assis@gmail.com' || role === 'ADMIN' || role === 'STAFF';

        const primeiroNome = user.fullName ? user.fullName.split(' ')[0] : 'Admin';

        const linkAdmin = isAdmin
            ? '<a href="admin.html" style="background: var(--accent); color: var(--primary-dark) !important; font-weight: 700; margin-right: 6px;"><i class="fa-solid fa-lock"></i> Painel</a>'
            : '';

        userActions.innerHTML = `
            ${linkAdmin}
            <span style="font-size: 0.88rem; font-weight: 600; color: var(--primary); padding: 0 5px;">
                Olá, ${primeiroNome}
            </span>
            <a href="#" id="btnHeaderLogout" style="background: #7a1515;"><i class="fa-solid fa-right-from-bracket"></i> Sair</a>
        `;

        document.getElementById('btnHeaderLogout')?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (typeof db !== 'undefined') {
                try { await db.auth.signOut(); } catch (err) { }
            }
            api.logout();
        });
    }
});