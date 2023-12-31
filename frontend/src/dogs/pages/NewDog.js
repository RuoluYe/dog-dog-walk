import React, { useContext } from "react";
import { useHistory } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input/Input";
import Button from "../../shared/components/FormElements/Button/Button";
import ErrorModal from "../../shared/components/UI/ErrorModal/ErrorModal";
import LoadingSpinner from "../../shared/components/UI/LoadingSpinner/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload/ImageUpload";
import useForm from "../../shared/hooks/form-hook";
import useHttp from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/contexts/auth-context";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE
} from "../../shared/util/validators";

import classes from "./DogForm.css";

function NewDog() {
  const history = useHistory();
  const authContext = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttp();
  const [formState, inputHandler] = useForm(
    {
      name: {
        value: "",
        isValid: false
      },
      description: {
        value: "e.g. When does your dog need to be walked? What should walkers be mindful of?",
        isValid: false
      },
      address: {
        value: "",
        isValid: false
      },
      image: {
        value: null,
        isValid: false
      }
    },
    false
  );

  async function placeSubmitHandler(event) {
    event.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", formState.inputs.name.value);
      formData.append("description", formState.inputs.description.value);
      formData.append("address", formState.inputs.address.value);
      formData.append("image", formState.inputs.image.value);

      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/dog`,
        "POST",
        formData,
        {
          Authorization: `Bearer ${authContext.token}`
        }
      );

      history.push("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <form className={classes["place-form"]} onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="name"
          element="input"
          type="text"
          label="Dog Name"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid name!"
          onInput={inputHandler}
        />
        <Input
          id="description"
          label="Description"
          // validators={[VALIDATOR_MINLENGTH(5)]}
          validators={[]}
          errorText="At least five characters!"
          onInput={inputHandler}
        />
        <Input
          id="address"
          element="input"
          label="Address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid address!"
          onInput={inputHandler}
        />
        <ImageUpload
          id="image"
          onInput={inputHandler}
          errorText="Please provide an image!"
        />
        <Button type="submit" disabled={!formState.isValid}>
          Add dog
        </Button>
      </form>
    </>
  );
}

export default NewDog;
// usecallback 2 40 13