import React, {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {LogInIcon, ArrowRightIcon} from 'lucide-react';

interface AuthCardProps {
    onLogin: (email: string, password: string) => Promise<void>;
    onSignUp: (email: string, password: string, nickname: string) => Promise<void>;
}

export function AuthCard({onLogin, onSignUp}: AuthCardProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isLogin) {
                await onLogin(email, password);
            } else {
                await onSignUp(email, password, nickname);
                setIsLogin(true);
                setEmail('');
                setPassword('');
                setNickname('');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div
                className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-softPink-100/40 blur-3xl pointer-events-none"/>
            <div
                className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/60 blur-3xl pointer-events-none"/>

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, ease: 'easeOut'}}
                className="w-full max-w-md bg-white rounded-[2rem] shadow-soft-lg p-8 relative z-10 border border-slate-100">

                <div className="flex flex-col items-center mb-8">
                    <div
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-softPink-400 to-softPink-600 flex items-center justify-center text-white font-bold shadow-md mb-4">
                        C
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Welcome to Commune
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 text-center">
                        The modern community platform for developers and designers.
                    </p>
                </div>

                <div className="flex p-1 bg-slate-50 rounded-xl mb-8 relative">
                    {['Login', 'Sign Up'].map((tab, index) => {
                        const isActive = index === 0 && isLogin || index === 1 && !isLogin;
                        return (
                            <button
                                key={tab}
                                onClick={() => setIsLogin(index === 0)}
                                className={`flex-1 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                                {tab}
                                {isActive && (
                                    <motion.div
                                        layoutId="auth-tab"
                                        className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-100/50 -z-10"
                                        transition={{type: 'spring', stiffness: 400, damping: 30}}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                key="nickname-field"
                                initial={{opacity: 0, height: 0, marginBottom: 0}}
                                animate={{opacity: 1, height: 'auto', marginBottom: 16}}
                                exit={{opacity: 0, height: 0, marginBottom: 0}}
                                transition={{duration: 0.2}}>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                                    닉네임
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="닉네임을 입력해 주세요"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-softPink-400 focus:ring-2 focus:ring-softPink-100 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                            이메일
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="이메일을 입력해 주세요"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-softPink-400 focus:ring-2 focus:ring-softPink-100 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                            <label className="block text-sm font-medium text-slate-700">
                                비밀번호
                            </label>
                        </div>
                        <input
                            type="password"
                            required
                            placeholder="비밀번호를 입력해 주세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-softPink-400 focus:ring-2 focus:ring-softPink-100 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                        />
                    </div>

                    <motion.button
                        whileHover={{scale: 1.01}}
                        whileTap={{scale: 0.98}}
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-6 bg-softPink-500 hover:bg-softPink-600 text-white font-medium py-3.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? '처리 중...' : isLogin ? 'Sign In' : 'Create Account'}
                        {!isLoading && (
                            isLogin
                                ? <LogInIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                                : <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}