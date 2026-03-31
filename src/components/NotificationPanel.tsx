import {motion, AnimatePresence} from 'framer-motion';
import {XIcon, HeartIcon, MessageCircleIcon, UserPlusIcon, CheckCheckIcon} from 'lucide-react';
import {NotificationDetail} from '../lib/api';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: NotificationDetail[];
    onMarkAsRead: (id: number) => void;
    onMarkAllAsRead: () => void;
}

export function NotificationPanel({
                                      isOpen,
                                      onClose,
                                      notifications,
                                      onMarkAsRead,
                                      onMarkAllAsRead,
                                  }: NotificationPanelProps) {
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'like':
                return <HeartIcon className="w-4 h-4 fill-current text-softPink-500"/>;
            case 'comment':
                return <MessageCircleIcon className="w-4 h-4 text-blue-500"/>;
            case 'follow':
                return <UserPlusIcon className="w-4 h-4 text-green-500"/>;
            default:
                return null;
        }
    };

    const getMessage = (type: string) => {
        switch (type.toLowerCase()) {
            case 'like':
                return '회원님의 게시글에 좋아요를 눌렀습니다.';
            case 'comment':
                return '회원님의 게시글에 댓글을 달았습니다.';
            case 'follow':
                return '회원님을 팔로우하기 시작했습니다.';
            default:
                return '새로운 알림이 있습니다.';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                    />
                    {/* Panel */}
                    <motion.div
                        initial={{x: '100%'}}
                        animate={{x: 0}}
                        exit={{x: '100%'}}
                        transition={{type: 'spring', damping: 30, stiffness: 300}}
                        className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">알림</h2>
                                {unreadCount > 0 && (
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        읽지 않은 알림 {unreadCount}개
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={onMarkAllAsRead}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-softPink-600 hover:bg-softPink-50 rounded-lg transition-colors"
                                    >
                                        <CheckCheckIcon className="w-3.5 h-3.5"/>
                                        모두 읽음
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <XIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <div
                                        className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                        <HeartIcon className="w-8 h-8 text-slate-400"/>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-2">알림이 없습니다</h3>
                                    <p className="text-sm text-slate-500">
                                        누군가 내 게시글에 반응하면 여기에 표시됩니다.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                                                !notification.isRead ? 'bg-softPink-50/30' : ''
                                            }`}
                                            onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-softPink-400 to-softPink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {notification.senderNickname.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex-1">
                                                            <p className="text-sm text-slate-900">
                                                                <span className="font-semibold">{notification.senderNickname}</span>{' '}
                                                                <span className="text-slate-600">{getMessage(notification.type)}</span>
                                                            </p>
                                                            {notification.type.toLowerCase() === 'comment' && notification.commentContent ? (
                                                                <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                                                                    "{notification.commentContent}"
                                                                </p>
                                                            ) : notification.postTitle ? (
                                                                <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                                                                    "{notification.postTitle}"
                                                                </p>
                                                            ) : null}
                                                            <p className="text-xs text-slate-400 mt-1.5">
                                                                {new Date(notification.createdAt).toLocaleDateString('ko-KR')}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {getIcon(notification.type)}
                                                            {!notification.isRead && (
                                                                <div className="w-2 h-2 rounded-full bg-softPink-500"/>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
