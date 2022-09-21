import React, { useState, useMemo } from "react";
import { createSelector } from "@reduxjs/toolkit";
import { Link } from "react-router-dom";
import {
  useGetTutorialsQuery,
  useDeleteTutorialsMutation,
} from "../slices/apiSlice";

const TutorialsList = () => {
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchTitle, setSearchTitle] = useState("");

  const selectTutorialsWithTitle = useMemo(() => {
    const emptyArray = [];
    // Return a unique selector instance for this page so that
    // the filtered results are correctly memoized
    return createSelector(
      (res) => res.data,
      (res, title) => title,
      (data, title) =>
        data?.filter((tutorial) => tutorial.title.includes(title)) ?? emptyArray
    );
  }, []);

  // Use the same tutorials query, but extract only part of its data
  const { tutorialsWithTitle: tutorials } = useGetTutorialsQuery(undefined, {
    selectFromResult: (result) => ({
      ...result,
      tutorialsWithTitle: selectTutorialsWithTitle(result, searchTitle),
    }),
  });

  const [deleteAll] = useDeleteTutorialsMutation();

  const onChangeSearchTitle = (e) => {
    const stringInTitle = e.target.value;
    setSearchTitle(stringInTitle);
  };

  const refreshData = () => {
    setCurrentTutorial(null);
    setCurrentIndex(-1);
  };

  const setActiveTutorial = (tutorial, index) => {
    setCurrentTutorial(tutorial);
    setCurrentIndex(index);
  };

  const removeAllTutorials = async () => {
    try {
      await deleteAll();
    } catch (err) {
      console.log("delete all error");
    }
  };

  const findByTitle = (searchTitle) => {
    refreshData();
  };

  return (
    <div className="row">
      <div className="col-md-8">
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title"
            value={searchTitle}
            onChange={onChangeSearchTitle}
          />
          <button
            className="btn btn-success"
            type="button"
            onClick={findByTitle}
          >
            Search
          </button>
        </div>
      </div>
      <div className="col-md-6">
        <h4>Tutorials List</h4>

        <ul className="list-group">
          {tutorials &&
            tutorials.map((tutorial, index) => (
              <li
                className={
                  "list-group-item " + (index === currentIndex ? "active" : "")
                }
                onClick={() => setActiveTutorial(tutorial, index)}
                key={index}
              >
                {tutorial.title}
              </li>
            ))}
        </ul>

        <button
          className="m-3 btn btn-sm btn-danger"
          onClick={removeAllTutorials}
        >
          Remove All
        </button>
      </div>
      <div className="col-md-6">
        {currentTutorial ? (
          <div>
            <h4>Tutorial</h4>
            <div>
              <label>
                <strong>Title:</strong>
              </label>{" "}
              {currentTutorial.title}
            </div>
            <div>
              <label>
                <strong>Description:</strong>
              </label>{" "}
              {currentTutorial.description}
            </div>
            <div>
              <label>
                <strong>Status:</strong>
              </label>{" "}
              {currentTutorial.published ? "Published" : "Unpublished"}
            </div>
            <Link
              to={"/tutorials/" + currentTutorial.id}
              className="btn btn-primary"
            >
              Edit
            </Link>
          </div>
        ) : (
          <div>
            <br />
            <p>Please click on a Tutorial...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialsList;
