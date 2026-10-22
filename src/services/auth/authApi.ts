import { baseApi } from "@/services/baseApi";
import type {
  EncryptedEnvelope,
  LoginResult,
  PublicKey,
} from "@/types/banking";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicKey: build.query<PublicKey, void>({
      query: () => "auth/public-key",
    }),
    login: build.mutation<LoginResult, EncryptedEnvelope>({
      query: (body) => ({ url: "auth/login", method: "POST", body }),
    }),
    logout: build.mutation<void, string>({
      query: (accessToken) => ({
        url: "auth/logout",
        method: "POST",
        headers: { authorization: `Bearer ${accessToken}` },
      }),
    }),
  }),
});

export const { useGetPublicKeyQuery, useLoginMutation, useLogoutMutation } =
  authApi;
