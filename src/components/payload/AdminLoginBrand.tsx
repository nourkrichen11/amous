import Image from 'next/image'

export function AdminLoginBrand() {
  return (
    <div className="amous-login-brand">
      <div className="amous-login-brand__logo">
        <Image alt="AMOUS" height={44} priority src="/logo2.png" style={{ height: 'auto' }} width={116} />
      </div>
      <p className="amous-login-brand__title">Administration AMOUS</p>
      <p className="amous-login-brand__description">Connectez-vous pour gerer la boutique.</p>
    </div>
  )
}

export function AdminLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image alt="AMOUS" height={28} priority src="/logo2.png" style={{ height: 'auto' }} width={74} />
    </div>
  )
}

export function AdminIcon() {
  return <span className="amous-admin-icon">A</span>
}
