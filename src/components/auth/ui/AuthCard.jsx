import { motion } from 'framer-motion'

export default function AuthCard({ children, className = '' }) {
  return (
    <motion.div
      className={`auth-login-card auth-platinum-card w-full ${className}`}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
