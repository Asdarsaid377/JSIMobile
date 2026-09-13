import { Text, View } from "react-native";

type Props = {
	total: number;
	online: number;
	isLoading: boolean;
};

// Pixel-sampled dari context/designs/timses.png: kartu gelap = bg-primary
// (#1e293b, exact match), kartu putih = bg-surface + text-success (#16a34a,
// exact match) — lihat progress-tracker.md Decisions.
export function TimsesSummaryCards({ total, online, isLoading }: Props) {
	return (
		<View className="flex-row gap-sm">
			<View className="flex-1 rounded-lg bg-primary p-md">
				{isLoading ? (
					<View className="h-7 w-12 rounded-sm bg-surface-inverse" />
				) : (
					<Text className="text-headline-md font-semibold text-text-inverse">
						{total}
					</Text>
				)}
				<Text className="text-caption text-text-inverse-muted">
					Total Anggota
				</Text>
			</View>
			<View className="flex-1 rounded-lg border border-border bg-surface p-md">
				{isLoading ? (
					<View className="h-7 w-16 rounded-sm bg-surface-secondary" />
				) : (
					<Text className="text-headline-md font-semibold text-success">
						{online} Online
					</Text>
				)}
				<Text className="text-caption text-text-muted">Aktif sekarang</Text>
			</View>
		</View>
	);
}
