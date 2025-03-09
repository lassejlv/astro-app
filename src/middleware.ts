import { defineMiddleware } from 'astro:middleware'
import { auth } from './lib/auth'

// `context` and `next` are automatically typed
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url

  if (!pathname.includes('app')) return next()

  const session = await auth.api.getSession({ headers: context.request.headers })

  if (!session) return context.redirect('/auth/login')

  if (pathname.includes('auth') && session) return context.redirect('/app')

  context.locals.session = session.session
  context.locals.user = session.user

  return next()
})
