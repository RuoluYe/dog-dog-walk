import React from "react";
import { Link } from "react-router-dom";

import Avatar from "../../shared/components/UI/Avatar/Avatar";
import Card from "../../shared/components/UI/Card/Card";

import classes from "./UserItem.module.css";

function UserItem(props) {
  return (
    <li className={classes["user-item"]}>
      <Card className={classes["user-item__content"]}>
        <Link to={`/${props.id}/profile`}>
          <div className={classes["user-item__image"]}>
            <Avatar
              image={`${process.env.REACT_APP_ASSET_URL}/${props.image}`}
              alt={props.name}
            />
          </div>
          <div className={classes["user-item__info"]}>
            <h2>{props.name}</h2>
            <h3>
              {props.role}
            </h3>
          </div>
        </Link>
      </Card>
    </li>
  );
}

export default UserItem;
