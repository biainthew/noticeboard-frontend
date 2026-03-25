import {motion} from 'framer-motion';
import {MessageCircleIcon, CalendarIcon} from 'lucide-react';
import {PostSummary} from '../lib/api';
import {LikeButton} from './LikeButton';

interface BoardListProps {
    posts: PostSummary[];
    isLoading: boolean;
    onPostClick: (id: number) => void;
    onLikeToggle: (id: number, liked: boolean) => void;
}

export function BoardList({posts, isLoading, onPostClick, onLikeToggle}: BoardListProps) {
    const containerVariants = {
        hidden: {opacity: 0},
        show: {
            opacity: 1,
            transition: {staggerChildren: 0.1}
        }
    };

    const itemVariants = {
        hidden: {opacity: 0, y: 20},
        show: {
            opacity: 1,
            y: 0,
            transition: {type: 'spring', stiffness: 300, damping: 24}
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center h-64">
                <p className="text-slate-400">불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Community Board
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Discover discussions, tutorials, and insights.
                    </p>
                </div>
            </div>

            {posts.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-slate-400">게시글이 없습니다.</p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post) => (
                        <motion.article
                            key={post.id}
                            variants={itemVariants}
                            onClick={() => onPostClick(post.id)}
                            className="bg-white p-6 rounded-2xl shadow-soft hover:shadow-soft-lg transition-shadow border border-slate-100 cursor-pointer group flex flex-col h-full">

                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-softPink-400 to-softPink-600 flex items-center justify-center text-white font-bold text-sm">
                                    {post.nickname.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        {post.nickname}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex-grow">
                                <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-softPink-500 transition-colors line-clamp-2">
                                    {post.title}
                                </h2>
                            </div>

                            <div
                                className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-slate-400">
                                <div className="flex items-center gap-4">
                                    <LikeButton
                                        liked={false}
                                        count={post.likeCount}
                                        onToggle={(e) => {
                                            e.stopPropagation();
                                            onLikeToggle(post.id, false);
                                        }}
                                    />
                                    <div className="flex items-center gap-1.5">
                                        <MessageCircleIcon className="w-5 h-5"/>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                    <CalendarIcon className="w-3.5 h-3.5"/>
                                    <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                                    <span className="mx-1 text-slate-300">•</span>
                                    <span>조회 {post.viewCount}</span>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </motion.div>
            )}
        </div>
    );
}