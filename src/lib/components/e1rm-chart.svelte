<script lang="ts">
	import { cn } from '$lib/utils';
	import { formatDay } from '$lib/format';

	let {
		points,
		class: className
	}: { points: { date: number; e1rm: number }[]; class?: string } = $props();

	const W = 600;
	const H = 200;
	const PAD = { l: 40, r: 14, t: 16, b: 22 };

	const geo = $derived.by(() => {
		if (points.length === 0) return null;
		const values = points.map((p) => p.e1rm);
		const minV = Math.min(...values);
		const maxV = Math.max(...values);
		const span = maxV - minV;
		const domMin = span === 0 ? minV - 1 : minV - span * 0.15;
		const domMax = span === 0 ? maxV + 1 : maxV + span * 0.15;
		const plotW = W - PAD.l - PAD.r;
		const plotH = H - PAD.t - PAD.b;
		const baseline = H - PAD.b;
		const xAt = (i: number) =>
			points.length === 1 ? PAD.l + plotW / 2 : PAD.l + (i / (points.length - 1)) * plotW;
		const yAt = (v: number) => PAD.t + (1 - (v - domMin) / (domMax - domMin)) * plotH;
		const coords = points.map((p, i) => ({ x: xAt(i), y: yAt(p.e1rm), date: p.date, e1rm: p.e1rm }));
		const line = coords
			.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
			.join(' ');
		const area =
			`M ${coords[0].x.toFixed(1)} ${baseline} ` +
			coords.map((c) => `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ') +
			` L ${coords[coords.length - 1].x.toFixed(1)} ${baseline} Z`;
		return {
			coords,
			line,
			area,
			baseline,
			minV,
			maxV,
			gridMax: yAt(maxV),
			gridMin: yAt(minV),
			bestIdx: values.indexOf(maxV)
		};
	});
</script>

{#if geo}
	<svg
		viewBox="0 0 {W} {H}"
		class={cn('w-full', className)}
		role="img"
		aria-label="Estimated one-rep-max trend"
	>
		<defs>
			<linearGradient id="e1rm-grad" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="var(--primary)" stop-opacity="0.25" />
				<stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
			</linearGradient>
		</defs>

		<line
			x1={PAD.l}
			x2={W - PAD.r}
			y1={geo.gridMax}
			y2={geo.gridMax}
			stroke="var(--border)"
			stroke-dasharray="3 4"
			vector-effect="non-scaling-stroke"
		/>
		<line
			x1={PAD.l}
			x2={W - PAD.r}
			y1={geo.gridMin}
			y2={geo.gridMin}
			stroke="var(--border)"
			stroke-dasharray="3 4"
			vector-effect="non-scaling-stroke"
		/>

		<path d={geo.area} fill="url(#e1rm-grad)" />
		<path
			d={geo.line}
			fill="none"
			stroke="var(--primary)"
			stroke-width="2"
			stroke-linejoin="round"
			stroke-linecap="round"
			vector-effect="non-scaling-stroke"
		/>

		{#each geo.coords as c, i (i)}
			{#if i === geo.bestIdx}
				<circle
					cx={c.x}
					cy={c.y}
					r="7"
					fill="none"
					stroke="var(--primary)"
					stroke-opacity="0.4"
					vector-effect="non-scaling-stroke"
				/>
			{/if}
			<circle cx={c.x} cy={c.y} r={i === geo.bestIdx ? 4.5 : 3} fill="var(--primary)" />
		{/each}

		<text x={PAD.l - 6} y={geo.gridMax + 3} text-anchor="end" font-size="11" fill="var(--muted-foreground)">
			{geo.maxV}
		</text>
		<text x={PAD.l - 6} y={geo.gridMin + 3} text-anchor="end" font-size="11" fill="var(--muted-foreground)">
			{geo.minV}
		</text>

		<text x={geo.coords[0].x} y={H - 5} text-anchor="start" font-size="11" fill="var(--muted-foreground)">
			{formatDay(geo.coords[0].date)}
		</text>
		{#if geo.coords.length > 1}
			<text
				x={geo.coords[geo.coords.length - 1].x}
				y={H - 5}
				text-anchor="end"
				font-size="11"
				fill="var(--muted-foreground)"
			>
				{formatDay(geo.coords[geo.coords.length - 1].date)}
			</text>
		{/if}
	</svg>
{/if}
