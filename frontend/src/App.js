import React, { Suspense } from "react";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

import MainNavigation from "./shared/components/Navigation/MainNavigation/MainNavigation";
import Users from "./user/pages/Users";
import useAuth from "./shared/hooks/auth-hook";
import { AuthContext } from "./shared/contexts/auth-context";
import LoadingSpinner from "./shared/components/UI/LoadingSpinner/LoadingSpinner";

const UserProfile = React.lazy(() => import("./dogs/pages/UpdateDog"));
const NewDog = React.lazy(() => import("./dogs/pages/NewDog"));
const UpdateDog = React.lazy(() => import("./dogs/pages/UpdateDog"));
const Auth = React.lazy(() => import("./user/pages/Auth/Auth"));

function App() {
  const { userId, token, login, logout } = useAuth();
  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/" exact>
          <UserProfile />
        </Route>
        <Route path="/dogs/new" exact>
          <NewDog />
        </Route>
        <Route path="/dogs/:dId" exact>
          <UpdateDog />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/profile" exact>
          <UserProfile />
        </Route>
        <Route path="/auth" exact>
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: !!token, token, userId, login, logout }}
    >
      <BrowserRouter>
        <MainNavigation />
        <main>
          <Suspense
            fallback={
              <div className="center">
                <LoadingSpinner />
              </div>
            }
          >
            {routes}
          </Suspense>
        </main>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
