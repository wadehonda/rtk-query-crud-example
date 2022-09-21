import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import {
  useGetTutorialQuery,
  useUpdateTutorialMutation,
  useDeleteTutorialMutation,
} from "../slices/apiSlice";
import { useNavigate } from "react-router-dom";

const Tutorial = (props) => {
  let { id } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  let navigate = useNavigate();

  const initialTutorialState = {
    id: null,
    title: "",
    description: "",
    published: false,
  };

  const currentTutorial = useRef(initialTutorialState);
  const [message, setMessage] = useState("");
  const {
    data: tutorial,
    isSuccess,
    isLoading,
    isError,
  } = useGetTutorialQuery(id);

  const [deleteTutorial] = useDeleteTutorialMutation();
  const [updateTutorial] = useUpdateTutorialMutation();

  const updateStatus = async (status) => {
    currentTutorial.current = {
      ...currentTutorial.current,
      published: status,
    };
    try {
      await updateTutorial({
        id: currentTutorial.current.id,
        tutorial: currentTutorial.current,
      }).unwrap;
      setMessage("The status was updated successfully!");
    } catch (e) {
      console.log(e);
    }
  };

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

  const removeTutorial = () => {
    deleteTutorial(currentTutorial.current.id);
    navigate("/tutorials");
  };

  if (isSuccess) {
    currentTutorial.current = tutorial;
  }

  return (
    <div>
      {isSuccess ? (
        <div>
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
              <small className="text-danger">
                {errors?.title && errors.title.message}
              </small>
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                defaultValue={tutorial.description}
                {...register("description", {
                  required: "this field is required",
                  maxLength: 200,
                })}
              />
              <small className="text-danger">
                {errors?.description && errors.description.message}
              </small>
            </div>

            <div>
              <label>
                <strong>Status:</strong>
              </label>
              {tutorial.published ? "Published" : "Unpublished"}
            </div>

            <input className="btn btn-info btn-sm me-2" type="submit" />
            <p>{message}</p>
          </form>

          {tutorial.published ? (
            <button
              className="btn btn-primary btn-sm me-2"
              onClick={() => updateStatus(false)}
            >
              UnPublish
            </button>
          ) : (
            <button
              className="btn btn-info btn-sm me-2"
              onClick={() => updateStatus(true)}
            >
              Publish
            </button>
          )}

          <button className="btn btn-info btn-sm me-2" onClick={removeTutorial}>
            Delete
          </button>
        </div>
      ) : isLoading ? (
        "... loading"
      ) : isError ? (
        "error"
      ) : (
        "undefined"
      )}
    </div>
  );
};

export default Tutorial;
