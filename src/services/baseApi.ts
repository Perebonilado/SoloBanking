import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";

export const TAG_TYPES = [
  "Balance",
  "Transaction",
  "Beneficiary",
  "Bank",
] as const;

export type TagType = (typeof TAG_TYPES)[number];

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).session.accessToken;
      if (token && !headers.has("authorization")) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: TAG_TYPES,
  endpoints: () => ({}),
});
