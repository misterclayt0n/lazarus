<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import type { SessionUser } from '$lib/auth';

	let { user }: { user: SessionUser | null } = $props();

	const displayName = $derived.by(() => {
		if (!user) return '';
		const full = [user.firstName, user.lastName].filter(Boolean).join(' ');
		return full || user.email;
	});

	const initials = $derived.by(() => {
		if (!user) return '?';
		const combined = (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '');
		return (combined || user.email[0] || '?').toUpperCase();
	});
</script>

{#if user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="ring-offset-background focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
		>
			<Avatar.Root class="border-border/60 size-9 border">
				{#if user.profilePictureUrl}
					<Avatar.Image src={user.profilePictureUrl} alt={displayName} />
				{/if}
				<Avatar.Fallback class="bg-muted text-xs font-semibold">{initials}</Avatar.Fallback>
			</Avatar.Root>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="w-56">
			<div class="px-2 py-1.5">
				<p class="truncate text-sm font-medium">{displayName}</p>
				<p class="text-muted-foreground truncate text-xs">{user.email}</p>
			</div>
			<DropdownMenu.Separator />
			<form method="POST" action="/sign-out" class="p-1">
				<button
					type="submit"
					class="hover:bg-muted flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors"
				>
					<LogOutIcon class="size-4" />
					Sign out
				</button>
			</form>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	<Button href="/sign-in" size="sm">Sign in</Button>
{/if}
