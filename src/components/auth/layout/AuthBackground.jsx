import { motion } from 'framer-motion'

export function AuthBackgroundFade({ children }) {
  return (
    <motion.div
      className="auth-login-root auth-platinum-root relative font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="auth-platinum-ambient" aria-hidden />
      <div className="relative z-10 w-full">{children}</div>
    </motion.div>
  )
}
