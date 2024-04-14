import React, { useEffect, useState } from 'react'
import App from './components/LandingPage'
import Home from './components/Home'
import Profile from './components/EnterName'


function MainPage() {
    const [user, setUser] = React.useState('');
    const [name, setName] = React.useState(null)

    //USE FIRST URL FOR LOCAL DEVELOPMENT AND SECOND FOR DEPLOYMENT
    const url = "http://localhost:8080/";
  // const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"

    // useEffect(() => {   
    //   // getCurrentUser()
    //   setUser('x1')
    //   getName();
    //   console.log("name: ",name, user, !user, name === 'None' || name === null || name === '')
    // }, []);

    function getCurrentUser() {
      fetch("/api/currentUser")
         .then((res) => res.json())
         .then((data) => {
           setUser(data.user)
           getName()
         });
     }   

    async function getName() {
      fetch(url+"name/"+user)
     .then((res)=>res.json())
     .then((data)=>{
       if(data){
         setName(data.name)
         console.log(data)
         console.log("Found name", name)
       }
       else{
         console.log('user',user)
       }
     })
   }
   useEffect(()=>{   
    setUser('atink')
    // getCurrentUser()
   getName()
   console.log("name: ",name, user, !user, name === 'None' || name === null || name === '')
  }, [getName, name, user])

    return (
        <div className="home-auth">
          {!user ? (
              // replace with login component when finished
              <Home/>
            ) : (
              name === 'None' || name === null || name === '' ? (
                <Profile user={user}/>
              ) : (
                <App/>
              )
            )}
        </div>
    )
    
}
export default MainPage;