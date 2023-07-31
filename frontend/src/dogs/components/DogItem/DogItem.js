import React, { useContext, useState } from "react";

import Button from "../../../shared/components/FormElements/Button/Button";
import Card from "../../../shared/components/UI/Card/Card";
import Modal from "../../../shared/components/UI/Modal/Modal";
import Map from "../../../shared/components/UI/Map/Map";
import ErrorModal from "../../../shared/components/UI/ErrorModal/ErrorModal";
import LoadingSpinner from "../../../shared/components/UI/LoadingSpinner/LoadingSpinner";
import useHttp from "../../../shared/hooks/http-hook";
import { AuthContext } from "../../../shared/contexts/auth-context";

import classes from "./DogItem.css";

function DogItem(props) {
  const { isLoading, error, sendRequest, clearError } = useHttp();
  const [showMap, setShowMap] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const authContext = useContext(AuthContext);

  function toggleMapHandler() {
    setShowMap(!showMap);
  }

  function toggleShowDeleteModalHandler() {
    setShowDeleteModal(!showDeleteModal);
  }

  async function deleteHandler() {
    setShowDeleteModal(false);

    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/${props.id}`,
        "DELETE",
        null,
        {
          Authorization: `Bearer ${authContext.token}`,
        }
      );

      props.onDelete(props.id);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {/* <Modal
        show={showMap}
        onCancel={toggleMapHandler}
        header={props.address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={toggleMapHandler}>Close</Button>}
      >
        <div className={classes["map-container"]}>
          <Map center={props.coordinates} zoom={16} />
        </div>
      </Modal> */}
      <Modal
        show={showDeleteModal}
        onCancel={toggleShowDeleteModalHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <>
            <Button onClick={toggleShowDeleteModalHandler} inverse>
              Cancel
            </Button>
            <Button onClick={deleteHandler} danger>
              Delete
            </Button>
          </>
        }
      >
        <p style={{ margin: "1rem" }}>
          Are you sure you want to delete this place? This action cannot be
          undone!
        </p>
      </Modal>
      {/* todo #5
      <Modal
        show={showContact}
        onCancel={toggleContactHandler}
        header={"Contact"}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={toggleMapHandler}>Close</Button>}
      >
        <div className={classes["place-item__info"]}>
            <h2>{props.name}</h2>
            <h3>{props.email}</h3>
            // other contact info
        </div>
      </Modal> */}
      <li className={classes["place-item"]}>
        <Card className={classes["place-item__content"]}>
          {isLoading && <LoadingSpinner asOverlay />}
          <div className={classes["place-item__image"]}>
            <img
              src={`${process.env.REACT_APP_ASSET_URL}/${props.image}`}
              alt={props.name}
            />
          </div>
          <div className={classes["place-item__info"]}>
            <h2>{props.name}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
            <div className={classes["map-container"]}>
              <h3>Location</h3>
              <Map center={props.coordinates} zoom={16} />
            </div>
          </div>
          <div className={classes["place-item__actions"]}>
            <Button onClick={toggleMapHandler} inverse>
              View on map
            </Button>
            {authContext.userId === props.ownerId && (
              <>
                <Button to={`/dogs/${props.id}`}>Edit</Button>
                <Button onClick={toggleShowDeleteModalHandler} danger>
                  Delete
                </Button>
              </>
            )}
            {/* todo #2
            {authContext.userId !== props.ownerId && <Button onClick={showContactHandler}> Walk Me!</Button>}  
            */}
          </div>
        </Card>
      </li>
    </>
  );
}

export default DogItem;
