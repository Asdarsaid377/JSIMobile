import axios from "axios";

import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type { AuthUser } from "@/types/auth";

type LoginInput = {
	nik: string;
	password: string;
	location: { lat: number; long: number };
};

// Shape re-verified 2026-08-23 langsung ke /Users/asdarsaid/JSI/api/src/auth
// (controller pakai SignInDto + main.ts pasang CustomValidationPipe +
// TransformInterceptor global) — response DIBUNGKUS { message, data }, bukan
// flat seperti dokumentasi lama. Lihat api-standards.md Auth Flow.
type LoginApiResponse = {
	message: string;
	data: {
		id: number;
		nik: string;
		namaLengkap: string;
		roles: AuthUser["roles"];
		acces_token: string;
	};
};

// Akun demo — dipakai selama EXPO_PUBLIC_USE_MOCK_API=true karena backend production
// diblokir Cloudflare Managed Challenge (lihat api-standards.md § Mock Mode).
// Pesan gagal login meniru persis behavior backend asli (selalu generik, lihat
// Auth Flow poin 5) supaya UI tetap konsisten begitu mock dimatikan.
const MOCK_ACCOUNTS: { nik: string; password: string; user: AuthUser }[] = [
	{
		nik: "admin.jsi",
		password: "admin123",
		user: {
			id: 1,
			nik: "admin.jsi",
			namaLengkap: "Admin Pemenangan",
			roles: "admin",
		},
	},
	{
		nik: "yayat.hidayat",
		password: "timses123",
		user: {
			id: 2,
			nik: "yayat.hidayat",
			namaLengkap: "Yayat Hidayat",
			roles: "timses",
		},
	},
];

async function loginRequestMock(
	input: LoginInput,
): Promise<{ token: string; user: AuthUser }> {
	await mockDelay();
	const account = MOCK_ACCOUNTS.find(
		(a) => a.nik === input.nik && a.password === input.password,
	);
	if (!account) {
		throw new Error("Periksa kembali data yang di masukan");
	}
	return { token: `mock-token-${account.user.id}`, user: account.user };
}

export async function loginRequest(
	input: LoginInput,
): Promise<{ token: string; user: AuthUser }> {
	if (isMockApiEnabled()) {
		return loginRequestMock(input);
	}
	try {
		// DTO backend field-nya "username" (dicocokkan ke kolom nik di server),
		// bukan "nik" — lihat api-standards.md Auth Flow untuk verifikasi.
		const { data } = await apiClient.post<LoginApiResponse>("/auth/login", {
			username: input.nik,
			password: input.password,
			location: input.location,
		});
		return {
			token: data.data.acces_token,
			user: {
				id: data.data.id,
				nik: data.data.nik,
				namaLengkap: data.data.namaLengkap,
				roles: data.data.roles,
			},
		};
	} catch (error) {
		console.error("[services/auth/loginRequest]", error);
		if (axios.isAxiosError(error) && error.response) {
			const message = error.response.data?.message;
			throw new Error(
				typeof message === "string"
					? message
					: "Gagal login. Periksa kembali NIK dan password.",
			);
		}
		throw new Error(
			"Gagal terhubung ke server. Periksa koneksi internet Anda.",
		);
	}
}
