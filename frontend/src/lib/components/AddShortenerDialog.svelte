<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import * as Select from '$lib/components/ui/select'
	import { Button, buttonVariants } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import { Loader2, PlusCircle } from 'lucide-svelte'
	import { invalidateAll } from '$app/navigation'
	import { toast } from 'svelte-sonner'
	import type { Project } from '$lib/db/types'

	export let projects: Project[]
	export let dialogOpen: boolean
	let inputLink = ''
	let isLoading = false

	const addShortener = async () => {
		isLoading = true

		const response = await fetch('/api/shortener', {
			method: 'post',
			body: JSON.stringify({
				link: inputLink,
				projectId: shortenerCategory
					? shortenerCategory.value
					: undefined,
			}),
		})

		const responseData = await response.json()

		isLoading = false

		if (responseData.success) {
			toast.success('Successfully Created Shortener')
			await invalidateAll()
			dialogOpen = false
		}
	}

	let inputTimer: any
	let previewData: any
	let isPreviewLoading: boolean = false
	let shortenerCategory: any = undefined

	const getMetadata = async () => {
		isPreviewLoading = true
		clearTimeout(inputTimer)
		inputTimer = setTimeout(async () => {
			const response = await fetch(
				`/api/url/metadata?url=${inputLink}`,
			)
			previewData = await response.json()
			isPreviewLoading = false
			console.log(previewData)
		}, 1000)
	}
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger
		class={buttonVariants({ variant: 'default' }) + 'flex gap-2'}>
		<PlusCircle />
		Add Shortner
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Add Shortener</Dialog.Title>
			<Dialog.Description>
				Create A New Shortner Here. Click Add To Save.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-8 py-4">
			<div class="grid grid-cols-4 gap-4 items-center">
				<Label>Link</Label>
				<Input
					id="name"
					on:input={() => getMetadata()}
					bind:value={inputLink}
					placeholder="https://example.com"
					class="col-span-3" />
			</div>
			<div class="grid grid-cols-4 gap-4 items-center">
				<Label>Category</Label>
				<Select.Root
					bind:selected={shortenerCategory}
					multiple={false}>
					<Select.Trigger class="col-span-3">
						<Select.Value placeholder="Select a Category" />
					</Select.Trigger>
					<Select.Content>
						{#each projects as project}
							<Select.Item value={project.id}
								>{project.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="grid grid-cols-4 gap-4 items-center">
				<div class="font-bold">Preview</div>
				<div class="flex flex-col col-span-4 justify-center border">
					<div class="overflow-hidden relative h-64">
						{#if isPreviewLoading}
							<div class="flex justify-center items-center h-full">
								<Loader2 class="animate-spin" />
							</div>
						{:else if previewData}
							<img
								src={previewData.image}
								alt=""
								class="object-cover w-full h-64" />
							<div
								class="absolute bottom-2 left-2 px-2 rounded-lg bg-secondary">
								{previewData.title}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button on:click={addShortener} class="flex gap-2">
				{#if isLoading}
					<Loader2 class="animate-spin" />
				{/if}
				Add
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
