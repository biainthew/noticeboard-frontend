import React, {useState, useRef} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {ArrowLeftIcon, SendIcon, ImageIcon, XIcon} from 'lucide-react';
import {imageApi} from '../lib/api';

interface UploadedImage {
    id: string;
    url: string;
    name: string;
}

interface CreatePostProps {
    onPublish: (title: string, content: string) => Promise<void>;
    onCancel: () => void;
    initialTitle?: string;
    initialContent?: string;
    isEditMode?: boolean;
}

export function CreatePost({onPublish, onCancel, initialTitle, initialContent, isEditMode}: CreatePostProps) {
    const [title, setTitle] = useState(initialTitle ?? '');
    const [content, setContent] = useState(initialContent ?? '');
    const [showPreview] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const canPublish = title.trim().length > 0 && content.trim().length > 50;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canPublish) return;
        setIsPublishing(true);
        try {
            await onPublish(title.trim(), content.trim());
        } finally {
            setIsPublishing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setIsUploading(true);
        try {
            for (const file of Array.from(files)) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('파일 크기는 5MB 이하여야 합니다.');
                    continue;
                }
                if (!file.type.startsWith('image/')) {
                    alert('이미지 파일만 업로드할 수 있습니다.');
                    continue;
                }

                // S3에 업로드하고 URL 받아오기
                const s3Url = await imageApi.upload(file);
                setUploadedImages((prev) => [
                    ...prev,
                    {id: Math.random().toString(36).substring(2, 9), url: s3Url, name: file.name}
                ]);

                // 본문에 마크다운 이미지 삽입
                setContent((prev) => prev + `\n\n![${file.name}](${s3Url})`);
            }
        } catch (e) {
            alert(`이미지 업로드에 실패했습니다.\n${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (id: string) => {
        setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
            className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">

            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm group">
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
                    뒤로가기
                </button>
                {/*TODO 구현예정*/}
                {/*<div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${showPreview ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                        <EyeIcon className="w-4 h-4"/>
                        {showPreview ? 'Edit' : 'Preview'}
                    </button>
                </div>*/}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {!showPreview ? (
                    <>
                        <div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="제목을 입력해 주세요..."
                                className="w-full text-3xl sm:text-4xl font-bold text-slate-900 placeholder:text-slate-300 bg-transparent border-none outline-none focus:ring-0 px-0"
                                autoFocus
                            />
                        </div>

                        <div className="flex items-center gap-2 py-3 border-y border-slate-100">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer group">
                                <ImageIcon className="w-4 h-4 group-hover:text-softPink-500 transition-colors"/>
                                {isUploading ? '업로드 중...' : '이미지 추가'}
                            </label>
                            <span className="text-xs text-slate-400 ml-2">
                                {uploadedImages.length > 0 && `${uploadedImages.length}개 업로드됨`}
                            </span>
                        </div>

                        <AnimatePresence>
                            {uploadedImages.length > 0 && (
                                <motion.div
                                    initial={{opacity: 0, height: 0}}
                                    animate={{opacity: 1, height: 'auto'}}
                                    exit={{opacity: 0, height: 0}}
                                    className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {uploadedImages.map((image) => (
                                        <motion.div
                                            key={image.id}
                                            initial={{opacity: 0, scale: 0.9}}
                                            animate={{opacity: 1, scale: 1}}
                                            exit={{opacity: 0, scale: 0.9}}
                                            className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-video">
                                            <img src={image.url} alt={image.name}
                                                 className="w-full h-full object-cover"/>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(image.id)}
                                                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <XIcon className="w-4 h-4"/>
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
              <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력해 주세요... (최소 50자)"
                  className="w-full min-h-[400px] text-lg text-slate-700 placeholder:text-slate-400 bg-transparent border-none outline-none focus:ring-0 resize-none leading-relaxed px-0"
                  style={{fontFamily: 'inherit'}}
              />
                        </div>

                        <div className="flex items-center justify-between py-4 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span>{wordCount} 단어</span>
                                {content.length > 0 && content.length < 50 && (
                                    <>
                                        <span>•</span>
                                        <span className="text-softPink-500">{50 - content.length}자 더 필요합니다</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="prose prose-slate prose-lg max-w-none">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                            {title || '제목 없음'}
                        </h1>
                        {uploadedImages.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {uploadedImages.map((image) => (
                                    <div key={image.id} className="rounded-xl overflow-hidden">
                                        <img src={image.url} alt={image.name} className="w-full h-auto object-cover"/>
                                    </div>
                                ))}
                            </div>
                        )}
                        {content.split('\n\n').map((paragraph, idx) => (
                            <p key={idx} className="text-slate-700 leading-relaxed mb-6">
                                {paragraph || <span className="text-slate-400 italic">빈 단락</span>}
                            </p>
                        ))}
                        {!content && <p className="text-slate-400 italic">내용을 입력하면 여기에 표시됩니다...</p>}
                    </div>
                )}

                <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={!canPublish || isPublishing}
                        className="flex-1 sm:flex-none sm:px-8 py-3 rounded-xl font-medium bg-softPink-500 hover:bg-softPink-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2 group">
                        {isPublishing ? (isEditMode ? '수정 중...' : '게시 중...') : (isEditMode ? '수정하기' : '게시하기')}
                        {!isPublishing &&
                            <SendIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}