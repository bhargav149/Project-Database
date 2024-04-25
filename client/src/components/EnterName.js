import React, { useState } from 'react';
import './EnterName.css';
import { Info } from 'lucide-react';
import { Tooltip } from '@mui/material';


function EnterName({ user, onClose, updateUserName }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  //USE FIRST URL FOR LOCAL DEVELOPMENT AND SECOND FOR DEPLOYMENT
  // const url = "http://localhost:8080/";
  const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim() === '') {
      setError(true);
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to set your name to ${name}? You will not be able to change your name.`);
    if (!confirmed) {
      return;
    }

    setLoading(true);
  
    fetch(url + "user/" + user)
      .then((res) => res.json())
      .then((data) => {
        console.log('Entered name:', name);
        fetch(url + "name", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pid: user,
            name: name,
          }),
        })
        .then(response => response.text()) // Parse response as text
        .then(data => {
          console.log('Submitted Name:', name);
          if (data === 'Name set successfully') { // Check if response matches expected string
            updateUserName(name);
            onClose(); // Close modal
          } else {
            console.error('Error setting user\'s name');
            // Handle error condition here, if needed
          }
        })
        .finally(() => {
          setLoading(false);
        });
      });
  };  

  return (
    <div className="enter-name-modal">
          <div className="enter-name-container">
            <form className="name-form" onSubmit={handleSubmit}>
            <div className="label-input-container">
              <p><strong>You must register your name before continuing</strong></p>
              <div className="input-tooltip-container">
                <label htmlFor="nameInput">Full Name: </label>
                <input
                  type="text"
                  id="nameInput"
                  name="name"
                  placeholder='e.g. Jane Doe'
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(false);
                  }}
                  className={`enter-name-input ${error ? 'input-error' : ''}`}
                />
                <Tooltip title="This name will be displayed when you join a team and is visible to everyone.">
                  <span>
                    <Info size={24} style={{color: '#3371FF', verticalAlign: 'middle', marginLeft: '4px'}}/>
                  </span>
                </Tooltip>
              </div>
              {error && <div className="error">* Name cannot be empty</div>}
            </div>
              <button
                type="submit"
                id="submitButton"
                className='enter-name-submit-button'
                onClick={handleSubmit}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
  );
}

export default EnterName;