import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/libs/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // 1. Atualiza os cookies (código da Fase 1)
  const response = await updateSession(request)

  // 2. Verifica a autenticação atual do usuário
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() { /* Manipulação já feita no updateSession */ },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 3. Regras de Redirecionamento
  const isAuthRoute = request.nextUrl.pathname === '/admin/login'
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin/painel') && !isAuthRoute

  // Se tenta acessar o painel sem estar logado, joga para o login
  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Se já está logado e tenta acessar a tela de login, joga para o painel
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/admin/painel', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}