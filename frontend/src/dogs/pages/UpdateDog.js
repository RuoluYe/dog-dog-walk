import React, { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input/Input";
import Button from "../../shared/components/FormElements/Button/Button";
import LoadingSpinner from "../../shared/components/UI/LoadingSpinner/LoadingSpinner";
import ErrorModal from "../../shared/components/UI/ErrorModal/ErrorModal";
import useForm from "../../shared/hooks/form-hook";
import useHttp from "../../shared/hooks/http-hook";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE
} from "../../shared/util/validators";
import { AuthContext } from "../../shared/contexts/auth-context";

import classes from "./DogForm.css";
import Card from "../../shared/components/UI/Card/Card";
// import DogItem from "../components/DogItem/DogItem";

function UpdateDog() {
  const history = useHistory();
  const dogId = useParams().dogId;
  const authContext = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttp();
  const [dog, setDog] = useState();

  const [formState, inputHandler, setFormData] = useForm({
    name: {
      value: "",
      isValid: false
    },
    description: {
      value: "",
      isValid: false
    }
  });

  useEffect(() => {
    async function fetchDog() {
      try {
        const data = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/dog/${dogId}`
        );

        setDog(data.dog);
        setFormData(
          {
            name: {
              value: data.dog.name,
              isValid: true
            },
            description: {
              value: data.dog.description,
              isValid: true
            }
          },
          true
        );
      } catch (error) {
        console.log(error);
      }
    }

    fetchDog();
  }, [setFormData, sendRequest, dogId]);

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!dog && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Couldn't find dog!</h2>
        </Card>
      </div>
    );
  }

  async function submitHandler(event) {
    event.preventDefault();

    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/dog/${dogId}`,
        "PATCH",
        JSON.stringify({
          name: formState.inputs.name.value,
          description: formState.inputs.description.value
        }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authContext.token}`
        }
      );
    } catch (error) {
      console.log(error);
    }

    history.push(`/${authContext.userId}/profile`);
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && dog && (
        <form className={classes["place-form"]} onSubmit={submitHandler}>
          <Input
            id="name"
            element="input"
            type="text"
            label="Dog name"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid name!"
            initValue={dog.name}
            initValid={true}
            onInput={inputHandler}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="At least five characters!"
            initValue={dog.description}
            initValid={true}
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            Update dog infomation
          </Button>
        </form>
      )}
    </>
  );
}

export default UpdateDog;
