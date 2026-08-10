import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/format'

export default function AuthButton({
  children,
  loading,
  disabled,
  type = 'button',
  className,
  variant = 'primary',
  onClick,
}) {
  const [ripples, setRipples] = useState([])

  const handleClick = useCallback(
    (e) => {
      if (loading || disabled) return

      const rect = e.currentTarget.getBoundingClientRect()
      const id = Date.now()
      setRipples((prev) => [
        ...prev,
        { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
      ])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, 550)

      onClick?.(e)
    },
    [loading, disabled, onClick],
  )

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={cn(
        'relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-base font-bold transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' ? 'auth-btn-primary text-white' : 'auth-btn-secondary',
        className,
      )}
      whileHover={!loading && !disabled ? { scale: 1.01 } : undefined}
      whileTap={!loading && !disabled ? { scale: 0.98 } : undefined}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="auth-ripple-effect pointer-events-none absolute rounded-full bg-white/40"
          style={{ left: r.x - 12, top: r.y - 12, width: 24, height: 24 }}
        />
      ))}
      {loading ? (
        <>
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Signing in…
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
