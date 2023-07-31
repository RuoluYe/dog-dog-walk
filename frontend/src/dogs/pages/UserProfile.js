import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import DogList from "../components/DogList/DogList";
// import volunteer description
import ErrorModal from "../../shared/components/UI/ErrorModal/ErrorModal";
import LoadingSpinner from "../../shared/components/UI/LoadingSpinner/LoadingSpinner";
import useHttp from "../../shared/hooks/http-hook";

function UserProfile() {
  const { isLoading, error, sendRequest, clearError } = useHttp();
  const [dogs, setDogs] = useState();
  const userId = useParams().userId;

  useEffect(() => {
    // todo #3
    async function fetchDogs() {
      try {
        const data = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/dogs/user/${userId}`
        );

        setDogs(data.dogs);
      } catch (error) {
        console.log(error);
      }
    }

    fetchDogs();
  }, [sendRequest, userId]);

  function deletePlaceHandler(dogId) {
    setDogs((prevDogs) =>
    prevDogs.filter((dog) => dog.id !== dogId)
    );
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {/* todo #4 */}
      {/* {!isLoading && (
        <UserInfo items={userInfo} />
      )} */}
      {!isLoading && dogs && (
        <DogList items={dogs} onDelete={deletePlaceHandler} />
      )}
      ;
    </>
  );
}

export default UserProfile;
