import React, { useEffect, useState } from 'react'


function App() {

  const [data, setData] = useState([])

  useEffect(() => {
    fetch("http://localhost:8080/projects")
    .then (res => res.json())
    .then (data => setData(data))
    .catch (err => console.error(err))
  }, [])

  return (
    <div>
      {data.map((d, i) => (
        <div key={i}>
          <p>{d.id}</p>
          <p>{d.title}</p>
          <p>{d.contents}</p>
          <p>{d.created}</p>
          <p>-----------------------------------------------</p>
        </div>
      ))}
    </div>
  )
}

export default App