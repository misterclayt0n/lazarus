<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';
	import { api, type Id } from '$lib/convex/api';
	import { convexClient } from '$lib/convex/client.svelte';
	import { estimatedOneRepMax } from '$lib/domain/training';
	import { formatKg } from '$lib/format';
	import type { SessionExerciseBlock } from '$lib/domain/types';
	import NumberField from '$lib/components/number-field.svelte';
	import MusclePill from '$lib/components/muscle-pill.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import Dumbbell from '@lucide/svelte/icons/dumbbell';
	import Trophy from '@lucide/svelte/icons/trophy';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Plus from '@lucide/svelte/icons/plus';

	let {
		sessionId,
		block,
		editable = true
	}: { sessionId: Id<'sessions'>; block: SessionExerciseBlock; editable?: boolean } = $props();

	let kg = $state(0);
	let reps = $state(0);
	let rir = $state(2);
	let isWarmup = $state(false);
	let adding = $state(false);
	let seeded = false;

	const rows = $derived.by(() => {
		let working = 0;
		return block.sets.map((set) => ({ set, label: set.isWarmup ? 'W' : String(++working) }));
	});

	$effect(() => {
		const last = block.sets[block.sets.length - 1];
		if (!seeded && last) {
			kg = last.kg;
			reps = last.reps;
			seeded = true;
		}
	});

	async function addSet() {
		const exercise = block.exercise;
		if (!exercise || adding) return;
		adding = true;
		const willPR =
			!isWarmup && kg > 0 && reps > 0 && estimatedOneRepMax(kg, reps) > block.bestE1rm + 1e-9;
		try {
			await convexClient().mutation(api.sets.add, {
				sessionId,
				exerciseId: exercise._id,
				kg,
				reps,
				rir: isWarmup ? undefined : rir,
				isWarmup
			});
			if (willPR) {
				toast.success('New PR! 🔥', {
					description: `${exercise.name} · ${formatKg(kg)}kg × ${reps}`
				});
			}
		} catch (error) {
			toast.error('Could not log set', { description: String(error) });
		} finally {
			adding = false;
		}
	}

	async function removeSet(id: Id<'sessionSets'>) {
		try {
			await convexClient().mutation(api.sets.remove, { id });
		} catch {
			toast.error('Could not remove set');
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
			{#each rows as row (row.set._id)}
				<div
					class={cn(
						'flex items-center gap-3 px-3 py-2 text-sm',
						row.set.isPR && 'bg-primary/5'
					)}
				>
					<span
						class={cn(
							'grid size-6 shrink-0 place-items-center rounded-md text-xs font-semibold tabular-nums',
							row.set.isWarmup ? 'text-muted-foreground bg-muted' : 'bg-muted/60'
						)}
					>
						{row.label}
					</span>
					<span class="font-medium tabular-nums">
						{formatKg(row.set.kg)}<span class="text-muted-foreground text-xs"> kg</span>
						<span class="text-muted-foreground mx-1">×</span>
						{row.set.reps}
					</span>
					{#if !row.set.isWarmup && row.set.rir !== undefined}
						<span class="text-muted-foreground text-xs">{row.set.rir} RIR</span>
					{/if}
					{#if row.set.isPR}
						<span class="text-primary inline-flex items-center gap-1 text-xs font-semibold">
							<Trophy class="size-3.5" /> PR
						</span>
					{/if}
					<span class="flex-1"></span>
					{#if editable}
						<button
							type="button"
							onclick={() => removeSet(row.set._id)}
							aria-label="Delete set"
							class="text-muted-foreground hover:text-destructive transition-colors active:scale-90"
						>
							<Trash2 class="size-3.5" />
						</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	{#if editable}
		<div class="border-border/50 bg-background/30 border-t p-3">
			<div class="flex items-end gap-2">
				<div class="w-20"><NumberField bind:value={kg} step={2.5} label="kg" /></div>
				<div class="w-16"><NumberField bind:value={reps} step={1} label="reps" /></div>
				{#if !isWarmup}
					<div class="w-16"><NumberField bind:value={rir} step={1} label="rir" /></div>
				{/if}
				<Button onclick={addSet} disabled={adding} size="icon" class="ml-auto" aria-label="Add set">
					<Plus class="size-4" />
				</Button>
			</div>
			<label class="text-muted-foreground mt-2 flex w-fit items-center gap-2 text-xs">
				<Switch bind:checked={isWarmup} /> Warm-up set
			</label>
		</div>
	{/if}
</div>
