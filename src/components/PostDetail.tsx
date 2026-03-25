import React, {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {ArrowLeftIcon, SendIcon, Trash2Icon, PencilIcon, MoreVerticalIcon, CornerDownRightIcon} from 'lucide-react';
import {PostDetail as PostDetailType, CommentDetail} from '../lib/api';
import {LikeButton} from './LikeButton';

interface PostDetailProps {
    post: PostDetailType;
    comments: CommentDetail[];
    currentUserEmail: string;
    onBack: () => void;
    onLikeToggle: (id: number, liked: boolean) => void;
    onAddComment: (postId: number, content: string, parentId?: number) => Promise<void>;
    onDeleteComment: (postId: number, commentId: number) => void;
    onEditComment?: (postId: number, commentId: number, content: string) => Promise<void>;
    onEditPost: (id: number) => void;
    onDeletePost: (id: number) => void;
}

export function PostDetail({post, comments, currentUserEmail, onBack, onLikeToggle, onAddComment, onDeleteComment, onEditComment, onEditPost, onDeletePost}: PostDetailProps) {
    const [commentText, setCommentText] = useState('');
    const [liked, setIsLiked] = useState(post.liked);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openMenuCommentId, setOpenMenuCommentId] = useState<number | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setIsSubmitting(true);
        try {
            await onAddComment(post.id, commentText);
            setCommentText('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLikeToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLiked((prev) => !prev);
        onLikeToggle(post.id, liked);
    };

    const handleStartEditComment = (id: number, content: string) => {
        setEditingCommentId(id);
        setEditText(content);
    };

    const handleSubmitEdit = async (commentId: number) => {
        if (!editText.trim() || !onEditComment) return;
        setIsSubmittingEdit(true);
        try {
            await onEditComment(post.id, commentId, editText);
            setEditingCommentId(null);
            setEditText('');
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    const handleSubmitReply = async (parentId: number) => {
        if (!replyText.trim()) return;
        setIsSubmittingReply(true);
        try {
            await onAddComment(post.id, replyText, parentId);
            setReplyingToCommentId(null);
            setReplyText('');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleDeletePostClick = () => {
        if (window.confirm('게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            onDeletePost(post.id);
        }
    };

    const renderComments = (commentList: CommentDetail[], depth = 0) => {
        return commentList.map((comment) => {
            const isOwn = comment.email === currentUserEmail;

            return (
                <React.Fragment key={comment.id}>
                    <div className={`flex gap-4 group ${depth > 0 ? 'ml-12 mt-4' : ''}`}>
                        <div
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-softPink-400 to-softPink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {comment.nickname.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 relative">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-slate-900 text-sm">
                                    {comment.nickname}
                                </h4>

                                <div className="flex items-center gap-1 relative">
                                    <span className="text-xs text-slate-400">
                                        {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                                    </span>
                                    {editingCommentId !== comment.id && (
                                        <>
                                            <button
                                                onClick={() => setOpenMenuCommentId(openMenuCommentId === comment.id ? null : comment.id)}
                                                className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                                                aria-label="Comment options"
                                            >
                                                <MoreVerticalIcon className="w-3.5 h-3.5"/>
                                            </button>

                                            <AnimatePresence>
                                                {openMenuCommentId === comment.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setOpenMenuCommentId(null)}
                                                        />
                                                        <motion.div
                                                            initial={{opacity: 0, scale: 0.95, y: -10}}
                                                            animate={{opacity: 1, scale: 1, y: 0}}
                                                            exit={{opacity: 0, scale: 0.95, y: -10}}
                                                            transition={{duration: 0.15}}
                                                            className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-1 min-w-[140px]"
                                                        >
                                                            {isOwn && (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleStartEditComment(comment.id, comment.content);
                                                                            setOpenMenuCommentId(null);
                                                                        }}
                                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-softPink-50 hover:text-softPink-600 transition-colors"
                                                                    >
                                                                        <PencilIcon className="w-4 h-4"/>
                                                                        수정
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            onDeleteComment(post.id, comment.id);
                                                                            setOpenMenuCommentId(null);
                                                                        }}
                                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                                    >
                                                                        <Trash2Icon className="w-4 h-4"/>
                                                                        삭제
                                                                    </button>
                                                                </>
                                                            )}
                                                            {depth === 0 && (
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyingToCommentId(comment.id);
                                                                        setReplyText('');
                                                                        setOpenMenuCommentId(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-softPink-50 hover:text-softPink-600 transition-colors"
                                                                >
                                                                    <CornerDownRightIcon className="w-4 h-4"/>
                                                                    답글 달기
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    )}
                                </div>
                            </div>

                            {editingCommentId === comment.id ? (
                                <div className="mt-1">
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-softPink-400 focus:ring-2 focus:ring-softPink-100 outline-none transition-all text-slate-900 text-sm resize-none"
                                        rows={3}
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            onClick={() => {
                                                setEditingCommentId(null);
                                                setEditText('');
                                            }}
                                            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={() => handleSubmitEdit(comment.id)}
                                            disabled={!editText.trim() || isSubmittingEdit || !onEditComment}
                                            className="px-3 py-1.5 text-xs bg-softPink-500 hover:bg-softPink-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-colors"
                                        >
                                            저장
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {comment.content}
                                    </p>

                                    {/* Reply Form */}
                                    {replyingToCommentId === comment.id && (
                                        <motion.div
                                            initial={{opacity: 0, height: 0}}
                                            animate={{opacity: 1, height: 'auto'}}
                                            exit={{opacity: 0, height: 0}}
                                            transition={{duration: 0.2}}
                                            className="mt-4 pt-3 border-t border-slate-100 flex gap-3"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-softPink-100 flex items-center justify-center flex-shrink-0 text-softPink-600 font-bold text-[10px]">
                                                U
                                            </div>
                                            <div className="flex-grow">
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder={`@${comment.nickname}에게 답글 달기...`}
                                                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-softPink-400 focus:ring-2 focus:ring-softPink-100 outline-none transition-all text-slate-900 text-sm resize-none placeholder:text-slate-400"
                                                    rows={2}
                                                    autoFocus
                                                />
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleSubmitReply(comment.id)}
                                                        disabled={!replyText.trim() || isSubmittingReply}
                                                        className="px-3 py-1.5 bg-softPink-500 hover:bg-softPink-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-medium rounded-lg transition-colors"
                                                    >
                                                        등록
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setReplyingToCommentId(null);
                                                            setReplyText('');
                                                        }}
                                                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-medium rounded-lg transition-colors"
                                                    >
                                                        취소
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Replies List */}
                                    {comment.children && comment.children.length > 0 && (
                                        <div className="mt-4 space-y-3 pt-3">
                                            {comment.children.map((reply) => {
                                                const isReplyOwn = reply.email === currentUserEmail;
                                                return (
                                                    <div key={reply.id} className="flex gap-3">
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-softPink-400 to-softPink-600 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                                                            {reply.nickname.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-grow">
                                                            <div className="bg-slate-50 p-3 rounded-xl rounded-tl-none">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h5 className="font-semibold text-slate-900 text-xs">
                                                                            {reply.nickname}
                                                                        </h5>
                                                                        <span className="text-xs text-slate-400">
                                                                            {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                                                                        </span>
                                                                    </div>
                                                                    {isReplyOwn && editingCommentId !== reply.id && (
                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                onClick={() => handleStartEditComment(reply.id, reply.content)}
                                                                                className="p-1 text-slate-400 hover:text-softPink-500 rounded transition-colors"
                                                                            >
                                                                                <PencilIcon className="w-3 h-3"/>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => onDeleteComment(post.id, reply.id)}
                                                                                className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                                                                            >
                                                                                <Trash2Icon className="w-3 h-3"/>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {editingCommentId === reply.id ? (
                                                                    <div className="mt-1">
                                                                        <textarea
                                                                            value={editText}
                                                                            onChange={(e) => setEditText(e.target.value)}
                                                                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:border-softPink-400 focus:ring-2 focus:ring-softPink-100 outline-none transition-all text-slate-900 text-sm resize-none"
                                                                            rows={2}
                                                                            autoFocus
                                                                        />
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <button
                                                                                onClick={() => handleSubmitEdit(reply.id)}
                                                                                disabled={!editText.trim() || isSubmittingEdit || !onEditComment}
                                                                                className="px-3 py-1.5 text-xs bg-softPink-500 hover:bg-softPink-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-colors"
                                                                            >
                                                                                저장
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { setEditingCommentId(null); setEditText(''); }}
                                                                                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                                                            >
                                                                                취소
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-slate-600 text-sm leading-relaxed">
                                                                        {reply.content}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                </>
                            )}
                        </div>
                    </div>
                </React.Fragment>
            );
        });
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
            className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">

            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm group">
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
                    뒤로가기
                </button>
                <div className="flex items-center gap-2">
                    {post.email === currentUserEmail && (
                        <>
                            <button
                                onClick={() => onEditPost(post.id)}
                                className="p-2 text-slate-400 hover:text-softPink-500 hover:bg-softPink-50 rounded-full transition-colors"
                                aria-label="Edit post"
                            >
                                <PencilIcon className="w-5 h-5"/>
                            </button>
                            <button
                                onClick={handleDeletePostClick}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                aria-label="Delete post"
                            >
                                <Trash2Icon className="w-5 h-5"/>
                            </button>
                            {/*<div className="w-px h-6 bg-slate-200 mx-1"/>*/}
                        </>
                    )}
                    {/* TODO: 구현 예정
                    <button
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <BookmarkIcon className="w-5 h-5"/>
                    </button>
                    */}
                    {/* TODO: 구현 예정
                    <button
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <ShareIcon className="w-5 h-5"/>
                    </button>
                    */}
                </div>
            </div>

            <header className="mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                    {post.title}
                </h1>

                <div className="flex items-center justify-between py-4 border-y border-slate-100">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-softPink-400 to-softPink-600 flex items-center justify-center text-white font-bold">
                            {post.nickname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">{post.nickname}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                                <span>•</span>
                                <span>조회 {post.viewCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 px-4 py-2 rounded-full">
                        <LikeButton
                            liked={liked}
                            count={post.likeCount}
                            onToggle={handleLikeToggle}
                            size="lg"
                        />
                    </div>
                </div>
            </header>

            <article className="prose prose-slate prose-lg max-w-none mb-16">
                <ReactMarkdown>{post.content}</ReactMarkdown>
            </article>

            <section className="border-t border-slate-200 pt-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">
                    댓글 ({comments.length})
                </h2>

                <form onSubmit={handleSubmitComment} className="mb-10 flex items-start gap-4">
                    <div
                        className="w-10 h-10 rounded-full bg-softPink-100 flex items-center justify-center flex-shrink-0 text-softPink-600 font-bold">
                        U
                    </div>
                    <div className="flex-grow relative">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="댓글을 입력해 주세요..."
                            className="w-full px-4 py-3 pb-12 rounded-2xl bg-white border border-slate-200 focus:border-softPink-400 focus:ring-2 focus:ring-softPink-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 resize-none shadow-sm"
                            rows={3}
                        />
                        <div className="absolute bottom-3 right-3">
                            <button
                                type="submit"
                                disabled={!commentText.trim() || isSubmitting}
                                className="bg-softPink-500 hover:bg-softPink-600 disabled:bg-slate-200 disabled:text-slate-400 text-white p-2 rounded-xl transition-colors shadow-sm">
                                <SendIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                </form>

                <div className="space-y-6">
                    {comments.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">
                            아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
                        </p>
                    ) : (
                        renderComments(comments)
                    )}
                </div>
            </section>
        </motion.div>
    );
}
