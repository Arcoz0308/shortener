<script lang="ts">
	import QRCode from 'qrcode'
	import { Button } from '$lib/components/ui/button'
	import { toast } from 'svelte-sonner'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { Badge } from '$lib/components/ui/badge'

	export let background = '#fff'
	export let color = '#000'
	export let value = ''
	export let code = ''

	let image = ''

	const copyImageToClipboard = async () => {
		if (!image) return

		const imageData = await fetch(image)

		const imageBlob = await imageData.blob()

		try {
			navigator.clipboard.write([
				new ClipboardItem({
					'image/png': imageBlob,
				}),
			])
			toast.success('Copied Image To Clipboard')
		} catch (error) {
			toast.error(
				'Unable to copy item to clipboard. If you are using firefox, you can change the setting dom.events.asyncclipboard.clipboarditem in about:config to true',
			)
		}
	}

	async function generateQrCode() {
		try {
			image = await QRCode.toDataURL(value, {
				errorCorrectionLevel: 'L',
				margin: 1,
				scale: 20,
				color: {
					light: background,
					dark: color,
				},
			})
		} catch (e) {
			image = await QRCode.toDataURL(value, {
				errorCorrectionLevel: 'L',
				margin: 1,
				scale: 20,
			})
		}
	}

	$: {
		if (value) {
			generateQrCode()
		}
	}
</script>

<div class="flex flex-col gap-4 items-center h-full">
	<Badge variant="secondary">
		{value}
	</Badge>
	<img src={image} alt={value} width={300} height={300} />
	<div class="flex gap-4 w-full">
		<Button class="w-full" on:click={copyImageToClipboard}
			>Copy Image</Button>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]} class="w-full">QR Link</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Item
					href={`/api/shortener/${code}/qr`}
					target="_blank">Standard</DropdownMenu.Item>
				<DropdownMenu.Item
					href={`/api/shortener/${code}/qr?color=true`}
					target="_blank">With Color</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</div>
