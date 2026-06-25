<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import UserMenu from '$lib/components/user-menu.svelte';
	import type { SessionUser } from '$lib/auth';
	import Dumbbell from '@lucide/svelte/icons/dumbbell';
	import House from '@lucide/svelte/icons/house';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Zap from '@lucide/svelte/icons/zap';
	import type { LucideIcon } from '@lucide/svelte';

	let { user, children }: { user: SessionUser | null; children: Snippet } = $props();

	type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };
	const primaryNav: NavItem[] = [
		{ href: '/', label: 'Home', icon: House, exact: true },
		{ href: '/exercises', label: 'Exercises', icon: Dumbbell },
		{ href: '/sessions', label: 'History', icon: CalendarDays }
	];

	function active(href: string, exact = false): boolean {
		const path = page.url.pathname;
		return exact ? path === href : path === href || path.startsWith(`${href}/`);
	}
</script>

{#snippet railLink(item: NavItem)}
	{@const isActive = active(item.href, item.exact)}
	<a
		href={item.href}
		data-active={isActive}
		class={cn(
			'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
			isActive
				? 'bg-muted text-foreground'
				: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
		)}
	>
		<item.icon class={cn('size-[18px]', isActive && 'text-primary')} />
		{item.label}
	</a>
{/snippet}

{#snippet tabLink(item: NavItem)}
	{@const isActive = active(item.href, item.exact)}
	<a
		href={item.href}
		class={cn(
			'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors',
			isActive ? 'text-foreground' : 'text-muted-foreground'
		)}
	>
		<item.icon class={cn('size-5 transition-colors', isActive && 'text-primary')} />
		{item.label}
	</a>
{/snippet}

<div class="min-h-svh">
	<!-- Desktop rail -->
	<aside
		class="border-border/60 bg-card/30 fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r px-3 py-5 backdrop-blur-xl md:flex"
	>
		<a href="/" class="flex items-center gap-2.5 px-2">
			<span
				class="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl shadow-[0_0_24px_-6px_var(--primary)]"
			>
				<Dumbbell class="size-5" />
			</span>
			<span class="text-base font-bold tracking-tight">Lazarus</span>
		</a>

		<div class="mt-6">
			<Button href="/train" class="w-full justify-start gap-2" size="lg">
				<Zap class="size-[18px]" />
				Start session
			</Button>
		</div>

		<nav class="mt-6 flex flex-col gap-1">
			{#each primaryNav as item (item.href)}
				{@render railLink(item)}
			{/each}
		</nav>

		<div class="border-border/60 mt-auto flex items-center gap-3 border-t pt-4">
			<UserMenu {user} />
			<div class="min-w-0">
				<p class="truncate text-sm font-medium">
					{user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email : 'Guest'}
				</p>
				<p class="text-muted-foreground truncate text-xs">
					{user ? 'Signed in' : 'Not signed in'}
				</p>
			</div>
		</div>
	</aside>

	<!-- Mobile top bar -->
	<header
		class="border-border/60 bg-background/80 sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 backdrop-blur-xl md:hidden"
	>
		<a href="/" class="flex items-center gap-2">
			<span
				class="bg-primary text-primary-foreground grid size-7 place-items-center rounded-lg shadow-[0_0_18px_-6px_var(--primary)]"
			>
				<Dumbbell class="size-4" />
			</span>
			<span class="text-sm font-bold tracking-tight">Lazarus</span>
		</a>
		<UserMenu {user} />
	</header>

	<!-- Main -->
	<main class="md:pl-60">
		<div class="mx-auto w-full max-w-5xl px-4 pt-5 pb-28 md:px-8 md:pt-10 md:pb-14">
			{@render children()}
		</div>
	</main>

	<!-- Mobile bottom nav -->
	<nav
		class="border-border/60 bg-background/90 fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t px-2 backdrop-blur-xl md:hidden"
		style="padding-bottom: env(safe-area-inset-bottom)"
	>
		{@render tabLink(primaryNav[0])}
		{@render tabLink(primaryNav[1])}
		<a href="/train" class="flex flex-1 flex-col items-center justify-center gap-1 py-1.5">
			<span
				class="bg-primary text-primary-foreground grid size-10 place-items-center rounded-2xl shadow-[0_0_20px_-4px_var(--primary)] transition-transform active:scale-95"
			>
				<Zap class="size-5" />
			</span>
			<span class="text-primary text-[11px] font-semibold">Train</span>
		</a>
		{@render tabLink(primaryNav[2])}
	</nav>
</div>
