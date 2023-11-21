import type { PageServerLoad, Actions } from './$types'
import { fail } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'
import { formSchema } from './schema'
import { db } from '$lib/db'
import { user as userSchema } from '$lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import * as argon2 from 'argon2'

export const load = (async () => {
	return {
		form: superValidate(formSchema),
	}
}) satisfies PageServerLoad

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, formSchema)

		if (!form.valid) {
			return fail(400, {
				form,
			})
		}

		if (form.data.password !== form.data.password_confirm) {
			return fail(400, {
				form,
			})
		}

		try {
			const users = await db
				.select()
				.from(userSchema)
				.where(eq(userSchema.email, form.data.email))

			const user = users[0]

			if (!user) {
				// const hashedPassword = await Bun.password.hash(form.data.password)
				const hashedPassword = await argon2.hash(form.data.password)
				await db.insert(userSchema).values({
					email: form.data.email,
					password: hashedPassword,
				})
				const token = nanoid(32)
				event.cookies.set('token', token, {
					httpOnly: true,
					sameSite: 'strict',
					path: '/',
				})
				return {
					form,
				}
			} else {
				return fail(400, {
					form,
				})
			}
		} catch (error) {
			console.log(error)
			if (error instanceof SyntaxError) {
				return fail(400, {
					form,
				})
			} else {
				console.log(error)
				return fail(400, {
					form,
				})
			}
		}
	},
}