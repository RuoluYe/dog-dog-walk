import React from "react";

import Card from "../../../shared/components/UI/Card/Card";
import Button from "../../../shared/components/FormElements/Button/Button";
import DogItem from "../DogItem/DogItem";

import classes from "./DogList.css";

function DogList(props) {
  if (props.items.length === 0) {
    return (
      <Card className={`${classes["place-list"]} center`}>
        <Button to="/dogs/new">Add my dog</Button>
      </Card>
    );
  }

  return (
    <ul className={classes["place-list"]}>
      {props.items.map((dog) => (
        <DogItem
          key={dog.id}
          id={dog.id}
          image={dog.image}
          name={dog.name}
          description={dog.description}
          address={dog.address}
          ownerId={dog.owner}
          coordinates={dog.location}
          onDelete={dog.onDelete}
        />
      ))}
    </ul>
  );
}

export default DogList;
