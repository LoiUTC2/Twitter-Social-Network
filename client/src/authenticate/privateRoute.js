import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import NotFound from '../pages/NotFound';


function PrivateRoute({ element, isAuthenticated, ...rest }) {
    return (
        <Route path='login' element={ <NotFound/>} />
    // <Route
    //   {...rest}
    //   render={({ location }) =>
    //     isAuthenticated && (
    //         element
    //       )
    //     //       : (
    //     //   <Navigate to="/login" />
    //     // )
    //   }
    // />
  );
}

export default PrivateRoute;
