import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/useAuth";
import { useHideTabBar } from "@/hooks/useHideTabBar";

type FaqTopic = { id: string; question: string; answer: string };

const FAQ_TOPICS: readonly FaqTopic[] = [
  {
    id: "login-gps",
    question: "Kenapa GPS wajib diaktifkan saat login?",
    answer:
      'Lokasi dipakai untuk memverifikasi kamu login dari lapangan. Izinkan akses lokasi di perangkat, tunggu status "Lokasi diizinkan" muncul hijau, baru masukkan NIK dan password.',
  },
  {
    id: "input-dtdoor",
    question: "Bagaimana cara input kunjungan Door To Door?",
    answer:
      'Buka tab Program → tab "Door To Door" → tombol "+ Input Kunjungan Baru", isi data pemilih dan kategori, lalu simpan.',
  },
  {
    id: "input-gotv",
    question: "Bagaimana cara input kegiatan Social Event?",
    answer:
      'Buka tab Program → tab "Social Event" → tombol "+ Input Kegiatan Baru", isi data kegiatan, lalu simpan.',
  },
  {
    id: "akses-wilayah",
    question: "Kenapa saya tidak bisa lihat semua wilayah di Timses/Kekuatan Wilayah?",
    answer:
      "Akses dibatasi sesuai kecamatan wilayah tugasmu (kecuali role Admin/Adminsekret yang bisa lihat semua wilayah). Ini sesuai desain akses berbasis wilayah, bukan bug.",
  },
  {
    id: "ubah-profil",
    question: "Bagaimana cara mengubah data profil saya?",
    answer:
      'Buka tab Profil, ubah field Nama Lengkap/No. HP, lalu tekan "Simpan Perubahan". Field Email belum bisa diubah (belum didukung backend).',
  },
  {
    id: "dpt-belum-lengkap",
    question: "Kenapa data DPT belum lengkap untuk semua wilayah?",
    answer:
      "Modul DPT masih tahap pengembangan (data contoh/demo) — cakupan wilayah akan diperluas bertahap begitu data resmi tersedia.",
  },
];

function handleSendNotImplemented(): void {
  Alert.alert("Segera hadir", "Fitur kirim pesan langsung belum tersedia.");
}

// Referensi context/designs/customer-service.png — SCREENSHOT APP LAIN
// ("halo tiket"/tiket.com, chatbot AI refund/pemesanan tiket), BUKAN mockup JSI.
// Cuma POLA LAYOUT yang dipakai (bubble sambutan, card list topik FAQ, input
// pesan di bawah) — konten diganti total jadi FAQ statis seputar app JSI ini,
// dikonfirmasi eksplisit ke user sebelum build (lihat progress-tracker.md
// Decisions). SENGAJA TIDAK ada label/klaim "AI" atau chatbot beneran — repo ini
// tidak punya backend chat apapun, topik & jawaban di FAQ_TOPICS ditulis dari
// fitur yang nyata sudah ada di app ini (bukan konten karangan). Kolom
// "Tulis Pesan" non-fungsional (Alert "Segera hadir"), pola sama dengan
// placeholder lain di app (notifikasi Home, dll).
export function CustomerServiceScreen() {
  const { session } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");

  const namaDepan = session?.user.namaLengkap.split(" ")[0] ?? "";

  useHideTabBar();

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <View className="items-center gap-sm rounded-lg border border-border bg-surface p-lg">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-accent-soft">
            <Ionicons name="chatbubble-ellipses" size={28} color="#3b82f6" />
          </View>
          <Text className="text-headline-md font-semibold text-text-primary">
            Hi{namaDepan ? `, ${namaDepan}` : ""}!
          </Text>
          <Text className="text-center text-body-md text-text-muted">
            Ada yang bisa kami bantu seputar aplikasi JSI Mobile?
          </Text>
        </View>

        <View className="gap-sm rounded-lg border border-border bg-surface p-md">
          <Text className="text-body-lg font-semibold text-text-primary">Pilih topik bantuan di bawah ini:</Text>
          <View>
            {FAQ_TOPICS.map((topic, index) => {
              const isExpanded = expandedId === topic.id;
              return (
                <Pressable
                  key={topic.id}
                  onPress={() => setExpandedId(isExpanded ? null : topic.id)}
                  className={`gap-xs py-sm active:opacity-80 ${index < FAQ_TOPICS.length - 1 ? "border-b border-border" : ""}`}
                >
                  <View className="flex-row items-center justify-between gap-sm">
                    <Text className="flex-1 text-body-md text-text-primary">{topic.question}</Text>
                    <Ionicons name={isExpanded ? "chevron-down" : "chevron-forward"} size={18} color="#64748b" />
                  </View>
                  {isExpanded ? <Text className="text-caption text-text-muted">{topic.answer}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text className="text-caption text-text-muted">
          Tidak ketemu jawabannya? Ketik pertanyaanmu di bawah, tim kami akan membantu.
        </Text>
      </ScrollView>

      <View className="flex-row items-center gap-sm border-t border-border bg-surface px-margin-mobile py-sm">
        <TextInput
          value={draftMessage}
          onChangeText={setDraftMessage}
          placeholder="Tulis Pesan"
          placeholderTextColor="#64748b"
          className="flex-1 rounded-full border border-border bg-surface-secondary px-md py-sm text-body-md text-text-primary"
          textAlignVertical="center"
          style={{ includeFontPadding: false, paddingVertical: 0, lineHeight: 20 }}
        />
        <Pressable
          onPress={handleSendNotImplemented}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-full bg-accent active:opacity-80"
        >
          <Ionicons name="send" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
