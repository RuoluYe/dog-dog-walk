import React, { useContext } from "react";
import { NavLink } from "react-router-dom";

import Button from "../../FormElements/Button/Button";
import { AuthContext } from "../../../contexts/auth-context";

import classes from "./NavLinks.module.css";

function NavLinks() {
  const authContext = useContext(AuthContext);

  return (
    <ul className={classes["nav-links"]}>
      <li>
        <NavLink to={"/"} exact>All People</NavLink>
      </li>
      {authContext.isLoggedIn && (
        <li>
          <NavLink to={`/${authContext.userId}/profile`}>My Profile</NavLink>
        </li>
      )} 
      {authContext.isLoggedIn && (
        <li>
          <NavLink to={"/dogs/new"}>Add Dog</NavLink>
        </li>
      )} 
      {!authContext.isLoggedIn && (
        <li>
          <NavLink to={"/auth"}>Login</NavLink>
        </li>
      )}
      {authContext.isLoggedIn && (
        <li>
          <Button onClick={authContext.logout}>Logout</Button>
        </li>
      )}
    </ul>
  );
}

export default NavLinks;
