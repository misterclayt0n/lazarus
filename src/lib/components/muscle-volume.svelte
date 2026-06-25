<script lang="ts">
	import { cn } from '$lib/utils';
	import { muscleLabel } from '$lib/domain/muscles';

	let {
		volume,
		limit = 6,
		class: className
	}: { volume: Record<string, number>; limit?: number; class?: string } = $props();

	const rows = $derived.by(() => {
		const entries = Object.entries(volume)
			.sort((a, b) => b[1] - a[1])
			.slice(0, limit);
		const max = entries.reduce((m, [, value]) => Math.max(m, value), 0) || 1;
		return entries.map(([id, value]) => ({
			id,
			value,
			pct: Math.max(6, Math.round((value / max) * 100))
		}));
	});
</script>

{#if rows.length === 0}
	<p class="text-muted-foreground text-sm">No working sets logged yet.</p>
{:else}
	<div class={cn('flex flex-col gap-3', className)}>
		{#each rows as row (row.id)}
			<div>
				<div class="mb-1.5 flex items-center justify-between text-xs">
					<span class="font-medium">{muscleLabel(row.id)}</span>
					<span class="text-muted-foreground tabular-nums">
						{row.value}
						{row.value === 1 ? 'set' : 'sets'}
					</span>
				</div>
				<div class="bg-muted h-2 overflow-hidden rounded-full">
					<div
						class="bg-primary h-full rounded-full"
						style="width: {row.pct}%; transition: width 500ms var(--ease-out)"
					></div>
				</div>
			</div>
		{/each}
	</div>
{/if}
