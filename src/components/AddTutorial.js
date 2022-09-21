import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateTutorialMutation } from "../slices/apiSlice";

const AddTutorial = () => {
  const [message, setMessage] = useState("");
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const [createTutorial] = useCreateTutorialMutation();

  const onSubmit = async (data1) => {
    const { title, description } = data1;
    try {
      await createTutorial({ title, description }).unwrap;
      setMessage("The tutorial was added successfully!");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-floating my-3">
          <input
            type="text"
            className="form-control"
            id="title"
            placeholder="Enter title"
            defaultValue=""
            name="title"
            {...register("title", { required: true })}
          />
          <label htmlFor="title">Title: </label>
          {errors.title && <div className="text-danger">Title is required</div>}
        </div>
        <div className="form-floating my-3">
          <input
            type="text"
            className="form-control"
            id="description"
            placeholder="Enter description"
            defaultValue=""
            name="description"
            {...register("description", { required: true })}
          />
          <label htmlFor="description">Description: </label>
          {errors.description && (
            <div className="text-danger">Description is required</div>
          )}
        </div>
        <button type="submit" className="btn btn-success">
          Submit
        </button>
        <p>{message}</p>
      </form>
    </React.Fragment>
  );
};

export default AddTutorial;
