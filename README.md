# RTK Query CRUD example with React Hooks
[bezkoder provides an example](https://www.bezkoder.com/redux-toolkit-crud-react-hooks/) of CRUD operations on the client side (using createAsyncThunk and createSlice functions of Redux Toolkit and Axios CRUD functions) to access [the corresponding Rest APIs](https://www.bezkoder.com/spring-boot-jpa-crud-rest-api/) (developed using Spring Boot, Spring Data JPA, and mySQL database on the server side).

The resources provided by the server side are Tutorial objects, each of them has id, title, description, and published status.  This React app supports the creation, retrieval, update and deletion of these tutorial objects. The user interface consists of two tabs, the Tutorial tab (home page) shows a list of tutorial titles, and provides a Search bar for users to find specific tutorials using words contained in their titles.  Users can select a tutorial to see the details of the tutorial, and then edit or delete the tutorial.

This example shows how to re-implement the client-side of the CRUD operations using Redux-Toolkit Query (mainly the createApi function together with its auto generated query and mutation hooks). With Redux-Toolkit Query, the previous simple CRUD operations have been transformed into a sophisticated cache management solution that avoids duplicate requests for the same data and refetches when necessary so as to keep the data changes on the client-side largely in sync with the changes on the server side.

The main method of refreshing data with RTK Query is using Cache Tags.  We can provide a tag or multiple tags to a query endpoint such that all the affected resources from the query endpoint will be marked with the tag(s).  A mutation endpoint can be defined to invalidate the tag or tags provided to the query endpoints.  Once the mutation endpoint is called, all the query endpoints with the tag (or tags) will automatically refetch and update the cache (the Redux store).  To keep data in sych with the changes made by other users to the data on the server, RTK Query provides several other manual and automatical methods for cache invalidation, e.g., a refetch function returned by the auto-generated query hooks for developers to call manually, and a `keepUnusedDataFor` field can be defined for both the API and per-endpoint to automatically invalidate the data fetched from the endpoint(s) (if not defined, a default value of 60 seconds is taken).

The following code (in `apiSlice.js` under the `slices` directory) shows how data fetching and mutation with RTK Query are implemented for the corresponding endpoints of the above-mentioned Rest APIs.  More specifically, `getTutorials` provides a tutorial-specific tag `{type: "Tutorial", id}` and a tutorial-list tag `{type: "Tutorial", id: "LIST"}` for each received tutorial in the list; `getTutorial` provides a tutorial-specific tag `{type: 'Tutorial', id}` for the tutorial with the given identify; `createTutorial` and `deleteTutorial` as well as `deleteTutorials` invalidate the tutorial-list tag `{type: "Tutorial", id: "LIST"}` for refetching the whole list;
`updateTutorial` invalidates both the tutorial-specific tag `{type: 'Tutorial', id}` tag and the tutorial-list tag `{type: "Tutorial", id: "LIST"}` (where "LIST" is just a label for the tutorial list, not a real id of any tutorial object).  This will force a refetch of both the individual tutorial (with the id) fetched by getTutorial, as well as the entire list of tutorials fetched by getTutorials, because they are marked by (at least) one of the two tags.

```
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

```
The list-specific tag `{type: "Tutorial", id: "LIST"}` can be used to invalidate the tutorial list efficiently.   If the general tag `Tutorial` or `{type: "Tutorial"}` is used to mark and invalidate the list, once the general tag is invalidated by a mutation operation, in addition to the tutorial list fetched by getTutorials, all the individual tutorials (fetched separately by getTutorial) in the cache will also be refreshed. In case most of the tutorials kept on the server are relatively stable such refreshing are unnecessary.

RTK Query can also generate React hooks that encapsulate the entire data fetching process, provide `data` and `isLoading` fields to components, and manage the lifetime of cached data as components mount and unmount.  At the end of the code as shown above, multiple custom hooks, one for each endpoint, have been generated.  For example, we can use the `useGetTutorialQuery` and `useUpdateTutorialMutation` (in `Tutorial.js`) to keep track of requests lifecycle (e.g `isLoading`, `isSeccess`, and `isError`):

```
  ...
  const Tutorial = (props) => {
  ...
    const {
      data: tutorial,
      isSuccess,
      isLoading,
      isError,
    } = useGetTutorialQuery(id);

    const [updateTutorial] = useUpdateTutorialMutation();
  ...
    const updateContent = async (data) => {
      currentTutorial.current = {
        ...currentTutorial.current,
        title: data.title,
        description: data.description,
      };

      try {
        await updateTutorial({
          id: currentTutorial.current.id,
          tutorial: currentTutorial.current,
        }).unwrap;
        setMessage("The tutorial was updated successfully!");
      } catch (e) {
        console.log(e);
      }
    };
    ...
    return (
      <div>
        {isSuccess ? (
          //display the tutorial 
                    <h4>Tutorial</h4>
          <form onSubmit={handleSubmit(updateContent)}>
            <div>
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={tutorial.title}
                {...register("title", {
                  required: "this field is required",
                  maxLength: 20,
                })}
              />
            ...
           </form>
           ...
         ) : isLoading ? (
          "... loading"
         ) : isError ? (
          "error"
         ) 
        ...
      </div>
  }

```
With RTK Query, we can use the same tutorials query to fetch and display a list of tutorials, or extract only part of the data, e.g., with only those tutorials whose titles contain the characters or words entered by the user in the search bar, as shown in the following code from `TutorialsList.js` in the components folder:
```
  ...
  const TutorialsList = () => {
    const [currentTutorial, setCurrentTutorial] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTitle, setSearchTitle] = useState("");
    ...
    const { tutorialsWithTitle: tutorials } = useGetTutorialsQuery(undefined, {
      selectFromResult: (result) => ({
        ...result,
        tutorialsWithTitle: selectTutorialsWithTitle(result, searchTitle),
      }),
    });
  ...
```
When the searchTitle is an empty string, all tutorials returned; while when the searchTitle is updated with inputs from the user, only those matching tutorials will be returned by the useGetTutorialsQuery hook.  As TutorialsList is a controlled component in term of the search bar, the returned tutorial list is updated dynamically with the input of every chararter in the search bar (as shown in the screenshot). 

![redux-toolkit-crud-hooks-example](redux-toolkit-crud-hooks-example.png)

This example focues on the use of RTK Query.  Other changes to the original code includes the use of `React Hook Forms` for input data validation (in `AddTutorials.js` and `Tutorial.js`), and the newer versions of `React Router` (v6) and `Boostrap` (v5) for navigation and responsitive user interface layout.

## Project setup

After downloaded the code of this project from github, you may install the project in the project directory by running the following command:

`npm install`

To try and run the example, you need to [download the source code of the server](
https://github.com/bezkoder/spring-boot-data-jpa-mysql) and [follow the tutorial and instructions](https://www.bezkoder.com/spring-boot-jpa-crud-rest-api/) to set up and run the backend of this app, so as to make its Rest APIs availablle.

Then, you may compile and run this project using the following command:

`npm start`

and finally open [http://localhost:8081](http://localhost:8081) to access the app in your web browser (as PORT=8081 is given in `.env` under the project root directory).

