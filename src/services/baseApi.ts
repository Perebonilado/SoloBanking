import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const TAG_TYPES = [] as const;

export type TagType = (typeof TAG_TYPES)[number];

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  }),
  tagTypes: TAG_TYPES,
  endpoints: () => ({}),
});
