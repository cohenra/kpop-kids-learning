import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Modal overlay component ──────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean
  onClose?: () => void
  children: React.ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            key="panel"
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-kpop-card rounded-3xl p-6 border border-kpop-purple/40 shadow-[0_0_40px_rgba(124,58,237,0.4)]"
            initial={{ opacity: 0, scale: 0.85, y: '-40%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.85, y: '-40%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {title && (
              <h2
                className="text-2xl font-bold text-center text-kpop-text mb-4"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                {title}
              </h2>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
