import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/api/client'
import { API_BASE_URL } from '@/config/constants'
import AuthLayout from '@/components/auth/layout/AuthLayout'
import SignInHero from '@/components/auth/sign-in/SignInHero'
import SignInCard from '@/components/auth/sign-in/SignInCard'
import SEO from '@/components/seo/SEO'
import '@/components/auth/auth.css'

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '', rememberMe: false } })

  useEffect(() => {
    if (!API_BASE_URL) return undefined
    void fetch(`${API_BASE_URL}/api/v1/health/`, { method: 'GET', mode: 'cors', keepalive: true }).catch(
      () => {},
    )
    return undefined
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const root = document.getElementById('root')
    html.classList.add('overflow-hidden', 'h-full')
    body.classList.add('overflow-hidden', 'h-full')
    root?.classList.add('h-full', 'overflow-hidden')
    return () => {
      html.classList.remove('overflow-hidden', 'h-full')
      body.classList.remove('overflow-hidden', 'h-full')
      root?.classList.remove('h-full', 'overflow-hidden')
    }
  }, [])

  const onSubmit = async (data) => {
    try {
      await login({ email: data.email, password: data.password }, data.rememberMe)
      navigate('/dashboard', { replace: true })
      window.setTimeout(() => toast.success('Welcome back!', { duration: 2000 }), 0)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Invalid credentials'))
    }
  }

  return (
    <>
      <SEO title="Sign in | ScholaOne" noIndex />
      <AuthLayout hero={<SignInHero />}>
        <SignInCard
          register={register}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          errors={errors}
          isSubmitting={isSubmitting || isLoading}
        />
      </AuthLayout>
    </>
  )
}
