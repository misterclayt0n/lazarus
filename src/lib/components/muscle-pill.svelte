<script lang="ts">
	import { cn } from '$lib/utils';
	import { muscleLabel } from '$lib/domain/muscles';
	import type { Priority } from '$lib/domain/muscles';

	let {
		muscleGroup,
		priority,
		class: className
	}: { muscleGroup: string; priority?: Priority; class?: string } = $props();
</script>

<span
	class={cn(
		'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
		priority === 'secondary'
			? 'border-border bg-muted/40 text-muted-foreground'
			: priority === 'primary'
				? 'border-primary/30 bg-primary/10 text-primary'
				: 'border-border bg-muted/40 text-muted-foreground',
		className
	)}
>
	{#if priority}
		<span
			class={cn(
				'size-1.5 rounded-full',
				priority === 'primary' ? 'bg-primary' : 'bg-muted-foreground/60'
			)}
		></span>
	{/if}
	{muscleLabel(muscleGroup)}
</span>
