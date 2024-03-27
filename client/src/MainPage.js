import React, { useEffect, useState } from 'react'
import App from './components/LandingPage'
import Home from './components/Home'

function MainPage() {
    const [user, setUser] = React.useState(null);

    useEffect(() => {
      async function getCurrentUser() {
        await fetch("/api/currentUser")
          .then((res) => res.json())
          .then((data) => setUser(data.user));
      }
      getCurrentUser();
    }, []);
    return (
        <div className="home-auth">
          {!user ? (
            // replace with login component when finished
          <Home/>
          ) : (
            <App/>
          )}
        </div>
    )
    
}
export default MainPage;