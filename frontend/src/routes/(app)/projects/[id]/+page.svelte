<script lang="ts">
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'

	import ShortenerCard from './(components)/ShortenerCard.svelte'
	import { Button } from '$lib/components/ui/button'
	import { Skeleton } from '$lib/components/ui/skeleton'
	import { Input } from '$lib/components/ui/input'
	import * as Select from '$lib/components/ui/select'
	import * as Dialog from '$lib/components/ui/dialog'

	import { SortDescIcon } from 'lucide-svelte'

	import type { PageData } from './$types'
	import { ScrollArea } from '$lib/components/ui/scroll-area'
	import * as Pagination from '$lib/components/ui/pagination'
	import Form from './(components)/form.svelte'
	import EditProjectLinkPage from './links/[linkid]/edit/+page.svelte'
	import ProjectLinkQRPage from './links/[linkid]/qr/+page.svelte'

	export let data: PageData

	let dialogOpen = false

	let search: string | null = data.search
	let searchUpdateTimeout: any

	$: browser &&
		goto(updateSearchParam([{ name: 'search', value: search }]))

	const updateSearchParam = (
		params: { name: string; value: any }[],
	) => {
		const urlParams = new URLSearchParams(window.location.search)
		params.map(({ name, value }) => {
			if (value) {
				urlParams.set(name, value)
			} else {
				urlParams.delete(name)
			}
		})
		const searchParams = urlParams.toString()
		if (searchParams) {
			return `/projects/${data.selectedProject.uuid}?` + searchParams
		} else {
			return '/projects/' + data.selectedProject.uuid
		}
	}

	let editProjectLinkOpen = false

	$: editProjectLinkOpen = !!$page.state.editProjectLink
	$: projectLinkQROpen = !!$page.state.projectLinkQR
</script>

<div
	class="flex flex-wrap-reverse gap-4 justify-start items-center py-4 px-10">
	<div class="flex gap-4 items-center">
		<Select.Root
			selected={{ label: data.sortBy, value: data.sortBy }}>
			<Select.Trigger class="w-[180px]" customIcon={SortDescIcon}>
				<Select.Value placeholder="Sort By" />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Label>Sort By</Select.Label>
					{#each ['latest', 'oldest', 'most_visited'] as sortBy}
						<a
							href={updateSearchParam([
								{ name: 'sortBy', value: sortBy },
								{ name: 'page', value: 1 },
							])}>
							<Select.Item value={sortBy} label={sortBy}>
								{sortBy}
							</Select.Item>
						</a>
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input name="favoriteFruit" />
		</Select.Root>
	</div>
	<div class="flex gap-4 items-center">
		<Input
			type="text"
			placeholder="search"
			class="max-w-[250px]"
			autofocus
			value={search}
			on:input={({ target }) => {
				clearTimeout(searchUpdateTimeout)
				searchUpdateTimeout = setTimeout(() => {
					search = target.value
				}, 500)
			}} />
		<Button disabled={!search} on:click={() => (search = '')}
			>Clear</Button>
		<Form bind:dialogOpen data={data.form} />
	</div>
</div>

{#await data.shorteners}
	<div class="flex flex-wrap gap-4 py-4 px-10">
		{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as _}
			<Skeleton class="rounded-lg h-[150px] w-[500px]" />
		{/each}
	</div>
{:then shorteners}
	{#if shorteners.length > 0}
		<ScrollArea class="flex-grow">
			<div class="flex flex-wrap gap-4 py-4 px-10">
				{#each shorteners as shortener}
					<ShortenerCard
						{shortener}
						selected_project={data.selectedProject}
						shortener_url={data.shortener_url}
						settings={data.settings} />
				{/each}
			</div>
		</ScrollArea>
	{:else}
		<div class="flex flex-grow py-4 px-10">
			<div
				class="flex flex-1 justify-center items-center rounded-lg border border-dashed shadow-sm">
				<div
					class="flex flex-grow justify-center items-center w-full">
					<div class="flex flex-col gap-8 items-center">
						<div class="flex flex-col gap-2 items-center">
							<div class="text-4xl font-bold">No Shortener Found</div>
							<p class="text-muted-foreground">Add a new shortener</p>
						</div>
						<Button
							on:click={() => {
								dialogOpen = true
							}}
							class="w-fit">Add Shortener</Button>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/await}

{#await data.pagination then pagination}
	<div class="flex justify-between items-center p-4 border-t">
		<Select.Root
			selected={{ label: data.perPage, value: data.perPage }}>
			<Select.Trigger class="w-[180px]">
				<Select.Value placeholder="Page Size" />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Label>Page Size</Select.Label>
					{#each [12, 24, 48, 96] as pageSize}
						<a
							href={updateSearchParam([
								{
									name: 'perPage',
									value: pageSize,
								},
								{
									name: 'page',
									value: 1,
								},
							])}>
							<Select.Item
								value={pageSize}
								label={pageSize.toString()}>{pageSize}</Select.Item>
						</a>
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input name="favoriteFruit" />
		</Select.Root>
		<Pagination.Root
			class="items-end"
			count={pagination[0].total}
			page={data.page}
			perPage={data.perPage}
			let:pages
			let:currentPage>
			<Pagination.Content>
				{#if data.page <= 1}
					<Pagination.Item>
						<Pagination.PrevButton />
					</Pagination.Item>
				{:else}
					<a
						href={updateSearchParam([
							{
								name: 'page',
								value: data.page - 1,
							},
						])}>
						<Pagination.Item>
							<Pagination.PrevButton />
						</Pagination.Item>
					</a>
				{/if}
				{#each pages as page (page.key)}
					{#if page.type === 'ellipsis'}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<a
							href={updateSearchParam([
								{
									name: 'page',
									value: page.value,
								},
							])}>
							<Pagination.Item isVisible={currentPage == page.value}>
								<Pagination.Link
									{page}
									isActive={currentPage == page.value}>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						</a>
					{/if}
				{/each}
				{#if data.page >= pagination[0].total / data.perPage}
					<Pagination.Item>
						<Pagination.NextButton />
					</Pagination.Item>
				{:else}
					<a
						href={updateSearchParam([
							{
								name: 'page',
								value: data.page + 1,
							},
						])}>
						<Pagination.Item>
							<Pagination.NextButton />
						</Pagination.Item>
					</a>
				{/if}
			</Pagination.Content>
		</Pagination.Root>
	</div>
{/await}

<Dialog.Root
	bind:open={editProjectLinkOpen}
	onOpenChange={(open) => {
		if (!open) {
			history.back()
		}
	}}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Shortener</Dialog.Title>
			<Dialog.Description>
				Edit Shortener Here. Click Save To Save.
			</Dialog.Description>
		</Dialog.Header>
		<ScrollArea class="max-h-[calc(100vh-200px)]">
			<EditProjectLinkPage
				data={$page.state.editProjectLink}
				shallowRouting />
		</ScrollArea>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root
	bind:open={projectLinkQROpen}
	onOpenChange={(open) => {
		if (!open) {
			history.back()
		}
	}}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Shortener QR</Dialog.Title>
			<Dialog.Description>
				Use this QR code to share the shortener.
			</Dialog.Description>
		</Dialog.Header>
		<ScrollArea class="max-h-[calc(100vh-200px)]">
			<ProjectLinkQRPage
				data={$page.state.projectLinkQR}
				shallowRouting />
		</ScrollArea>
	</Dialog.Content>
</Dialog.Root>
