import type { PageServerLoad, Actions } from './$types'
import { fail } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms'
import { formSchema } from './schema'
import { zod } from 'sveltekit-superforms/adapters'
import { db } from '$lib/db'
import { user as userSchema } from '$lib/db/schema'
import { eq } from 'drizzle-orm'
import { lucia } from '$lib/server/auth'
import { env } from '$env/dynamic/private'

export const load = (async (event) => {
	return {
		form: await superValidate(zod(formSchema)),
	}
}) satisfies PageServerLoad

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema))
		if (!form.valid) {
			return fail(400, {
				form,
			})
		}

		const users = await db
			.select()
			.from(userSchema)
			.where(eq(userSchema.email, form.data.email))

		const user = users[0]

		const matchPassword =
			user &&
			(await Bun.password.verify(form.data.password, user.password))

		if (!user || !matchPassword) {
			return setError(form, 'email', 'Invalid credentials')
		}

		const session = await lucia.createSession(user.id, {})
		const sessionCookie = lucia.createSessionCookie(session.id)

		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			...sessionCookie.attributes,
			path: '/',
			secure: env.APP_ENV === 'prod',
		})

		return {
			form,
		}
	},
}
