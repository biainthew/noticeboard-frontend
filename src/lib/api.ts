const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 토큰 관리
export const tokenStorage = {
    get: () => localStorage.getItem('accessToken'),
    set: (token: string) => localStorage.setItem('accessToken', token),
    remove: () => localStorage.removeItem('accessToken')
};

// Refresh Token 관리
export const refreshTokenStorage = {
    get: () => localStorage.getItem('refreshToken'),
    set: (token: string) => localStorage.setItem('refreshToken', token),
    remove: () => localStorage.removeItem('refreshToken'),
};

// 현재 유저 email 관리
export const userEmailStorage = {
    get: () => localStorage.getItem('userEmail'),
    set: (email: string) => localStorage.setItem('userEmail', email),
    remove: () => localStorage.removeItem('userEmail')
};

// 공통 fetch 함수
const fetchWithAuth = async (url: string, options: RequestInit = {}, retry = true) => {
    const token = tokenStorage.get();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers,
    });

    // 401이고 재시도 가능한 경우 토큰 갱신 후 재요청
    if (response.status === 401 && retry) {
        try {
            await authApi.refresh();
            return fetchWithAuth(url, options, false); // 재시도는 한 번만
        } catch {
            tokenStorage.remove();
            refreshTokenStorage.remove();
            window.location.href = '/'; // 로그인 화면으로 강제 이동
            throw new Error('세션이 만료됐습니다. 다시 로그인해 주세요.');
        }
    }

    if (response.status === 403) {
        tokenStorage.remove();
        refreshTokenStorage.remove();
        window.location.href = '/';
        throw new Error('접근 권한이 없습니다.');
    }

    if (!response.ok) {
        const error = await response.json();
        const firstError = error.errors ? Object.values(error.errors)[0] : null;
        throw new Error((firstError as string) || error.message || '요청에 실패했습니다.');
    }

    if (response.status === 204 ||
        response.headers.get('content-length') === '0') return null;

    return response.json();
};

// 타입 정의
export interface MemberInfo {
    id: number;
    email: string;
    nickname: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface PostSummary {
    id: number;
    title: string;
    nickname: string;
    viewCount: number;
    likeCount: number;
    liked: boolean;
    createdAt: string;
}

export interface PostDetail {
    id: number;
    title: string;
    content: string;
    nickname: string;
    email: string;
    viewCount: number;
    likeCount: number;
    liked: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CommentDetail {
    id: number;
    content: string;
    nickname: string;
    email: string;
    parentId: number | null;
    children: CommentDetail[];
    createdAt: string;
    updatedAt: string;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

export interface NotificationDetail {
    id: number;
    senderNickname: string;
    type: string;
    postId: number;
    postTitle: string | null;
    commentContent: string | null;
    isRead: boolean;
    createdAt: string;
}

// Auth API
export const authApi = {
    signUp: (email: string, password: string, nickname: string) =>
        fetchWithAuth('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({email, password, nickname}),
        }) as Promise<MemberInfo>,

    login: async (email: string, password: string) => {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            const firstError = error.errors ? Object.values(error.errors)[0] : null;
            throw new Error((firstError as string) || error.message || '로그인에 실패했습니다.');
        }

        const data: TokenResponse = await response.json();
        tokenStorage.set(data.accessToken);
        refreshTokenStorage.set(data.refreshToken);
        return data;
    },

    logout: () => tokenStorage.remove(),

    refresh: async () => {
        const refreshToken = refreshTokenStorage.get();
        if (!refreshToken) throw new Error('Refresh Token이 없습니다.');

        const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            tokenStorage.remove();
            refreshTokenStorage.remove();
            throw new Error('토큰 갱신에 실패했습니다.');
        }

        const data = await response.json();
        tokenStorage.set(data.accessToken);
        return data.accessToken;
    },
}

// Post API
export const postApi = {
    getList: (page = 0, size = 10) =>
        fetchWithAuth(`/api/posts?page=${page}&size=${size}`) as Promise<PageResponse<PostSummary>>,

    getDetail: (postId: number) =>
        fetchWithAuth(`/api/posts/${postId}`) as Promise<PostDetail>,

    create: (title: string, content: string) =>
        fetchWithAuth('/api/posts', {
            method: 'POST',
            body: JSON.stringify({title, content}),
        }) as Promise<PostDetail>,

    update: (postId: number, title: string, content: string) =>
        fetchWithAuth(`/api/posts/${postId}`, {
            method: 'PUT',
            body: JSON.stringify({title, content}),
        }) as Promise<PostDetail>,

    delete: (postId: number) =>
        fetchWithAuth(`/api/posts/${postId}`, {method: 'DELETE'}),
};

// Comment API
export const commentApi = {
    getList: (postId: number) =>
        fetchWithAuth(`/api/posts/${postId}/comments`) as Promise<CommentDetail[]>,

    create: (postId: number, content: string, parentId?: number) =>
        fetchWithAuth(`/api/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({content, parentId}),
        }) as Promise<CommentDetail>,

    update: (postId: number, commentId: number, content: string) =>
        fetchWithAuth(`/api/posts/${postId}/comments/${commentId}`, {
            method: 'PUT',
            body: JSON.stringify({content}),
        }) as Promise<CommentDetail>,

    delete: (postId: number, commentId: number) =>
        fetchWithAuth(`/api/posts/${postId}/comments/${commentId}`, {method: 'DELETE'}),
};

// Like API
export const likeApi = {
    like: (postId: number) =>
        fetchWithAuth(`/api/posts/${postId}/likes`, {method: 'POST'}),

    unlike: (postId: number) =>
        fetchWithAuth(`/api/posts/${postId}/likes`, {method: 'DELETE'}),
};

// Notification API
export const notificationApi = {
    getList: () =>
        fetchWithAuth('/api/notifications') as Promise<NotificationDetail[]>,

    getUnreadCount: () =>
        fetchWithAuth('/api/notifications/unread-count') as Promise<number>,

    readAll: () =>
        fetchWithAuth('/api/notifications/read-all', {method: 'PATCH'}),
};

// Image API
export const imageApi = {
    upload: async (file: File) => {
        const token = tokenStorage.get();
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${BASE_URL}/api/images`, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`},
            body: formData,
        });

        if (!response.ok) {
            const msg = await response.text().catch(() => response.statusText);
            throw new Error(`[${response.status}] ${msg}`);
        }
        return response.text();
    },
};