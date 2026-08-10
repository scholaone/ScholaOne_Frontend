import { forwardRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { cn } from '@/utils/format'

function useFloatingField(props) {
  const [focused, setFocused] = useState(false)
  const [filled, setFilled] = useState(false)

  return {
    focused,
    filled,
    handlers: {
      onFocus: (e) => {
        setFocused(true)
        props.onFocus?.(e)
      },
      onBlur: (e) => {
        setFocused(false)
        setFilled(e.target.value.length > 0)
        props.onBlur?.(e)
      },
      onChange: (e) => {
        setFilled(e.target.value.length > 0)
        props.onChange?.(e)
      },
    },
  }
}

const fieldShell = (error, focused) =>
  cn(
    'auth-ref-field relative flex h-[52px] items-center rounded-xl border transition-all duration-200',
    error
      ? 'border-red-400 bg-red-50/60'
      : focused
        ? 'border-[#2563eb]/50 bg-[#f8fafc]'
        : 'border-transparent bg-[#eef2f7] hover:bg-[#e8edf4]',
  )

export const AuthInput = forwardRef(function AuthInput(
  { label, icon: Icon, error, type = 'text', className, id, ...props },
  ref,
) {
  const { focused, filled, handlers } = useFloatingField(props)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className={fieldShell(error, focused)}>
        {Icon && (
          <Icon
            className={cn(
              'pointer-events-none absolute left-4 h-5 w-5 transition-colors duration-200',
              focused ? 'text-[#2563eb]' : 'text-[#475569]',
            )}
            aria-hidden
          />
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder=" "
          className="peer h-full w-full rounded-xl bg-transparent pl-12 pr-4 pt-4 text-base font-medium text-[#0a1628] outline-none"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
          {...handlers}
        />
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-12 transition-all duration-200',
            focused || filled
              ? 'top-2 text-[11px] font-bold uppercase tracking-wide text-[#2563eb]'
              : 'top-1/2 -translate-y-1/2 text-sm font-medium text-[#64748b]',
          )}
        >
          {label}
        </label>
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            className="pl-1 text-xs font-medium text-red-500"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})

export const AuthPasswordInput = forwardRef(function AuthPasswordInput(
  { label, icon: Icon, error, className, id, showTextToggle = false, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false)
  const { focused, filled, handlers } = useFloatingField(props)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className={fieldShell(error, focused)}>
        {Icon && (
          <Icon
            className={cn(
              'pointer-events-none absolute left-4 h-5 w-5 transition-colors duration-200',
              focused ? 'text-[#2563eb]' : 'text-[#475569]',
            )}
            aria-hidden
          />
        )}
        <input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder=" "
          className={cn(
            'h-full w-full rounded-xl bg-transparent pl-12 pt-4 text-base font-medium text-[#0a1628] outline-none',
            showTextToggle ? 'pr-16' : 'pr-14',
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
          {...handlers}
        />
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-12 transition-all duration-200',
            focused || filled
              ? 'top-2 text-[11px] font-bold uppercase tracking-wide text-[#2563eb]'
              : 'top-1/2 -translate-y-1/2 text-sm font-medium text-[#64748b]',
          )}
        >
          {label}
        </label>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className={cn(
            'absolute right-3 flex items-center justify-center text-xs font-bold uppercase tracking-wide text-[#2563eb] transition hover:text-[#1d4ed8]',
            showTextToggle ? 'h-10 px-1' : 'h-10 w-10 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#2563eb]',
          )}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {showTextToggle ? (visible ? 'Hide' : 'Show') : visible ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
        </button>
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            className="pl-1 text-xs font-medium text-red-500"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})
