import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { emailOTP } from 'better-auth/plugins'
import { prisma } from './prisma'
import { resend } from './resend'
import { RESEND_FROM } from 'astro:env/server'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: RESEND_FROM,
        to: user.email,
        subject: 'Verify your email',
        html: `Hey! Click the link to verify your email: ${url}<br /><br /><strong>it will expire in 1 hour</strong>`,
      })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await resend.emails.send({
          from: RESEND_FROM,
          to: email,
          subject: 'Verify your email',
          html: `Your ${type} verification code is: ${otp}`,
        })
      },
    }),
  ],
})
