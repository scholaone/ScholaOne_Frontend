import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock } from 'react-icons/fi'
import { AuthInput, AuthPasswordInput } from '../ui/AuthInput'
import AuthButton from '../ui/AuthButton'
import AuthMiniFooter from '../ui/AuthMiniFooter'
import ScholaOneLogo from '@/components/brand/ScholaOneLogo'

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.06, duration: 0.35 },
  }),
}

export default function SignInCard({
  register,
  handleSubmit,
  onSubmit,
  errors,
  isSubmitting,
}) {
  return (
    <motion.div
      className="auth-form-panel"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Link to="/" className="auth-form-logo auth-form-logo-link" aria-label="Go to ScholaOne website">
        <ScholaOneLogo
          variant="full"
          size="3xl"
          className="mx-auto w-full justify-center"
          imageClassName="mx-auto w-full max-w-[200px] sm:max-w-[220px] md:max-w-[260px] max-h-28 sm:max-h-32 md:max-h-36 object-contain"
        />
      </Link>

      <header className="auth-form-header text-center">
        <h2 className="auth-form-title">Sign in</h2>
        <p className="auth-form-subtitle">Enter your credentials to continue</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form-fields" noValidate>
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <AuthInput
            id="signin-email"
            label="Email"
            type="email"
            icon={FiMail}
            autoComplete="email"
            inputMode="email"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email',
              },
            })}
          />
        </motion.div>

        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
          <AuthPasswordInput
            id="signin-password"
            label="Password"
            icon={FiLock}
            autoComplete="current-password"
            showTextToggle
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
        </motion.div>

        <motion.div
          className="auth-form-row"
          custom={2}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="auth-login-remember flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" className="auth-login-checkbox" {...register('rememberMe')} />
            Remember me
          </label>
          <Link to="/forgot-password" className="auth-login-link">
            Forgot password?
          </Link>
        </motion.div>

        <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
          <AuthButton type="submit" loading={isSubmitting} variant="primary">
            Sign in
          </AuthButton>
        </motion.div>
      </form>

      <AuthMiniFooter />
    </motion.div>
  )
}
