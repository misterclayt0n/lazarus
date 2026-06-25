<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		label,
		value,
		unit,
		hint,
		class: className
	}: {
		label: string;
		value: string | number;
		unit?: string;
		hint?: string;
		class?: string;
	} = $props();
</script>

<div class={cn('border-border/60 bg-card/40 rounded-xl border p-4', className)}>
	<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
	<p class="mt-2 flex items-baseline gap-1">
		<span class="text-2xl font-bold tabular-nums">{value}</span>
		{#if unit}<span class="text-muted-foreground text-sm">{unit}</span>{/if}
	</p>
	{#if hint}<p class="text-muted-foreground mt-1 text-xs">{hint}</p>{/if}
</div>
