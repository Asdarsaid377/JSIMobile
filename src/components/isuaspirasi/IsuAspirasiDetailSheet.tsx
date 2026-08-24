import { Modal, Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import type { IsuAspirasi } from "@/types/isuaspirasi";

type Props = {
	item: IsuAspirasi | null;
	onClose: () => void;
	onTandaiDitindak: (item: IsuAspirasi) => void;
	onJadikanMateri: (item: IsuAspirasi) => void;
};

// Referensi artboard "15 · ISU & ASPIRASI WARGA" § bottom sheet detail
// aspirasi — Modal bottom sheet, pola sama AntiFraudEvidenceSheet/
// DptVoterActionSheet. Placeholder "Lokasi isu" & "Foto kondisi" disederhanakan
// jadi kotak polos `bg-surface-secondary` (mockup pakai tekstur garis diagonal
// + pin marker — dekoratif, tidak ada asset/library map di project ini, sama
// simplifikasi yang dipakai AntiFraudEvidenceSheet). Tombol "Tandai
// Ditindak"/"Jadikan Materi" SEKARANG mutation sungguhan (PATCH
// /isuaspirasi/:id, lihat handleTandaiDitindak/handleJadikanMateri di
// IsuAspirasiScreen.tsx) — sheet sendiri cuma terima callback, tidak berubah.
export function IsuAspirasiDetailSheet({
	item,
	onClose,
	onTandaiDitindak,
	onJadikanMateri,
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
						<View className="flex-row items-start justify-between gap-sm">
							<View className="gap-xs">
								<Text className="text-body-lg font-semibold text-text-primary">
									{item.warga}
								</Text>
								<Text className="text-caption text-text-muted">
									{item.alamat}
								</Text>
							</View>
							<View className="rounded-full bg-accent-soft px-sm py-xs">
								<Text className="text-caption font-bold text-accent">
									{item.kategori}
								</Text>
							</View>
						</View>
					) : null}

					{item ? (
						<View className="rounded-md bg-surface-secondary p-sm">
							<Text className="text-label-md text-text-secondary">
								&ldquo;{item.keluhan}&rdquo;
							</Text>
						</View>
					) : null}

					<View className="flex-row gap-sm">
						<View className="h-24 flex-1 items-center justify-center rounded-lg bg-surface-secondary">
							<View className="rounded-md bg-surface px-sm py-xs">
								<Text className="text-caption font-semibold text-text-muted">
									Lokasi isu
								</Text>
							</View>
						</View>
						<View className="h-24 flex-1 items-center justify-center gap-xs rounded-lg bg-surface-secondary">
							<Text className="text-headline-md text-border">📷</Text>
							<Text className="text-caption font-semibold text-text-muted">
								Foto kondisi
							</Text>
						</View>
					</View>

					{item ? (
						<View>
							<View className="flex-row items-center justify-between border-b border-surface-secondary py-sm">
								<Text className="text-label-md text-text-secondary">
									Dicatat oleh
								</Text>
								<Text className="text-label-md font-bold text-text-primary">
									{item.relawan}
								</Text>
							</View>
							<View className="flex-row items-center justify-between border-b border-surface-secondary py-sm">
								<Text className="text-label-md text-text-secondary">
									Warga sekitar mengeluh sama
								</Text>
								<Text className="text-label-md font-bold text-danger">
									{item.laporanSerupa} laporan
								</Text>
							</View>
							<View className="flex-row items-center justify-between py-sm">
								<Text className="text-label-md text-text-secondary">
									Status tindak lanjut
								</Text>
								<Text className="text-label-md font-bold text-text-primary">
									{item.status}
								</Text>
							</View>
						</View>
					) : null}

					<View className="flex gap-sm pt-xs">
						<Pressable
							onPress={() => item && onTandaiDitindak(item)}
							className="min-h-[44px]  items-center justify-center rounded-lg border border-border bg-surface px-lg py-sm active:opacity-80">
							<Text className="text-body-md font-bold text-text-secondary">
								Tandai Ditindak
							</Text>
						</Pressable>
						<View className="">
							<Button
								label="Jadikan Materi"
								variant="primary"
								onPress={() => item && onJadikanMateri(item)}
							/>
						</View>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}
