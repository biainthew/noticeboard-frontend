import React from 'react';
import {motion} from 'framer-motion';
import {HeartIcon} from 'lucide-react';

interface LikeButtonProps {
    liked: boolean;
    count: number;
    onToggle: (e: React.MouseEvent) => void;
    showCount?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function LikeButton({
                               liked,
                               count,
                               onToggle,
                               showCount = true,
                               size = 'md'
                           }: LikeButtonProps) {
    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };
    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };
    return (
        <motion.button
            onClick={(e) => {
                e.stopPropagation();
                onToggle(e);
            }}
            className={`group flex items-center gap-1.5 transition-colors ${liked ? 'text-softPink-500' : 'text-slate-400 hover:text-softPink-400'}`}
            whileTap={{
                scale: 0.85
            }}
            aria-label={liked ? 'Unlike post' : 'Like post'}>

            <div className="relative">
                <motion.div
                    initial={false}
                    animate={{
                        scale: liked ? [1, 1.2, 1] : 1
                    }}
                    transition={{
                        duration: 0.3,
                        type: 'spring',
                        stiffness: 400,
                        damping: 15
                    }}>

                    <HeartIcon
                        className={`${iconSizes[size]} transition-colors ${liked ? 'fill-current' : ''}`}/>

                </motion.div>

                {/* Particle effect on like */}
                {liked &&
                    <motion.div
                        initial={{
                            scale: 0,
                            opacity: 1
                        }}
                        animate={{
                            scale: 2,
                            opacity: 0
                        }}
                        transition={{
                            duration: 0.4,
                            ease: 'easeOut'
                        }}
                        className="absolute inset-0 bg-softPink-200 rounded-full -z-10"/>

                }
            </div>

            {showCount &&
                <span className={`font-medium ${textSizes[size]}`}>{count}</span>
            }
        </motion.button>);

}