const kgFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const dayFormatter = new Intl.DateTimeFormat('en-US', {
	weekday: 'short',
	month: 'short',
	day: 'numeric'
});
const clockFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

const DAY_MS = 24 * 60 * 60 * 1000;

/** Weight rounded to at most one decimal (60, 62.5), no unit. */
export function formatKg(kg: number): string {
	return kgFormatter.format(kg);
}

/** "Mon, Jun 23" */
export function formatDay(ts: number): string {
	return dayFormatter.format(ts);
}

/** "6:30 PM" */
export function formatClock(ts: number): string {
	return clockFormatter.format(ts);
}

/** Compact elapsed time: "45m", "1h 12m", or "—" while empty. */
export function formatDuration(ms: number): string {
	if (ms <= 0) return '0m';
	const totalMinutes = Math.round(ms / 60000);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours === 0) return `${minutes}m`;
	return `${hours}h ${minutes}m`;
}

/** "Today", "Yesterday", "3d ago", else the calendar day. */
export function formatRelativeDay(ts: number): string {
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const diffDays = Math.floor((startOfToday.getTime() - ts) / DAY_MS);
	if (ts >= startOfToday.getTime()) return 'Today';
	if (diffDays === 0) return 'Yesterday';
	if (diffDays < 7) return `${diffDays + 1}d ago`;
	return dayFormatter.format(ts);
}
