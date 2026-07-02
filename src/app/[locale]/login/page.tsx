import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/authOptions'
import { LoginForm } from './LoginForm'

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()

  if (session) redirect(`/${locale}/board`)

  return <LoginForm />
}
