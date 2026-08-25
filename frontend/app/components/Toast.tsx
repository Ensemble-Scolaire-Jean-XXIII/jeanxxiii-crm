"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ToastProps } from "../types";

export default function Toast({
  message,
  type,
  duration = 5000,
  onClose,
  onUndo,
}: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!message) return;
    if (type !== "undo") return;

    setProgress(100);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [message, type, duration]);

  if (!message || !mounted) return null;

  const isUndo = type === "undo";
  const isError = type === "error";
  const isSuccess = type === "success";

  const toastContent = (
    <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white rounded-2xl shadow-2xl overflow-hidden min-w-85 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="px-6 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isError
                ? "bg-danger"
                : isUndo
                  ? "bg-accent"
                  : isSuccess
                    ? "bg-emerald-400"
                    : "bg-primary"
            }`}
          />
          <span className="text-sm font-medium tracking-wide">{message}</span>
        </div>

        <div className="flex items-center gap-4 ml-auto shrink-0">
          {isUndo && onUndo && (
            <button
              onClick={onUndo}
              className="text-xs font-bold text-accent hover:text-accent/80 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Annuler
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>
      </div>

      {isUndo && (
        <div className="w-full bg-white/10 h-1">
          <div
            className="bg-accent h-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );

  return createPortal(toastContent, document.body);
}
