import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "tutApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  tagTypes: ["Tutorial"],
  endpoints: (build) => ({
    getTutorials: build.query({
      query: () => "/tutorials",
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Tutorial", id })),
              { type: "Tutorial", id: "LIST" },
            ]
          : [{ type: "Tutorial", id: "LIST" }],
    }),
    getTutorial: build.query({
      query: (id) => `/tutorials/${id}`,
      providesTags: (result, error, arg) => [{ type: "Tutorial", id: arg }],
    }),
    createTutorial: build.mutation({
      query: (tutorial) => ({
        url: "/tutorials",
        method: "POST",
        body: tutorial,
      }),
      invalidatesTags: [{ type: "Tutorial", id: "LIST" }],
    }),
    updateTutorial: build.mutation({
      query: ({ id, tutorial }) => ({
        url: `/tutorials/${id}`,
        method: "PUT",
        body: tutorial,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Tutorial", id: arg.id },
        { type: "Tutorial", id: "LIST" },
      ],
    }),
    deleteTutorial: build.mutation({
      query: (id) => ({
        url: `/tutorials/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Tutorial", id: "LIST" }],
    }),
    deleteTutorials: build.mutation({
      query: () => ({
        url: "/tutorials",
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Tutorial", id: "LIST" }],
    }),
    getPublishedTutorials: build.query({
      query: () => "/tutorials/published",
    }),
    getTutorialsByTitle: build.query({
      query: ({ title }) => `/tutorials?title=${title}`,
    }),
  }),
});

export const {
  useGetTutorialsQuery,
  useGetTutorialQuery,
  useGetPublishedTutorialsQuery,
  useCreateTutorialMutation,
  useUpdateTutorialMutation,
  useDeleteTutorialMutation,
  useDeleteTutorialsMutation,
  useGetTutorialsByTitleQuery,
} = apiSlice;
