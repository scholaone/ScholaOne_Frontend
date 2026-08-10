import { AuthBackgroundFade } from './AuthBackground'

export default function AuthLayout({ hero, children }) {
  const isSplit = Boolean(hero)

  return (
    <AuthBackgroundFade>
      <div className="auth-split-shell">
        <div className={`auth-split-card ${isSplit ? '' : 'auth-split-card--solo'}`}>
          {hero && <div className="auth-split-card__brand">{hero}</div>}
          <div className="auth-split-card__form">{children}</div>
        </div>
      </div>
    </AuthBackgroundFade>
  )
}
