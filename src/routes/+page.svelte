<script lang="ts">
	import { useQuery } from '$lib/convex/client.svelte';
	import { api } from '$lib/convex/api';
	import { formatKg, formatRelativeDay } from '$lib/format';
	import type { PageData } from './$types';
	import StatTile from '$lib/components/stat-tile.svelte';
	import MuscleVolume from '$lib/components/muscle-volume.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import Zap from '@lucide/svelte/icons/zap';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let { data }: { data: PageData } = $props();

	const active = useQuery(api.sessions.active, () => ({}));
	const weekly = useQuery(api.stats.weekly, () => ({}));
	const recent = useQuery(api.sessions.list, () => ({ limit: 5 }));

	const firstName = $derived(data.user?.firstName ?? null);
</script>

<header class="mb-6">
	<p class="text-muted-foreground text-sm">
		{firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
	</p>
	<h1 class="text-2xl font-bold tracking-tight">Let's get after it.</h1>
</header>

{#if active.data}
	<a
		href={`/sessions/${active.data._id}`}
		class="group border-primary/30 from-primary/15 hover:border-primary/50 mb-6 block overflow-hidden rounded-2xl border bg-gradient-to-r to-transparent p-5 transition-colors"
	>
		<div class="flex items-center gap-4">
			<span class="bg-primary text-primary-foreground grid size-11 place-items-center rounded-xl">
				<Zap class="size-5" />
			</span>
			<div class="flex-1">
				<p class="font-semibold">Resume your session</p>
				<p class="text-muted-foreground text-sm">You have a live session in progress.</p>
			</div>
			<ArrowRight class="text-primary size-5 transition-transform group-hover:translate-x-0.5" />
		</div>
	</a>
{:else}
	<a
		href="/train"
		class="group border-border/60 from-primary/10 hover:border-primary/40 mb-6 block overflow-hidden rounded-2xl border bg-gradient-to-r to-transparent p-5 transition-colors"
	>
		<div class="flex items-center gap-4">
			<span
				class="bg-primary text-primary-foreground grid size-11 place-items-center rounded-xl shadow-[0_0_24px_-6px_var(--primary)]"
			>
				<Zap class="size-5" />
			</span>
			<div class="flex-1">
				<p class="font-semibold">Start a session</p>
				<p class="text-muted-foreground text-sm">Empty session — add exercises as you go.</p>
			</div>
			<ArrowRight class="text-muted-foreground size-5 transition-transform group-hover:translate-x-0.5" />
		</div>
	</a>
{/if}

<section class="mb-6">
	<h2 class="text-muted-foreground mb-3 text-sm font-semibold">This week</h2>
	{#if weekly.isLoading && weekly.data === undefined}
		<div class="grid grid-cols-3 gap-3">
			{#each [0, 1, 2] as i (i)}
				<Skeleton class="h-20 rounded-xl" />
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-3 gap-3">
			<StatTile label="Sessions" value={weekly.data?.sessionCount ?? 0} />
			<StatTile label="Work sets" value={weekly.data?.workingSets ?? 0} />
			<StatTile label="Volume" value={formatKg(weekly.data?.tonnageKg ?? 0)} unit="kg" />
		</div>
	{/if}
</section>

<div class="grid gap-6 md:grid-cols-2">
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Muscle volume</Card.Title>
			<Card.Description>Sets this week, weighted by priority.</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if weekly.isLoading && weekly.data === undefined}
				<div class="flex flex-col gap-3">
					{#each [0, 1, 2, 3] as i (i)}
						<Skeleton class="h-7 w-full rounded" />
					{/each}
				</div>
			{:else}
				<MuscleVolume volume={weekly.data?.muscleVolume ?? {}} limit={6} />
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Recent sessions</Card.Title>
			<Card.Action>
				<a href="/sessions" class="text-muted-foreground hover:text-foreground text-xs font-medium">
					View all
				</a>
			</Card.Action>
		</Card.Header>
		<Card.Content>
			{#if recent.isLoading && recent.data === undefined}
				<div class="flex flex-col gap-2">
					{#each [0, 1, 2] as i (i)}
						<Skeleton class="h-10 w-full rounded" />
					{/each}
				</div>
			{:else if recent.data && recent.data.length > 0}
				<div class="flex flex-col">
					{#each recent.data as session (session._id)}
						<a
							href={`/sessions/${session._id}`}
							class="border-border/40 hover:text-foreground flex items-center justify-between gap-3 border-b py-2 text-sm last:border-0"
						>
							<span class="truncate">{session.title ?? formatRelativeDay(session.startedAt)}</span>
							<span class="text-muted-foreground shrink-0 text-xs tabular-nums">
								{session.summary.workingSets} sets
							</span>
						</a>
					{/each}
				</div>
			{:else}
				<p class="text-muted-foreground text-sm">
					No sessions yet. <a href="/train" class="text-primary hover:underline">Start one</a>.
				</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
