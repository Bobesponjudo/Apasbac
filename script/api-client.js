window.API_BASE_URL = window.API_BASE_URL || 'https://apasbac-api.vercel.app';
var API_BASE_URL = window.API_BASE_URL.replace(/\/$/, '');
const API_ROOT = `${API_BASE_URL}/api/v1`;
const ACCESS_TOKEN_KEY = 'apasbac_access_token';
const REFRESH_TOKEN_KEY = 'apasbac_refresh_token';
const USER_KEY = 'apasbac_user';
const legacyAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
const legacyRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
if (legacyRefreshToken && !sessionStorage.getItem(REFRESH_TOKEN_KEY)) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, legacyRefreshToken);
}
localStorage.removeItem(ACCESS_TOKEN_KEY);
localStorage.removeItem(REFRESH_TOKEN_KEY);
localStorage.removeItem(USER_KEY);
localStorage.removeItem('accessToken');
localStorage.removeItem('usuario_logado_email');
localStorage.removeItem('usuario_logado_nome');
localStorage.removeItem('usuario_logado_telefone');
localStorage.removeItem('usuario_logado_cpf');

class ApasbacApiError extends Error {
    constructor(status, message, requestId, retryAfter) {
        super(Array.isArray(message) ? message.join('; ') : message || `Erro HTTP ${status}`);
        this.name = 'ApasbacApiError';
        this.status = status;
        this.requestId = requestId;
        this.retryAfter = retryAfter;
    }
}

