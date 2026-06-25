<script lang="ts">
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';

	let {
		value = $bindable(0),
		step = 1,
		min = 0,
		label
	}: { value?: number; step?: number; min?: number; label?: string } = $props();

	function bump(delta: number) {
		value = Math.max(min, Math.round((value + delta) * 100) / 100);
	}
</script>

<div class="flex flex-col gap-1">
	{#if label}
		<span class="text-muted-foreground text-center text-[10px] font-medium tracking-wide uppercase">
			{label}
		</span>
	{/if}
	<div class="border-border/60 bg-background/40 flex items-center rounded-lg border">
		<button
			type="button"
			aria-label="decrease"
			onclick={() => bump(-step)}
			class="text-muted-foreground hover:text-foreground grid size-9 shrink-0 place-items-center transition-transform active:scale-90"
		>
			<Minus class="size-4" />
		</button>
		<input
			type="number"
			inputmode="decimal"
			bind:value
			class="w-full min-w-0 [appearance:textfield] bg-transparent text-center text-sm font-semibold tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
		/>
		<button
			type="button"
			aria-label="increase"
			onclick={() => bump(step)}
			class="text-muted-foreground hover:text-foreground grid size-9 shrink-0 place-items-center transition-transform active:scale-90"
		>
			<Plus class="size-4" />
		</button>
	</div>
</div>
