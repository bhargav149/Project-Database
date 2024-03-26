import React, { useEffect } from "react";
import "../css/Home.css";

function Home() {
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
    <div className="home-container">
      <div className="home-body">
        <div>
          <h1>Mern Stack w/ CAS Authentication</h1>
          <h2>By Dockerworkers Fall 2022</h2>
        </div>
        <header>
          <p>{user ? "Welcome " + user : ""}</p>
        </header>
        <div className="home-auth">
          {!user ? (
            <a href="/api/login">Login</a>
          ) : (
            <a href="/api/logout">Logout</a>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
