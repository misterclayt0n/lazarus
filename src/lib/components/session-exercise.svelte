<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { api, type Id } from '$lib/convex/api';
	import { convexClient } from '$lib/convex/client.svelte';
	import type { SessionExerciseBlock } from '$lib/domain/types';
	import SetRow from '$lib/components/set-row.svelte';
	import MusclePill from '$lib/components/muscle-pill.svelte';
	import { Button } from '$lib/components/ui/button';
	import Dumbbell from '@lucide/svelte/icons/dumbbell';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Plus from '@lucide/svelte/icons/plus';

	let {
		sessionId,
		block,
		editable = true
	}: { sessionId: Id<'sessions'>; block: SessionExerciseBlock; editable?: boolean } = $props();

	let adding = $state(false);

	const rows = $derived.by(() => {
		let working = 0;
		return block.sets.map((set) => ({ set, label: set.isWarmup ? 'W' : String(++working) }));
	});

	async function addSet() {
		const exercise = block.exercise;
		if (!exercise || adding) return;
		adding = true;
		// Prefill from the last working set so repeating a weight is one tap.
		const last = block.sets.filter((set) => !set.isWarmup).at(-1) ?? block.sets.at(-1);
		try {
			await convexClient().mutation(api.sets.add, {
				sessionId,
				exerciseId: exercise._id,
				kg: last?.kg ?? 0,
				reps: last?.reps ?? 0,
				rir: last?.rir,
				isWarmup: false,
				completed: false
			});
		} catch {
			toast.error('Could not add set');
		} finally {
			adding = false;
		}
	}

	async function removeExercise() {
		const exercise = block.exercise;
		if (!exercise) return;
		try {
			await convexClient().mutation(api.sessions.removeExercise, {
				sessionId,
				exerciseId: exercise._id
			});
		} catch {
			toast.error('Could not remove exercise');
		}
	}
</script>

<div class="border-border/60 bg-card/40 overflow-hidden rounded-xl border">
	<div class="flex items-center gap-3 p-3">
		<div
			class="bg-muted ring-border/50 grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg ring-1"
		>
			{#if block.exercise?.imageUrl}
				<img src={block.exercise.imageUrl} alt={block.exercise.name} class="size-full object-cover" />
			{:else}
				<Dumbbell class="text-muted-foreground size-5" />
			{/if}
		</div>
		<div class="min-w-0 flex-1">
			<p class="truncate font-semibold">{block.exercise?.name ?? 'Removed exercise'}</p>
			<div class="mt-1 flex flex-wrap gap-1">
				{#each block.exercise?.muscleGroups ?? [] as mg (mg.muscleGroup)}
					<MusclePill muscleGroup={mg.muscleGroup} priority={mg.priority} />
				{/each}
			</div>
		</div>
		{#if editable}
			<Button variant="ghost" size="icon-sm" onclick={removeExercise} aria-label="Remove exercise">
				<Trash2 class="size-4" />
			</Button>
		{/if}
	</div>

	{#if rows.length > 0}
		<div class="border-border/50 border-t">
			<div
				class="text-muted-foreground grid grid-cols-[1.75rem_1fr_1fr_1fr_auto_auto] gap-1.5 px-3 pt-2 pb-1 text-[10px] font-medium tracking-wide uppercase"
			>
				<span class="text-center">Set</span>
				<span class="text-center">Kg</span>
				<span class="text-center">Reps</span>
				<span class="text-center">RIR</span>
				<span class="size-9"></span>
				{#if editable}<span class="size-9"></span>{/if}
			</div>
			{#each rows as row (row.set._id)}
				<SetRow
					set={row.set}
					label={row.label}
					bestE1rm={block.bestE1rm}
					exerciseName={block.exercise?.name ?? ''}
					{editable}
				/>
			{/each}
		</div>
	{/if}

	{#if editable}
		<div class="border-border/50 border-t p-2">
			<Button variant="ghost" class="w-full gap-1.5" onclick={addSet} disabled={adding}>
				<Plus class="size-4" /> Add set
			</Button>
		</div>
	{/if}
</div>
