import Image from 'next/image'

export function AdminLoginBrand() {
  return (
    <div className="amous-login-brand">
      <div className="amous-login-brand__logo">
        <Image alt="AMOUS" height={44} priority src="/logo2.jpg" style={{ height: 'auto' }} width={116} />
      </div>
      <p className="amous-login-brand__title">Administration AMOUS</p>
      <p className="amous-login-brand__description">Connectez-vous pour gerer la boutique.</p>
    </div>
  )
}

export function AdminLogo() {
  return (
    <div className="amous-admin-nav__logo">
      <Image alt="AMOUS" className="amous-admin-nav__logo-image" height={44} priority src="/logo2.jpg" style={{ height: 'auto' }} width={168} />
    </div>
  )
}

export function AdminIcon() {
  return <span className="amous-admin-icon">A</span>
}
