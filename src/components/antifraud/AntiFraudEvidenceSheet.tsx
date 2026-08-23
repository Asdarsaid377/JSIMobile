import { Modal, Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import type { FraudCase } from "@/types/antifraud";

type Props = {
	item: FraudCase | null;
	onClose: () => void;
	onApprove: (item: FraudCase) => void;
	onReject: (item: FraudCase) => void;
};

// Referensi artboard "14 · VERIFIKASI KUNJUNGAN" § bottom sheet "Bukti
// Kunjungan" — Modal bottom sheet (pola sama DptVoterActionSheet/Select.tsx).
// Placeholder "Titik GPS input" & "Foto kunjungan" disederhanakan jadi kotak
// polos `bg-surface-secondary` (mockup pakai tekstur garis diagonal + 2 pin
// marker — dekoratif, tidak ada asset/library map di project ini, pola sama
// simplifikasi yang sudah dipakai `KekuatanWilayahScreen` untuk elemen
// dekoratif serupa). Tombol "Tolak Data"/"Setujui" SENGAJA cuma tutup sheet +
// info singkat (TIDAK ada mutation approve/reject sungguhan) — permintaan
// eksplisit user "generate UI-nya saja dulu, nanti saya buatkan API-nya",
// dan persis perilaku kode asli mockup (`onClick="{{ closeFraudSheet }}"`
// SAMA untuk kedua tombol, tidak dibedakan).
export function AntiFraudEvidenceSheet({
	item,
	onClose,
	onApprove,
	onReject,
}: Props) {
	return (
		<Modal
			visible={item !== null}
			transparent
			animationType="slide"
			onRequestClose={onClose}>
			<Pressable
				className="flex-1 justify-end"
				style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
				onPress={onClose}>
				<Pressable
					className="gap-sm rounded-t-xl bg-surface p-md pb-lg"
					onPress={(e) => e.stopPropagation()}>
					<View className="mx-auto h-1 w-9 rounded-full bg-border" />
					{item ? (
						<View className="gap-xs">
							<Text className="text-body-lg font-semibold text-text-primary">
								Bukti Kunjungan
							</Text>
							<Text className="text-caption text-text-muted">
								{item.relawan} → {item.target}
							</Text>
						</View>
					) : null}

					<View className="flex-row gap-sm">
						<View className="h-24 flex-1 items-center justify-center rounded-lg bg-surface-secondary">
							<View className="rounded-md bg-surface px-sm py-xs">
								<Text className="text-caption font-semibold text-text-muted">
									Titik GPS input
								</Text>
							</View>
						</View>
						<View className="h-24 flex-1 items-center justify-center gap-xs rounded-lg bg-surface-secondary">
							<Text className="text-headline-md text-border">📷</Text>
							<Text className="text-caption font-semibold text-text-muted">
								Foto kunjungan
							</Text>
						</View>
					</View>

					<View>
						{item?.checks.map((check, index) => (
							<View
								key={check.label}
								className={`flex-row items-center justify-between gap-sm py-sm ${
									index < item.checks.length - 1
										? "border-b border-surface-secondary"
										: ""
								}`}>
								<Text className="flex-1 text-label-md text-text-secondary">
									{check.label}
								</Text>
								<Text
									className={`text-right text-label-md font-bold ${check.bermasalah ? "text-danger" : "text-success"}`}>
									{check.value}
								</Text>
							</View>
						))}
					</View>

					<View className="flex-row gap-sm pt-xs">
						<Pressable
							onPress={() => item && onReject(item)}
							className="min-h-[44px] flex-1 items-center justify-center rounded-lg border border-danger bg-surface px-lg py-sm active:opacity-80">
							<Text className="text-body-md font-bold text-danger">
								Tolak Data
							</Text>
						</Pressable>
						<View className="">
							<Button
								label="Setujui"
								variant="primary"
								onPress={() => item && onApprove(item)}
							/>
						</View>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}
