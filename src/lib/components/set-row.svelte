<script lang="ts">
	import { untrack } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';
	import { api } from '$lib/convex/api';
	import { convexClient } from '$lib/convex/client.svelte';
	import { estimatedOneRepMax } from '$lib/domain/training';
	import { formatKg } from '$lib/format';
	import type { SessionSetView } from '$lib/domain/types';
	import Check from '@lucide/svelte/icons/check';
	import Trophy from '@lucide/svelte/icons/trophy';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let {
		set,
		label,
		bestE1rm,
		exerciseName,
		editable = true
	}: {
		set: SessionSetView;
		label: string;
		bestE1rm: number;
		exerciseName: string;
		editable?: boolean;
	} = $props();

	// Editable copies seeded once from the set; we write changes back to Convex.
	let kg = $state(untrack(() => set.kg));
	let reps = $state(untrack(() => set.reps));
	let rir = $state<number | undefined>(untrack(() => set.rir));

	const done = $derived(set.completed !== false);

	const inputClass =
		'h-9 w-full min-w-0 rounded-md border border-border/60 bg-background/40 px-1 text-center text-sm font-semibold tabular-nums outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

	function toNumber(event: Event): number {
		const value = (event.currentTarget as HTMLInputElement).value;
		return value === '' ? 0 : Number(value);
	}

	async function patch(fields: {
		kg?: number;
		reps?: number;
		rir?: number;
		isWarmup?: boolean;
		completed?: boolean;
	}) {
		try {
			await convexClient().mutation(api.sets.update, { id: set._id, ...fields });
		} catch {
			toast.error('Could not save set');
		}
	}

	function commitKg() {
		if (kg !== set.kg) patch({ kg });
	}
	function commitReps() {
		if (reps !== set.reps) patch({ reps });
	}
	function commitRir() {
		if (rir !== undefined && rir !== set.rir) patch({ rir });
	}

	async function toggleDone() {
		const next = !done;
		const willPR =
			next && !set.isWarmup && kg > 0 && reps > 0 && estimatedOneRepMax(kg, reps) > bestE1rm + 1e-9;
		try {
			await convexClient().mutation(api.sets.update, {
				id: set._id,
				kg,
				reps,
				rir,
				completed: next
			});
			if (willPR) {
				toast.success('New PR! 🔥', {
					description: `${exerciseName} · ${formatKg(kg)}kg × ${reps}`
				});
			}
		} catch {
			toast.error('Could not update set');
		}
	}

	function toggleWarmup() {
		patch({ isWarmup: !set.isWarmup });
	}

	async function remove() {
		try {
			await convexClient().mutation(api.sets.remove, { id: set._id });
		} catch {
			toast.error('Could not delete set');
		}
	}
</script>

<div
	class={cn(
		'grid grid-cols-[1.75rem_1fr_1fr_1fr_auto_auto] items-center gap-1.5 px-3 py-1.5',
		done && 'bg-primary/[0.07]'
	)}
>
	<button
		type="button"
		onclick={toggleWarmup}
		disabled={!editable}
		title="Tap to toggle warm-up"
		class={cn(
			'relative grid size-7 place-items-center rounded-md text-xs font-semibold tabular-nums transition-colors',
			set.isWarmup ? 'text-muted-foreground bg-muted' : 'bg-muted/60'
		)}
	>
		{set.isWarmup ? 'W' : label}
		{#if set.isPR}
			<span
				class="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 grid size-3.5 place-items-center rounded-full"
			>
				<Trophy class="size-2" />
			</span>
		{/if}
	</button>

	<input
		type="number"
		inputmode="decimal"
		class={inputClass}
		value={kg}
		oninput={(e) => (kg = toNumber(e))}
		onchange={commitKg}
		disabled={!editable}
	/>
	<input
		type="number"
		inputmode="numeric"
		class={inputClass}
		value={reps}
		oninput={(e) => (reps = toNumber(e))}
		onchange={commitReps}
		disabled={!editable}
	/>
	<input
		type="number"
		inputmode="numeric"
		class={inputClass}
		placeholder="–"
		value={rir ?? ''}
		oninput={(e) => {
			const v = (e.currentTarget as HTMLInputElement).value;
			rir = v === '' ? undefined : Number(v);
		}}
		onchange={commitRir}
		disabled={!editable || set.isWarmup}
	/>

	<button
		type="button"
		onclick={toggleDone}
		disabled={!editable}
		aria-label={done ? 'Mark set not done' : 'Mark set done'}
		class={cn(
			'grid size-9 place-items-center rounded-md border transition-all active:scale-90',
			done
				? 'border-primary bg-primary text-primary-foreground'
				: 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
		)}
	>
		<Check class="size-4" />
	</button>

	{#if editable}
		<button
			type="button"
			onclick={remove}
			aria-label="Delete set"
			class="text-muted-foreground/60 hover:text-destructive grid size-9 place-items-center rounded-md transition-colors active:scale-90"
		>
			<Trash2 class="size-3.5" />
		</button>
	{/if}
</div>
