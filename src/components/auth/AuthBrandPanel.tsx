import { ShieldCheck, Truck, Wrench } from 'lucide-react'
import Image from 'next/image'

const benefits = [
  {
    description: 'Des équipements et consommables choisis pour durer sur vos chantiers et dans vos ateliers.',
    icon: ShieldCheck,
    title: 'Produits de qualité'
  },
  {
    description: 'Une équipe qui vous aide à choisir les bons outils et les bonnes références.',
    icon: Wrench,
    title: 'Conseils d’experts'
  },
  {
    description: 'Une expérience simple pour commander rapidement et suivre vos demandes sans friction.',
    icon: Truck,
    title: 'Service rapide et fiable'
  }
] as const

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[#061F4A] text-white lg:flex lg:flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(227,30,36,0.16),_transparent_34%),linear-gradient(135deg,_rgba(7,86,201,0.18),_transparent_45%)]" />
      <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
      <div className="absolute inset-x-0 bottom-0 h-72 overflow-hidden opacity-25">
        <Image
          alt="Façade du magasin Amous"
          className="h-full w-full object-cover object-center"
          fill
          sizes="42vw"
          src="/hero1.jpg"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061F4A] via-[#061F4A]/88 to-transparent" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center gap-5 p-8 2xl:gap-6 2xl:p-10">
        <div>
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-2xl border border-white/12 bg-white/6 shadow-[0_18px_44px_rgba(0,0,0,0.16)] 2xl:h-[130px] 2xl:w-[130px]">
            <Image alt="Logo Amous" className="h-auto w-[88px] 2xl:w-[112px]" height={44} priority src="/logo2.jpg" width={112} />
          </div>

          <div className="mt-4 space-y-2 2xl:mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">Votre espace client</p>
            <h2 className="max-w-sm text-[26px] font-semibold leading-tight 2xl:text-[28px]">ETS Amous d’Équipement</h2>
            <p className="text-base font-medium text-[#D9E7FF]">Quincaillerie générale</p>
            <p className="line-clamp-3 max-w-md text-sm leading-5 text-white/78">
              Accédez à votre compte pour suivre vos commandes, gérer vos informations de livraison et retrouver
              rapidement les produits adaptés à vos besoins.
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          {benefits.map(({ description, icon: Icon, title }) => (
            <div
              className="rounded-xl border border-white/10 bg-white/6 p-2.5 backdrop-blur-[2px]"
              key={title}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#E31E24] text-white shadow-[0_10px_24px_rgba(227,30,36,0.28)]">
                  <Icon size={18} />
                </span>
                <p className="text-sm font-semibold">{title}</p>
              </div>
              <p className="sr-only">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
