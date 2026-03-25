import {useState, useEffect} from 'react';
import {AnimatePresence} from 'framer-motion';
import {AuthCard} from './components/AuthCard';
import {BoardList} from './components/BoardList';
import {PostDetail} from './components/PostDetail';
import {CreatePost} from './components/CreatePost';
import {Navigation} from './components/Navigation';
import {Toast, ToastMessage} from './components/Toast';
import {
    authApi,
    postApi,
    commentApi,
    likeApi,
    notificationApi,
    tokenStorage,
    userEmailStorage,
    PostSummary,
    PostDetail as PostDetailType,
    CommentDetail,
    NotificationDetail
} from './lib/api';
import {NotificationPanel} from "./components/NotificationPanel.tsx";

type Screen = 'auth' | 'board' | 'post' | 'newPost' | 'editPost';

export function App() {
    const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
    const [currentUserEmail, setCurrentUserEmail] = useState<string>(userEmailStorage.get() ?? '');
    const [posts, setPosts] = useState<PostSummary[]>([]);
    const [selectedPost, setSelectedPost] = useState<PostDetailType | null>(null);
    const [comments, setComments] = useState<CommentDetail[]>([]);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [notifications, setNotifications] = useState<NotificationDetail[]>([]);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

    const addToast = (message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, {id, message}]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    // 앱 시작 시 토큰 있으면 바로 board로
    useEffect(() => {
        if (tokenStorage.get()) {
            setCurrentScreen('board');
        }
    }, []);

    // board 진입 시 게시글 목록 조회
    useEffect(() => {
        if (currentScreen === 'board') {
            fetchPosts();
        }
    }, [currentScreen]);

    // 알림 목록 조회 + SSE 구독 (로그인 상태일 때)
    useEffect(() => {
        const token = tokenStorage.get();
        if (!token) return;

        notificationApi.getList()
            .then((data) => setNotifications(Array.isArray(data) ? data : []))
            .catch(() => {/* 알림 조회 실패 시 무시 */});

        notificationApi.subscribe(token, (notification) => {
            setNotifications((prev) => [notification, ...prev]);
        });
    }, [currentUserEmail]);

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            const data = await postApi.getList();
            setPosts(data.content);
        } catch (e) {
            addToast('게시글 목록을 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (email: string, password: string) => {
        try {
            await authApi.login(email, password);
            userEmailStorage.set(email);
            setCurrentUserEmail(email);
            setCurrentScreen('board');
        } catch (e) {
            addToast('로그인에 실패했습니다.');
        }
    };

    const handleSignUp = async (email: string, password: string, nickname: string) => {
        try {
            await authApi.signUp(email, password, nickname);
            addToast('회원가입이 완료됐습니다. 로그인해 주세요.');
        } catch (e) {
            addToast('회원가입에 실패했습니다.');
        }
    };

    const handleLogout = () => {
        authApi.logout();
        userEmailStorage.remove();
        setCurrentUserEmail('');
        setCurrentScreen('auth');
    };

    const handlePostClick = async (id: number) => {
        try {
            setIsLoading(true);
            const [post, commentList] = await Promise.all([
                postApi.getDetail(id),
                commentApi.getList(id),
            ]);
            setSelectedPost(post);
            setComments(commentList);
            setCurrentScreen('post');
        } catch (e) {
            addToast('게시글을 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToBoard = () => {
        setSelectedPost(null);
        setComments([]);
        setCurrentScreen('board');
    };

    const handleLikeToggle = async (id: number, liked: boolean) => {
        try {
            if (liked) {
                await likeApi.unlike(id);
            } else {
                await likeApi.like(id);
                addToast('좋아요를 눌렀습니다!');
            }
            // 목록 또는 상세 좋아요 수 업데이트
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === id ? {...p, likeCount: liked ? p.likeCount - 1 : p.likeCount + 1} : p
                )
            );
            if (selectedPost?.id === id) {
                setSelectedPost((prev) =>
                    prev ? {...prev, likeCount: liked ? prev.likeCount - 1 : prev.likeCount + 1} : prev
                );
            }
        } catch (e) {
            addToast('좋아요 처리에 실패했습니다.');
        }
    };

    const handleAddComment = async (postId: number, content: string, parentId?: number) => {
        try {
            const newComment = await commentApi.create(postId, content, parentId);
            setComments((prev) => [...prev, newComment]);
        } catch (e) {
            addToast('댓글 작성에 실패했습니다.');
        }
    };

    const handleDeleteComment = async (postId: number, commentId: number) => {
        try {
            await commentApi.delete(postId, commentId);
            addToast('댓글이 삭제됐습니다.');
        } catch (e) {
            addToast('댓글 삭제에 실패했습니다.');
        }
    };

    const handleCreatePost = async (title: string, content: string) => {
        try {
            await postApi.create(title, content);
            addToast('게시글이 작성됐습니다.');
            setCurrentScreen('board');
        } catch (e) {
            addToast('게시글 작성에 실패했습니다.');
        }
    };

    const handleCancelPost = () => {
        setCurrentScreen('board');
    };

    const handleEditPost = (_id: number) => {
        setCurrentScreen('editPost');
    };

    const handleUpdatePost = async (postId: number, title: string, content: string) => {
        try {
            const updated = await postApi.update(postId, title, content);
            setPosts((prev) => prev.map((p) => p.id === postId ? {...p, title: updated.title} : p));
            setSelectedPost((prev) => prev ? {...updated, liked: prev.liked, likeCount: prev.likeCount} : updated);
            addToast('게시글이 수정됐습니다.');
            setCurrentScreen('post');
        } catch (e) {
            addToast('게시글 수정에 실패했습니다.');
        }
    };

    const handleDeletePost = async (postId: number) => {
        try {
            await postApi.delete(postId);
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            addToast('게시글이 삭제됐습니다.');
            setCurrentScreen('board');
        } catch (e) {
            addToast('게시글 삭제에 실패했습니다.');
        }
    };

    const handleEditComment = async (postId: number, commentId: number, content: string) => {
        try {
            const updated = await commentApi.update(postId, commentId, content);
            setComments((prev) => prev.map((c) => c.id === commentId ? updated : c));
            addToast('댓글이 수정됐습니다.');
        } catch (e) {
            addToast('댓글 수정에 실패했습니다.');
        }
    };

    const handleMarkNotificationAsRead = (id: number) => {
        setNotifications((prev) => prev.map((n) => n.id === id ? {...n, isRead: true} : n));
    };

    const handleMarkAllNotificationsAsRead = async () => {
        try {
            await notificationApi.readAll();
            setNotifications((prev) => prev.map((n) => ({...n, isRead: true})));
        } catch (e) {
            addToast('알림 읽음 처리에 실패했습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans text-slate-900">
            {currentScreen !== 'auth' && (
                <Navigation
                    currentScreen={currentScreen}
                    onNavigate={(screen) => setCurrentScreen(screen as Screen)}
                    unreadNotificationCount={notifications.filter((n) => !n.isRead).length}
                    onOpenNotifications={() => setIsNotificationPanelOpen(true)}
                    onLogout={handleLogout}
                />
            )}

            <main>
                <AnimatePresence mode="wait">
                    {currentScreen === 'auth' && (
                        <AuthCard
                            key="auth"
                            onLogin={handleLogin}
                            onSignUp={handleSignUp}
                        />
                    )}

                    {currentScreen === 'board' && (
                        <BoardList
                            key="board"
                            posts={posts}
                            isLoading={isLoading}
                            onPostClick={handlePostClick}
                            onLikeToggle={handleLikeToggle}
                        />
                    )}

                    {currentScreen === 'post' && selectedPost && (
                        <PostDetail
                            key={`post-${selectedPost.id}`}
                            post={selectedPost}
                            comments={comments}
                            currentUserEmail={currentUserEmail}
                            onBack={handleBackToBoard}
                            onLikeToggle={handleLikeToggle}
                            onAddComment={handleAddComment}
                            onEditComment={handleEditComment}
                            onDeleteComment={handleDeleteComment}
                            onEditPost={handleEditPost}
                            onDeletePost={handleDeletePost}
                        />
                    )}

                    {currentScreen === 'newPost' && (
                        <CreatePost
                            key="newPost"
                            onPublish={handleCreatePost}
                            onCancel={handleCancelPost}
                        />
                    )}

                    {currentScreen === 'editPost' && selectedPost && (
                        <CreatePost
                            key={`editPost-${selectedPost.id}`}
                            onPublish={(title, content) => handleUpdatePost(selectedPost.id, title, content)}
                            onCancel={() => setCurrentScreen('post')}
                            initialTitle={selectedPost.title}
                            initialContent={selectedPost.content}
                            isEditMode
                        />
                    )}
                </AnimatePresence>
            </main>

            <Toast toasts={toasts} removeToast={removeToast}/>
            <NotificationPanel
                isOpen={isNotificationPanelOpen}
                onClose={() => setIsNotificationPanelOpen(false)}
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
            />
        </div>
    );
}