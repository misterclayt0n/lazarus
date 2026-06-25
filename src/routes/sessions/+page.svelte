<script lang="ts">
	import { useQuery } from '$lib/convex/client.svelte';
	import { api } from '$lib/convex/api';
	import { formatRelativeDay, formatKg } from '$lib/format';
	import EmptyState from '$lib/components/empty-state.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Zap from '@lucide/svelte/icons/zap';

	const sessions = useQuery(api.sessions.list, () => ({ limit: 60 }));

	const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
</script>

<header class="mb-5 flex items-end justify-between gap-4">
	<div>
		<h1 class="text-2xl font-bold tracking-tight">History</h1>
		<p class="text-muted-foreground mt-1 text-sm">Every session you've logged.</p>
	</div>
	<Button href="/train" class="gap-1.5">
		<Zap class="size-4" />
		<span class="hidden sm:inline">New session</span>
		<span class="sm:hidden">New</span>
	</Button>
</header>

{#if sessions.isLoading && sessions.data === undefined}
	<div class="flex flex-col gap-2.5">
		{#each [0, 1, 2, 3, 4] as i (i)}
			<Skeleton class="h-[76px] w-full rounded-xl" />
		{/each}
	</div>
{:else if sessions.data && sessions.data.length > 0}
	<div class="flex flex-col gap-2.5">
		{#each sessions.data as session (session._id)}
			<a
				href={`/sessions/${session._id}`}
				class="group border-border/60 bg-card/40 hover:border-border flex items-center gap-4 rounded-xl border p-3.5 transition-colors"
			>
				<div
					class="bg-muted/60 flex size-12 shrink-0 flex-col items-center justify-center rounded-lg"
				>
					<span class="text-muted-foreground text-[10px] uppercase">
						{monthFormatter.format(session.startedAt)}
					</span>
					<span class="text-lg leading-none font-bold tabular-nums">
						{new Date(session.startedAt).getDate()}
					</span>
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<p class="truncate font-semibold">
							{session.title ?? formatRelativeDay(session.startedAt)}
						</p>
						{#if session.completedAt === undefined}
							<span
								class="bg-primary/15 text-primary inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium"
							>
								Live
							</span>
						{/if}
					</div>
					<p class="text-muted-foreground mt-0.5 text-xs tabular-nums">
						{session.summary.exerciseCount} exercises · {session.summary.workingSets} sets · {formatKg(
							session.summary.tonnageKg
						)} kg
					</p>
				</div>
				<ChevronRight
					class="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
				/>
			</a>
		{/each}
	</div>
{:else}
	<EmptyState
		icon={CalendarDays}
		title="No sessions yet"
		description="Start training and your history will fill up here."
	>
		{#snippet action()}
			<Button href="/train" class="gap-1.5"><Zap class="size-4" /> Start session</Button>
		{/snippet}
	</EmptyState>
{/if}
