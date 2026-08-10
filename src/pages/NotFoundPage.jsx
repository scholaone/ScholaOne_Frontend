import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import { PageHeader, Card } from '@/components/ui/Card'
import { SEO_ROBOTS_NOINDEX } from '@/config/seo'
import usePageMeta from '@/hooks/usePageMeta'

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth()
  const home = isAuthenticated ? '/dashboard' : '/login'

  usePageMeta({
    title: 'Page not found | ScholaOne',
    robots: SEO_ROBOTS_NOINDEX,
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full text-center">
        <p className="text-6xl font-bold text-primary/20">404</p>
        <PageHeader title="Page not found" subtitle="The page you requested does not exist in this app." />
        <Link to={home}>
          <Button className="w-full">Go to {isAuthenticated ? 'Dashboard' : 'Login'}</Button>
        </Link>
      </Card>
    </div>
  )
}
