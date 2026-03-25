import { motion } from 'framer-motion';
import { BookmarkIcon, SearchIcon, UserIcon, BellIcon } from 'lucide-react';

interface NavigationProps {
    currentScreen: string;
    onNavigate: (screen: string) => void;
    onLogout: () => void;
    onOpenNotifications: () => void;
    unreadNotificationCount: number;
}

export function Navigation({ currentScreen, onNavigate, onLogout, onOpenNotifications, unreadNotificationCount }: NavigationProps) {
    const navItems = [
        { id: 'board', label: 'Community Board' },
        { id: 'bookmarks', label: 'Bookmarks' }
    ];

    return (
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => onNavigate('board')}
                        className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-softPink-400 to-softPink-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow-md transition-all">
                            C
                        </div>
                        <span className="font-bold text-slate-900 text-lg tracking-tight">
                            Commune
                        </span>
                    </button>

                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = currentScreen === item.id || currentScreen === 'post' && item.id === 'board';
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                                    {item.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-softPink-500 rounded-t-full"
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onNavigate('newPost')}
                        className="hidden sm:flex items-center gap-2 bg-softPink-500 hover:bg-softPink-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm text-sm">
                        New Post
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                        <SearchIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                        <BookmarkIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onOpenNotifications}
                        className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <BellIcon className="w-5 h-5" />
                        {unreadNotificationCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-softPink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                            </span>
                        )}
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-2" />
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border border-slate-200 hover:border-softPink-200 hover:bg-softPink-50 transition-colors group">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                            <UserIcon className="w-4 h-4 text-slate-400 group-hover:text-softPink-500 transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-softPink-600 transition-colors">
                            Sign Out
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}