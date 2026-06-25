<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LucideIcon } from '@lucide/svelte';

	let {
		icon,
		title,
		description,
		action
	}: { icon?: LucideIcon; title: string; description?: string; action?: Snippet } = $props();

	const IconComp = $derived(icon);
</script>

<div
	class="border-border/70 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center"
>
	{#if IconComp}
		<div class="bg-muted text-muted-foreground mb-4 grid size-12 place-items-center rounded-full">
			<IconComp class="size-6" />
		</div>
	{/if}
	<p class="text-base font-semibold">{title}</p>
	{#if description}
		<p class="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>
	{/if}
	{#if action}
		<div class="mt-5">{@render action()}</div>
	{/if}
</div>
