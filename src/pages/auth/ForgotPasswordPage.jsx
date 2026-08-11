import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/auth/layout/AuthLayout'
import AuthCard from '@/components/auth/ui/AuthCard'
import AuthButton from '@/components/auth/ui/AuthButton'
import AuthMiniFooter from '@/components/auth/ui/AuthMiniFooter'
import { AuthInput } from '@/components/auth/ui/AuthInput'
import ScholaOneLogo from '@/components/brand/ScholaOneLogo'
import SEO from '@/components/seo/SEO'
import { FiMail } from 'react-icons/fi'
import '@/components/auth/auth.css'

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const onSubmit = async () => {
    toast.success('If an account exists, reset instructions have been sent.')
  }

  return (
    <>
      <SEO title="Forgot password | ScholaOne" noIndex />
      <AuthLayout>
      <AuthCard>
        <Link to="/" className="auth-form-logo auth-form-logo-link mb-4" aria-label="Go to ScholaOne website">
          <ScholaOneLogo
            variant="full"
            size="2xl"
            className="mx-auto w-full justify-center"
            imageClassName="mx-auto max-h-28 object-contain"
          />
        </Link>
        <div className="mb-5 text-center">
          <h2 className="auth-form-title">Forgot password</h2>
          <p className="auth-form-subtitle mt-2">
            Enter your email and we&apos;ll send reset instructions.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form-fields">
          <AuthInput
            id="forgot-email"
            label="Email"
            type="email"
            icon={FiMail}
            {...register('email', { required: true })}
          />
          <AuthButton type="submit" loading={isSubmitting} variant="primary">
            Send reset link
          </AuthButton>
          <Link to="/login" className="auth-login-link block text-center">
            Back to login
          </Link>
        </form>
        <AuthMiniFooter />
      </AuthCard>
    </AuthLayout>
    </>
  )
}
