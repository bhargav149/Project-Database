import React, { useEffect, useState } from 'react'
import './App.css';
import AddProjectForm from './components/AddProjectForm';

function App() {

  const [data, setData] = useState([])

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    fetch("http://localhost:8080/projects")
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err));
  };

  const addProject = (project) => {
    fetch("http://localhost:8080/projects", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: project.title,
        contents: project.contents,
        stack: project.stack,
        team_name: project.team_name,
        team_members: project.team_members
      }),
    })
    .then(response => response.json())
    .then(() => fetchProjects())
    .catch(err => console.error(err));
  };
  
  const deleteProject = (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this project?");
    if (!isConfirmed) {
      return;
    }
  
    fetch(`http://localhost:8080/projects/${id}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (response.ok) {
        setData(data.filter(project => project.id !== id));
      } else {
        alert('Failed to delete the project');
      }
    })
    .catch(err => console.error('Error:', err));
  };  

  return (
    <div className="container">
      {data.map((d, i) => (
        <div key={i} className="card">
          {/* <p><strong>ID:</strong> {d.id}</p> */}
          <p><strong>Title:</strong> {d.title}</p>
          <p><strong>Description:</strong> {d.contents}</p>
          <p><strong>Stack:</strong> {d.stack}</p>
          <p><strong>Team Name:</strong> {d.team_name}</p>
          <p><strong>Team Members:</strong> {d.team_members}</p>
          <p><strong>Created:</strong> {d.created}</p>
          <button className="button-delete" onClick={() => deleteProject(d.id)}>Delete</button>
        </div>
      ))}
      <AddProjectForm onAdd={addProject} />
    </div>
  )
}

export default App