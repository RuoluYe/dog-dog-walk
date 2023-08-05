import React, { Suspense, useCallback, useEffect } from "react";
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

let logoutTimer;

function App() {
  const [token, setToken] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState()
  const [userId, setUserId] = useState(false);

  const login = useCallback((uid, token, expirationDate) => {
    setToken(token);
    setUserId(uid);
    // log out time
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
        expiration: tokenExpirationDate.toISOString()
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(false);
    localStorage.removeItem('userData')
  }, []);
  
  // auto log out, when log out, clear timer, when log in, set a new timer
  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer =setTimeout(logout, remainTime)
    } else { // manual logged out 
      clearTimeout(logoutTimer)
    }
  }, [token, logout, tokenExpirationDate])

  // keep loggin in
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      );
    }
  }, [login]);

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