const api = {
    accessToken: legacyAccessToken,
    refreshing: null,

    getToken() {
        return this.accessToken;
    },

    getRefreshToken() {
        return sessionStorage.getItem(REFRESH_TOKEN_KEY);
    },

    getUser() {
        const user = sessionStorage.getItem(USER_KEY);
        if (!user) return null;

        try {
            return JSON.parse(user);
        } catch (error) {
            sessionStorage.removeItem(USER_KEY);
            return null;
        }
    },

    setSession(tokens, user) {
        const accessToken = tokens?.accessToken;
        const refreshToken = tokens?.refreshToken;
        if (!accessToken || !refreshToken) {
            throw new Error('A API não retornou os tokens de sessão esperados.');
        }

        this.accessToken = accessToken;
        sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    setUser(user) {
        if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    clearSession() {
        this.accessToken = null;
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('usuario_logado_email');
        localStorage.removeItem('usuario_logado_nome');
        localStorage.removeItem('usuario_logado_telefone');
        localStorage.removeItem('usuario_logado_cpf');
    },

    isAuthenticated() {
        return !!(this.accessToken || this.getRefreshToken());
    },

    async refreshToken() {
        if (this.refreshing) return this.refreshing;

        this.refreshing = (async () => {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) return false;

            try {
                const response = await fetch(`${API_ROOT}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                    signal: AbortSignal.timeout(15000)
                });
                const result = await response.json();

                if (response.status === 401) {
                    this.clearSession();
                    return false;
                }
                if (!response.ok) {
                    throw new ApasbacApiError(
                        response.status,
                        result.message,
                        result.requestId,
                        response.headers.get('Retry-After')
                    );
                }

                this.setSession(result.data, this.getUser());
                return true;
            } catch (error) {
                if (error instanceof ApasbacApiError) throw error;
                throw new Error(`Não foi possível renovar a sessão: ${error.message}`);
            } finally {
                this.refreshing = null;
            }
        })();

        return this.refreshing;
    },

    async request(endpoint, { method = 'GET', body, auth = false, retried = false, headers = {}, signal } = {}) {
        if (auth && !this.accessToken && !(await this.refreshToken())) {
            throw new ApasbacApiError(401, 'Sua sessão expirou. Entre novamente.');
        }

        const requestHeaders = { ...headers };
        if (body !== undefined && !(body instanceof FormData) && !requestHeaders['Content-Type']) {
            requestHeaders['Content-Type'] = 'application/json';
        }
        if (auth && this.accessToken) {
            requestHeaders.Authorization = `Bearer ${this.accessToken}`;
        }

        const response = await fetch(`${API_ROOT}${endpoint}`, {
            method,
            headers: requestHeaders,
            body: body === undefined || body instanceof FormData
                ? body
                : JSON.stringify(body),
            signal: signal || AbortSignal.timeout(15000)
        });

        if (response.status === 401 && auth && !retried) {
            if (await this.refreshToken()) {
                return this.request(endpoint, { method, body, auth, retried: true, headers, signal });
            }
            this.clearSession();
        }
        if (response.status === 204) return undefined;

        let result;
        try {
            result = await response.json();
        } catch (error) {
            if (!response.ok) {
                throw new ApasbacApiError(response.status, 'A API retornou uma resposta inválida.');
            }
            throw new Error('A API retornou uma resposta inválida.');
        }

        if (!response.ok) {
            throw new ApasbacApiError(
                response.status,
                result.message || result.error,
                result.requestId,
                response.headers.get('Retry-After')
            );
        }
        return result.data;
    },

    getList(result) {
        if (Array.isArray(result)) return result;
        if (Array.isArray(result?.data)) return result.data;
        return [];
    },

    async register(userData) {
        return this.request('/auth/register', { method: 'POST', body: userData });
    },

    async login(email, password) {
        const tokens = await this.request('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        this.setSession(tokens);

        try {
            const user = await this.getMe();
            this.setUser(user);
            return { tokens, user };
        } catch (error) {
            this.clearSession();
            throw error;
        }
    },

    async forgotPassword(email) {
        return this.request('/auth/forgot-password', {
            method: 'POST',
            body: { email }
        });
    },

    async resetPassword(token, password, confirmPassword) {
        return this.request('/auth/reset-password', {
            method: 'POST',
            body: { token, password, confirmPassword }
        });
    },

    async logout(redirect = true) {
        // A API exige Bearer token no logout. Se der qualquer erro, a sessão local
        // é encerrada do mesmo jeito, sem mostrar aviso ao usuário.
        try {
            if (this.isAuthenticated()) {
                if (!this.accessToken) await this.refreshToken();
                const refreshToken = this.getRefreshToken();
                if (this.accessToken) {
                    await this.request('/auth/logout', {
                        method: 'POST',
                        body: refreshToken ? { refreshToken } : {},
                        auth: true
                    });
                }
            }
        } catch (error) {
            console.warn('Logout na API não confirmado (sessão local encerrada):', error.message);
        } finally {
            this.clearSession();
            if (redirect) window.location.href = 'entrar.html';
        }
    },

    async getMe() {
        return this.request('/users/me', { auth: true });
    },

    async updateUser(id, userData) {
        return this.request(`/users/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: userData,
            auth: true
        });
    },

    async getAnimals(params = {}) {
        const query = new URLSearchParams();
        if (params.isAdopted !== undefined) query.set('isAdopted', params.isAdopted);
        if (params.limit) query.set('limit', params.limit);
        if (params.page) query.set('page', params.page);
        const queryString = query.toString();
        return this.request(`/animals${queryString ? `?${queryString}` : ''}`);
    },

    async getAnimalPublic(idOrUuid) {
        const path = /^\d+$/.test(String(idOrUuid))
            ? `/animals/public/${encodeURIComponent(idOrUuid)}`
            : `/animals/public/uuid/${encodeURIComponent(idOrUuid)}`;
        return this.request(path);
    },

    async createAnimal(animalData) {
        return this.request('/animals', { method: 'POST', body: animalData, auth: true });
    },

    async updateAnimal(id, updateData) {
        return this.request(`/animals/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: updateData,
            auth: true
        });
    },

    async deleteAnimal(id) {
        return this.request(`/animals/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
    },

    async getEvents(params = {}, admin = false) {
        const query = new URLSearchParams();
        if (params.limit) query.set('limit', params.limit);
        if (params.page) query.set('page', params.page);
        const endpoint = admin ? '/admin/events' : '/events';
        const queryString = query.toString();
        return this.request(`${endpoint}${queryString ? `?${queryString}` : ''}`, { auth: admin });
    },

    async getEventCategories() {
        return this.request('/events/categories');
    },

    async createEvent(eventData) {
        return this.request('/events', { method: 'POST', body: eventData, auth: true });
    },

    async updateEvent(id, eventData) {
        return this.request(`/events/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: eventData,
            auth: true
        });
    },

    async deleteEvent(id) {
        return this.request(`/events/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
    }
};

window.api = api;
window.ApasbacApiError = ApasbacApiError;

document.addEventListener('DOMContentLoaded', () => {
    const renderUserActions = (user) => {
        const userActions = document.querySelector('.user-actions');
        if (!userActions) return;
        userActions.replaceChildren();

        if (['ADMIN', 'STAFF'].includes((user.role || '').toUpperCase())) {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.style.cssText = 'background: var(--accent); color: var(--primary-dark) !important; font-weight: 700; margin-right: 6px;';
            adminLink.innerHTML = '<i class="fa-solid fa-lock"></i> Painel';
            userActions.appendChild(adminLink);
        }

        const greeting = document.createElement('span');
        greeting.style.cssText = 'font-size: 0.88rem; font-weight: 600; color: var(--primary); padding: 0 5px;';
        greeting.textContent = `Olá, ${user.fullName ? user.fullName.split(' ')[0] : 'Usuário'}`;
        userActions.appendChild(greeting);

        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.id = 'btnHeaderLogout';
        logoutLink.style.background = '#7a1515';
        logoutLink.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Sair';
        userActions.appendChild(logoutLink);
    };

    const initializeHeader = async () => {
        let user = api.getUser();
        if (!user && api.isAuthenticated()) {
            try {
                user = await api.getMe();
                api.setUser(user);
            } catch (error) {
                console.error('Não foi possível validar a sessão da API:', error);
                return;
            }
        }
        if (!user) return;
        renderUserActions(user);

        document.getElementById('btnHeaderLogout')?.addEventListener('click', async (event) => {
        event.preventDefault();
        try {
            await api.logout();
        } catch (error) {
            alert(`Não foi possível encerrar a sessão: ${error.message}`);
        }
        });
    };

    initializeHeader();
});