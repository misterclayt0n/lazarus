<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { useQuery, convexClient } from '$lib/convex/client.svelte';
	import { api, type Id } from '$lib/convex/api';
	import { formatKg, formatClock, formatDay, formatDuration } from '$lib/format';
	import type { SessionDetail } from '$lib/domain/types';
	import SessionExercise from '$lib/components/session-exercise.svelte';
	import ExercisePicker from '$lib/components/exercise-picker.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import MuscleVolume from '$lib/components/muscle-volume.svelte';
	import StatTile from '$lib/components/stat-tile.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import Plus from '@lucide/svelte/icons/plus';
	import Check from '@lucide/svelte/icons/check';
	import Dumbbell from '@lucide/svelte/icons/dumbbell';

	let { sessionId }: { sessionId: Id<'sessions'> } = $props();

	const detail = useQuery(api.sessions.get, () => ({ id: sessionId }));
	let pickerOpen = $state(false);
	let finishing = $state(false);
	let now = $state(Date.now());

	$effect(() => {
		const timer = setInterval(() => (now = Date.now()), 30000);
		return () => clearInterval(timer);
	});

	const data = $derived(detail.data as SessionDetail | null | undefined);
	const isActive = $derived(data ? data.session.completedAt === undefined : false);
	const durationMs = $derived(data ? (data.session.completedAt ?? now) - data.session.startedAt : 0);
	const existingIds = $derived(
		data
			? data.exercises
					.map((block) => block.exercise?._id)
					.filter((id): id is Id<'exercises'> => Boolean(id))
			: []
	);

	async function addExercise(id: Id<'exercises'>) {
		try {
			await convexClient().mutation(api.sessions.addExercise, { sessionId, exerciseId: id });
		} catch {
			toast.error('Could not add exercise');
		}
	}

	async function finish() {
		if (!data) return;
		finishing = true;
		try {
			await convexClient().mutation(api.sessions.complete, { id: sessionId });
			toast.success('Session complete', {
				description: `${data.totals.workingSets} working sets logged`
			});
			await goto('/sessions');
		} catch (error) {
			toast.error('Could not finish session', { description: String(error) });
			finishing = false;
		}
	}
</script>

{#if detail.isLoading && data === undefined}
	<div class="flex flex-col gap-4">
		<Skeleton class="h-24 w-full rounded-xl" />
		<div class="grid grid-cols-3 gap-3">
			<Skeleton class="h-20 rounded-xl" />
			<Skeleton class="h-20 rounded-xl" />
			<Skeleton class="h-20 rounded-xl" />
		</div>
		<Skeleton class="h-40 w-full rounded-xl" />
	</div>
{:else if !data}
	<EmptyState icon={Dumbbell} title="Session not found" description="It may have been deleted.">
		{#snippet action()}
			<Button href="/sessions">Back to history</Button>
		{/snippet}
	</EmptyState>
{:else}
	<header class="mb-5 flex flex-wrap items-start justify-between gap-4">
		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-2xl font-bold tracking-tight">
					{data.session.title ?? formatDay(data.session.startedAt)}
				</h1>
				{#if isActive}
					<span
						class="bg-primary/15 text-primary inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
					>
						<span class="bg-primary size-1.5 animate-pulse rounded-full"></span> Live
					</span>
				{:else}
					<span
						class="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
					>
						<Check class="size-3" /> Done
					</span>
				{/if}
			</div>
			<p class="text-muted-foreground mt-1 text-sm">
				{formatDay(data.session.startedAt)} · {formatClock(data.session.startedAt)}
			</p>
		</div>
		{#if isActive}
			<Button onclick={finish} disabled={finishing || data.totals.workingSets === 0} class="gap-1.5">
				<Check class="size-4" /> Finish
			</Button>
		{/if}
	</header>

	<div class="mb-5 grid grid-cols-3 gap-3">
		<StatTile label="Time" value={formatDuration(durationMs)} />
		<StatTile label="Work sets" value={data.totals.workingSets} />
		<StatTile label="Volume" value={formatKg(data.totals.tonnageKg)} unit="kg" />
	</div>

	{#if data.exercises.length === 0}
		{#if isActive}
			<EmptyState
				icon={Dumbbell}
				title="Empty session"
				description="Add your first exercise to start logging sets."
			>
				{#snippet action()}
					<Button onclick={() => (pickerOpen = true)} class="gap-1.5">
						<Plus class="size-4" /> Add exercise
					</Button>
				{/snippet}
			</EmptyState>
		{:else}
			<EmptyState icon={Dumbbell} title="No exercises logged" />
		{/if}
	{:else}
		<div class="flex flex-col gap-3">
			{#each data.exercises as block (block.sessionExerciseId)}
				<SessionExercise {sessionId} {block} editable={isActive} />
			{/each}
		</div>
		{#if isActive}
			<Button
				variant="outline"
				size="lg"
				class="mt-3 w-full gap-1.5 border-dashed"
				onclick={() => (pickerOpen = true)}
			>
				<Plus class="size-4" /> Add exercise
			</Button>
		{/if}
	{/if}

	{#if data.totals.workingSets > 0}
		<Card.Root class="mt-6">
			<Card.Header>
				<Card.Title class="text-base">Muscle volume</Card.Title>
				<Card.Description>Working sets, weighted by priority.</Card.Description>
			</Card.Header>
			<Card.Content>
				<MuscleVolume volume={data.totals.muscleVolume} limit={8} />
			</Card.Content>
		</Card.Root>
	{/if}

	<ExercisePicker bind:open={pickerOpen} {existingIds} onpick={addExercise} />
{/if}
