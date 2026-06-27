<script lang="ts">
	import { today, getLocalTimeZone, type DateValue } from '@internationalized/date';
	import { useQuery } from '$lib/convex/client.svelte';
	import { api } from '$lib/convex/api';
	import { formatKg, formatClock, formatRelativeDay } from '$lib/format';
	import { Calendar, Day } from '$lib/components/ui/calendar';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import EmptyState from '$lib/components/empty-state.svelte';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Zap from '@lucide/svelte/icons/zap';

	const sessions = useQuery(api.sessions.list, () => ({ limit: 100 }));

	let value = $state<DateValue | undefined>(today(getLocalTimeZone()));

	// Day buckets keyed identically from both a timestamp and a calendar date so
	// markers and the selected-day filter line up.
	function tsKey(ts: number): string {
		const d = new Date(ts);
		return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
	}
	function dateKey(d: DateValue): string {
		return `${d.year}-${d.month}-${d.day}`;
	}

	const sessionDays = $derived(new Set((sessions.data ?? []).map((s) => tsKey(s.startedAt))));
	const selectedKey = $derived(value ? dateKey(value) : '');
	const daySessions = $derived(
		(sessions.data ?? []).filter((s) => tsKey(s.startedAt) === selectedKey)
	);
	const selectedTs = $derived(value ? value.toDate(getLocalTimeZone()).getTime() : null);
</script>

<header class="mb-5 flex items-end justify-between gap-4">
	<div>
		<h1 class="text-2xl font-bold tracking-tight">History</h1>
		<p class="text-muted-foreground mt-1 text-sm">Tap a day to inspect its sessions.</p>
	</div>
	<Button href="/train" class="gap-1.5">
		<Zap class="size-4" />
		<span class="hidden sm:inline">New session</span>
		<span class="sm:hidden">New</span>
	</Button>
</header>

<div class="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
	<div class="flex justify-center md:block">
		<Calendar
			type="single"
			bind:value
			captionLayout="dropdown"
			maxValue={today(getLocalTimeZone())}
			class="border-border/60 bg-card/40 rounded-xl border"
		>
			{#snippet day({ day, outsideMonth })}
				<Day class="relative">
					{day.day}
					{#if !outsideMonth && sessionDays.has(dateKey(day))}
						<span
							class="bg-primary in-data-[selected]:bg-primary-foreground absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full"
						></span>
					{/if}
				</Day>
			{/snippet}
		</Calendar>
	</div>

	<div class="min-w-0">
		<h2 class="mb-3 text-sm font-semibold">
			{selectedTs !== null ? formatRelativeDay(selectedTs) : 'Pick a day'}
		</h2>

		{#if sessions.isLoading && sessions.data === undefined}
			<div class="flex flex-col gap-2.5">
				{#each [0, 1] as i (i)}
					<Skeleton class="h-[68px] w-full rounded-xl" />
				{/each}
			</div>
		{:else if daySessions.length > 0}
			<div class="flex flex-col gap-2.5">
				{#each daySessions as session (session._id)}
					<a
						href={`/sessions/${session._id}`}
						class="group border-border/60 bg-card/40 hover:border-border flex items-center gap-3 rounded-xl border p-3 transition-colors"
					>
						<div class="text-muted-foreground w-12 shrink-0 text-sm font-semibold tabular-nums">
							{formatClock(session.startedAt)}
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<p class="truncate font-medium">{session.title ?? 'Session'}</p>
								{#if session.completedAt === undefined}
									<span
										class="bg-primary/15 text-primary inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium"
									>
										Live
									</span>
								{/if}
							</div>
							<p class="text-muted-foreground mt-0.5 text-xs tabular-nums">
								{session.summary.exerciseCount} ex · {session.summary.workingSets} sets · {formatKg(
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
			<EmptyState icon={CalendarDays} title="No sessions on this day">
				{#snippet action()}
					<Button href="/train" variant="outline" class="gap-1.5">
						<Zap class="size-4" /> Start one
					</Button>
				{/snippet}
			</EmptyState>
		{/if}
	</div>
</div>
