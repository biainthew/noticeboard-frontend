import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon } from 'lucide-react';
export interface ToastMessage {
  id: string;
  message: string;
}
interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}
export function Toast({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) =>
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        )}
      </AnimatePresence>
    </div>);

}
function ToastItem({
  toast,
  removeToast



}: {toast: ToastMessage;removeToast: (id: string) => void;}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 50,
        scale: 0.9
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
        transition: {
          duration: 0.2
        }
      }}
      className="bg-white px-5 py-4 rounded-2xl shadow-soft-lg border border-softPink-50 flex items-center gap-3 pointer-events-auto">

      <div className="bg-softPink-50 p-2 rounded-full text-softPink-500">
        <HeartIcon className="w-5 h-5 fill-current" />
      </div>
      <p className="text-slate-700 font-medium text-sm">{toast.message}</p>
    </motion.div>);

}