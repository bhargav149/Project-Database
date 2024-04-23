import React, { useState } from 'react';
import App from './LandingPage';
// import './EnterName.css'

// import './EnterName.css'; // Adjust the path as necessary ( i have named it style_login.css for now)

function Profile(user) {
  const [name, setName] = useState('');
  const [submittedName, setSubmittedName] = useState('')
      //USE FIRST URL FOR LOCAL DEVELOPMENT AND SECOND FOR DEPLOYMENT
      const url = "http://localhost:8080/";
      // const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"

    //   console.log("New name: ", name, user.user)

      const handleSubmit = async (e) => {
        e.preventDefault();
        fetch(url + "user/" + user.user)
          .then((res) => res.json())
          .then((data) => {
            console.log('Submitted Name:', name);
            fetch(url + "name", {
              method: "POST",
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                pid: user.user,
                name: name,
              }),
            })
              .then((data) => {
                console.log("new name: ", name);
                setSubmittedName(name); // Update submittedName state after submission

              })
              .catch(err => console.error(err));
          });
        // Clear the input after submission
        setName('');
      };
      return (
        <div>
          {submittedName === '' ? (
            <div>
              <header>
                <h1>Create Profile</h1>
              </header>
              <div className="container">
                <form className="name-form" onSubmit={handleSubmit}>
                  <label htmlFor="nameInput">ENTER YOUR NAME:</label>
                  <input
                    type="text"
                    id="nameInput"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <button type="submit" id="submitButton" disabled={name.length === 0}>SUBMIT</button>
                </form>
              </div>
            </div>
          ) : (
            <App />
          )}
        </div>
      );
    }
    
    export default Profile;