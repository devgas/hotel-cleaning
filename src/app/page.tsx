import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BarChart3,
  Building2,
  CalendarCheck,
  Lightbulb,
  LogIn,
  Mail,
  MessageCircle,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { DemoRequestForm } from '@/components/marketing/DemoRequestForm'

const contactEmail = 'hotel.cleaning.app.info@gmail.com'

const features = [
  {
    title: 'Suggest new features',
    text: 'Share your ideas to make the hotel cleaning app better for real housekeeping teams.',
    icon: Lightbulb,
  },
  {
    title: 'Share your suggestions',
    text: 'Feedback helps shape cleaner room boards, task tracking, and hotel team workflows.',
    icon: MessageCircle,
  },
  {
    title: 'Get implementation support',
    text: 'Want to use this solution in your hotel or business? We can discuss a tailored setup.',
    icon: BarChart3,
  },
  {
    title: "Let's work together",
    text: 'Open to collaboration, implementation support, and practical product improvements.',
    icon: Mail,
  },
]

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hotel-cleaning.vercel.app'

const plerdyCode = `
var _protocol="https:"==document.location.protocol?"https://":"http://";
_site_hash_code = "cd7ba2331e2dc8f6ae8f48a5fc0e03f8",_suid=78161, plerdyScript=document.createElement("script");
plerdyScript.setAttribute("defer",""),plerdyScript.dataset.plerdymainscript="plerdymainscript",
plerdyScript.src="https://a.plerdy.com/public/js/click/main.js?v="+Math.random();
var plerdymainscript=document.querySelector("[data-plerdymainscript='plerdymainscript']");
plerdymainscript&&plerdymainscript.parentNode.removeChild(plerdymainscript);
try{document.head.appendChild(plerdyScript)}catch(t){console.log(t,"unable add script tag")}
`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Hotel Cleaning Management Solution | Housekeeping App',
  description:
    'Hotel Cleaning is a test and demonstration housekeeping management app for room cleaning boards, task status tracking, hotel team coordination, and PWA installation.',
  keywords: [
    'hotel cleaning management',
    'hotel housekeeping app',
    'housekeeping management software',
    'room cleaning app',
    'hotel cleaning tasks',
    'cleaning board app',
    'PWA housekeeping app',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Hotel Cleaning Management Solution',
    description:
      'A test housekeeping management application for room cleaning boards, task tracking, and hotel team workflows.',
    type: 'website',
    images: [
      {
        url: '/hotel-cleaning-app-icon.png',
        width: 1536,
        height: 1024,
        alt: 'Hotel Cleaning application icon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Cleaning Management Solution',
    description: 'A test housekeeping management app for hotels and cleaning teams.',
    images: ['/hotel-cleaning-app-icon.png'],
  },
}

export default function Home() {
  return (
    <>
      <main className="min-h-screen overflow-hidden bg-[#f7faf9] text-[#071a3a]">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Hotel Cleaning',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web, iOS, Android',
            description:
              'A test housekeeping management application for hotel room cleaning boards, task status tracking, and team coordination.',
            email: contactEmail,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />

      <section className="relative isolate min-h-screen px-5 py-5 sm:px-8 lg:px-12 lg:py-10">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.95),transparent_32%),linear-gradient(110deg,#ffffff_0%,#f7fbfa_43%,#ead2b3_100%)]" />
        <img
          src="/hotel-cleaning-desktop-bg.png"
          alt="Hotel Cleaning Management application concept with mobile dashboard and cleaning cart"
          width="1536"
          height="1024"
          fetchPriority="high"
          className="absolute inset-0 -z-10 hidden h-full w-full object-cover object-right opacity-95 lg:block"
        />
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-white via-white/90 to-white/20 lg:block" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/95 via-white/75 to-[#f7faf9]/95 lg:hidden" />

        <nav className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label="Hotel Cleaning home">
            <img
              src="/hotel-cleaning-app-icon.png"
              alt=""
              width="1024"
              height="1024"
              className="h-14 w-14 rounded-2xl object-cover shadow-[0_16px_35px_rgba(0,77,77,0.24)] sm:h-16 sm:w-16"
              aria-hidden="true"
            />
            <span className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-[#097f78] sm:block">
              Hotel Cleaning
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#request-demo"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#071a3a] px-5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(8,55,70,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0b244c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
            >
              Request a demo
            </a>
            <Link
              href="/uk/login"
              aria-label="Login to Hotel Cleaning"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#087b73]/20 bg-white/85 text-[#061b39] shadow-[0_12px_30px_rgba(8,55,70,0.14)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
            >
              <LogIn className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid min-h-[calc(100vh-5.75rem)] w-full max-w-[1360px] items-center gap-8 py-8 lg:grid-cols-1 lg:py-6">
          <div className="max-w-6xl">
            <div className="mb-6 h-1 w-36 rounded-full bg-[#0b9d95]" />
            <h1 className="max-w-none text-3xl font-black leading-[1.08] tracking-normal text-[#071a3a] sm:text-4xl md:text-5xl lg:text-[34px] xl:whitespace-nowrap xl:text-[40px] 2xl:text-[48px]">
              Looking for a <span className="text-[#087f75]">Hotel Cleaning Management Solution?</span>
            </h1>
            <img
              src="/hotel-cleaning-mobile-bg.png"
              alt="Hotel cleaning mobile app preview with housekeeping cart"
              width="1024"
              height="1792"
              fetchPriority="high"
              className="mt-5 aspect-[4/7] h-auto w-full rounded-3xl border border-white/80 object-cover shadow-[0_18px_48px_rgba(8,49,67,0.18)] lg:hidden"
            />
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#193051] sm:text-xl">
              A test housekeeping management application for room cleaning boards, task status tracking,
              team coordination, and practical hotel operations feedback.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#request-demo"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#071a3a] px-6 py-4 text-base font-extrabold text-white shadow-[0_16px_36px_rgba(7,26,58,0.2)] transition hover:-translate-y-0.5 hover:bg-[#0b244c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
              >
                <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                Request a demo
              </a>
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-[#087b73]/25 bg-white/80 px-6 py-4 text-base font-bold text-[#071a3a] shadow-[0_12px_28px_rgba(8,55,70,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
                Contact us
              </a>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:max-w-2xl lg:grid-cols-1">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <article key={feature.title} className="grid grid-cols-[3.5rem_1fr] gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#10b3a5] to-[#04756d] text-white shadow-[0_14px_28px_rgba(5,120,112,0.22)]">
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold leading-7 text-[#071a3a]">{feature.title}</h2>
                      <p className="mt-1 text-base leading-7 text-[#102649]">{feature.text}</p>
                    </div>
                  </article>
                )
              })}
            </div>

            <aside className="mt-8 grid max-w-2xl grid-cols-[3.25rem_1fr] gap-4 rounded-2xl border border-[#bde7e0] bg-[#e8fbf8]/90 p-4 shadow-[0_18px_40px_rgba(15,118,110,0.12)] backdrop-blur">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#0c9d92] to-[#075260] text-white">
                <ShieldCheck className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#071a3a]">This is a Test Application</h2>
                <p className="mt-1 text-sm leading-6 text-[#102649] sm:text-base">
                  This application is currently a test and demonstration project and is not intended for commercial use.
                </p>
              </div>
            </aside>
          </div>
        </div>

        <section className="mx-auto mb-3 flex w-full max-w-[1360px] flex-col gap-5 rounded-3xl bg-gradient-to-r from-[#057468] to-[#008b83] p-5 text-white shadow-[0_22px_50px_rgba(0,98,90,0.25)] sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center lg:max-w-2xl">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-[#057468]">
              <Mail className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="min-w-0 text-base leading-7 sm:text-lg">
              If you have ideas, suggestions, feedback, or would like to discuss implementing this solution in your business, please contact us:
            </p>
          </div>
          <a
            href={`mailto:${contactEmail}`}
            className="max-w-full text-xl font-black leading-tight text-white underline underline-offset-4 [overflow-wrap:anywhere] transition hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:text-2xl lg:text-3xl"
          >
            {contactEmail}
          </a>
        </section>

        <section
          id="request-demo"
          className="mx-auto mb-8 grid w-full max-w-[1360px] gap-6 rounded-3xl border border-[#d5ebe7] bg-white/95 p-5 shadow-[0_24px_60px_rgba(8,49,67,0.12)] scroll-mt-6 sm:p-7 lg:grid-cols-[0.9fr_1.1fr] lg:p-8"
        >
          <div className="flex flex-col justify-between gap-6">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e8fbf8] px-4 py-2 text-sm font-bold text-[#057468]">
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                Tailored walkthrough
              </div>
              <h2 className="max-w-xl text-3xl font-black leading-tight text-[#071a3a] sm:text-4xl">
                Request a demo for your hotel cleaning workflow
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#193051] sm:text-lg">
                Share how your rooms, checkouts, stayovers, and team handoffs work today. The demo can focus on the board setup that matches your operation instead of a generic product tour.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="grid grid-cols-[2.75rem_1fr] gap-3 rounded-2xl bg-[#f5fbfa] p-4">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#057468] shadow-sm">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-sm leading-6 text-[#102649]">Hotel size and room mix</p>
              </div>
              <div className="grid grid-cols-[2.75rem_1fr] gap-3 rounded-2xl bg-[#f5fbfa] p-4">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#057468] shadow-sm">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-sm leading-6 text-[#102649]">Team roles and shift handoff</p>
              </div>
              <div className="grid grid-cols-[2.75rem_1fr] gap-3 rounded-2xl bg-[#f5fbfa] p-4">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#057468] shadow-sm">
                  <BarChart3 className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-sm leading-6 text-[#102649]">Priority rooms and status tracking</p>
              </div>
            </div>
          </div>

          <DemoRequestForm />
        </section>
      </section>
      </main>
      <script
        type="text/javascript"
        defer
        data-plerdy_code="1"
        dangerouslySetInnerHTML={{ __html: plerdyCode }}
      />
    </>
  )
}
