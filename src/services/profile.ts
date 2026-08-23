import axios from "axios";

import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type { TimsesProfile, UpdateProfileInput } from "@/types/profile";

// 2026-08-23: WIRED ke kontrak backend BARU — modul `timses` lama (TypeORM,
// `GET/PATCH /timses/:id`) sudah tidak ada, diganti modul `user` (Sequelize
// `TimsesModel`, `src/user/user.controller.ts`), self-service via JWT
// (`@User()` decorator dari token, BUKAN `:id` di path) — `GET /user/profile`
// & `POST /user/profile`. Parameter `id` di fungsi-fungsi di bawah DIPERTAHANKAN
// di signature (dipakai `useProfile`/`useUpdateProfile` untuk query key &
// cache invalidation, tetap identitas user yang login) tapi TIDAK dikirim ke
// endpoint — backend selalu ambil dari token, bukan dari path/body.
type UserApiRecord = {
  id: number;
  nik: string;
  namaLengkap: string;
  jenisKelamin: string;
  statusOnline: string | null;
  roles: TimsesProfile["roles"];
};

function mapProfile(record: UserApiRecord): TimsesProfile {
  return {
    id: record.id,
    nik: record.nik,
    namaLengkap: record.namaLengkap,
    jenisKelamin: record.jenisKelamin,
    statusOnline: record.statusOnline,
    roles: record.roles,
  };
}

// Akun demo — cocok dengan MOCK_ACCOUNTS di services/auth.ts (id 1 = admin.jsi,
// id 2 = yayat.hidayat). Aktif selama EXPO_PUBLIC_USE_MOCK_API=true, lihat
// api-standards.md § Mock Mode.
const MOCK_PROFILES: Record<number, TimsesProfile> = {
	1: {
		id: 1,
		nik: "admin.jsi",
		namaLengkap: "Admin Pemenangan",
		jenisKelamin: "L",
		statusOnline: "online",
		roles: "admin",
	},
	2: {
		id: 2,
		nik: "yayat.hidayat",
		namaLengkap: "Yayat Hidayat",
		jenisKelamin: "L",
		statusOnline: "online",
		roles: "timses",
	},
};

async function fetchProfileMock(id: number): Promise<TimsesProfile> {
	await mockDelay();
	const profile = MOCK_PROFILES[id];
	if (!profile) {
		throw new Error("Profil tidak ditemukan.");
	}
	return profile;
}

export async function fetchProfile(id: number): Promise<TimsesProfile> {
	if (isMockApiEnabled()) {
		return fetchProfileMock(id);
	}
	try {
		// Dibungkus { message, data } oleh TransformInterceptor global (sama pola
		// dengan /auth/login) — dikonfirmasi baca user.controller.ts + cross-check
		// client/src/pages/dpt/layout-hook.jsx (`resp.data["data"]`).
		const { data } = await apiClient.get<{ message: string; data: UserApiRecord }>(
			"/user/profile",
		);
		return mapProfile(data.data);
	} catch (error) {
		console.error("[services/profile/fetchProfile]", error);
		throw new Error("Gagal memuat data profil. Coba lagi.");
	}
}

async function updateProfileMock(
	id: number,
	input: UpdateProfileInput,
): Promise<TimsesProfile> {
	await mockDelay();
	const profile = MOCK_PROFILES[id];
	if (!profile) {
		throw new Error("Profil tidak ditemukan.");
	}
	const updated: TimsesProfile = {
		...profile,
		namaLengkap: input.namaLengkap,
	};
	MOCK_PROFILES[id] = updated;
	return updated;
}

export async function updateProfile(
	id: number,
	input: UpdateProfileInput,
): Promise<TimsesProfile> {
	if (isMockApiEnabled()) {
		return updateProfileMock(id, input);
	}
	try {
		// POST /user/profile (UserDTO) cuma terima namaLengkap + jenisKelamin —
		// jenisKelamin WAJIB di DTO backend (@IsEnum, bukan optional), jadi kirim
		// nilai profil yang sedang aktif supaya tidak ke-reset oleh validasi.
		const current = await fetchProfile(id);
		await apiClient.post("/user/profile", {
			namaLengkap: input.namaLengkap,
			jenisKelamin: current.jenisKelamin,
		});
		return fetchProfile(id);
	} catch (error) {
		console.error("[services/profile/updateProfile]", error);
		if (axios.isAxiosError(error) && error.response) {
			const message = error.response.data?.message;
			throw new Error(
				typeof message === "string"
					? message
					: "Gagal menyimpan perubahan profil.",
			);
		}
		throw new Error(
			"Gagal terhubung ke server. Periksa koneksi internet Anda.",
		);
	}
}
