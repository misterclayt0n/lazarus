<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';

	let {
		open = $bindable(false),
		title,
		description,
		children,
		footer
	}: {
		open?: boolean;
		title: string;
		description?: string;
		children: Snippet;
		footer?: Snippet;
	} = $props();

	const isMobile = new IsMobile();
</script>

{#if isMobile.current}
	<Drawer.Root bind:open>
		<Drawer.Content>
			<Drawer.Header class="text-left">
				<Drawer.Title>{title}</Drawer.Title>
				{#if description}<Drawer.Description>{description}</Drawer.Description>{/if}
			</Drawer.Header>
			<div class="max-h-[70svh] overflow-y-auto px-4 pb-2">
				{@render children()}
			</div>
			{#if footer}<Drawer.Footer>{@render footer()}</Drawer.Footer>{/if}
		</Drawer.Content>
	</Drawer.Root>
{:else}
	<Dialog.Root bind:open>
		<Dialog.Content class="sm:max-w-lg">
			<Dialog.Header>
				<Dialog.Title>{title}</Dialog.Title>
				{#if description}<Dialog.Description>{description}</Dialog.Description>{/if}
			</Dialog.Header>
			<div class="max-h-[70svh] overflow-y-auto">
				{@render children()}
			</div>
			{#if footer}<Dialog.Footer>{@render footer()}</Dialog.Footer>{/if}
		</Dialog.Content>
	</Dialog.Root>
{/if}
