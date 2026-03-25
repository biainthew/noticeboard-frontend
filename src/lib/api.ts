const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 토큰 관리
export const tokenStorage = {
    get: () => localStorage.getItem('accessToken'),
    set: (token: string) => localStorage.setItem('accessToken', token),
    remove: () => localStorage.removeItem('accessToken')
};

// 현재 유저 email 관리
export const userEmailStorage = {
    get: () => localStorage.getItem('userEmail'),
    set: (email: string) => localStorage.setItem('userEmail', email),
    remove: () => localStorage.removeItem('userEmail')
};

// 공통 fetch 함수
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
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

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '요청에 실패했습니다.');
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
        const data = await fetchWithAuth('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({email, password}),
        }) as TokenResponse;
        tokenStorage.set(data.accessToken);
        return data;
    },

    logout: () => tokenStorage.remove(),
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

    subscribe: (token: string, onMessage: (data: NotificationDetail) => void) => {
        fetch(`${BASE_URL}/api/notifications/subscribe`, {
            headers: {'Authorization': `Bearer ${token}`},
        }).then(response => {
            const reader = response.body!.getReader();
            const decoder = new TextDecoder();

            const read = () => {
                reader.read().then(({done, value}) => {
                    if (done) return;
                    const text = decoder.decode(value);
                    const lines = text.split('\n').filter(line => line.startsWith('data:'));
                    lines.forEach(line => {
                        try {
                            const data = JSON.parse(line.replace('data:', '').trim());
                            onMessage(data);
                        } catch {
                            // connect 이벤트 등 JSON 아닌 경우 무시
                        }
                    });
                    read();
                });
            };
            read();
        });
    },
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