import React, { useEffect, useState } from 'react'
import './App.css';
import AddProjectForm from './components/AddProjectForm';
import EditProjectModal from './components/EditProjectModal';

function App() {

  const [data, setData] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    fetch("http://localhost:8080/projects")
      .then(res => res.json())
      .then(data => setData(data.map(project => ({ ...project, isEditing: false }))))
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

  const updateProject = (id, updatedProject) => {
    fetch(`http://localhost:8080/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProject),
    })
    .then(response => response.json())
    .then(() => fetchProjects())
    .catch(err => console.error(err));
  };

  const toggleEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const saveEdit = (updatedProject) => {
    updateProject(updatedProject.id, updatedProject);
    setIsModalOpen(false);
  };

  const cancelEdit = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container">
      {data.map((project, i) => (
        <div key={i} className="card">
          <p><strong>Title:</strong> {project.title}</p>
          <p><strong>Description:</strong> {project.contents}</p>
          <p><strong>Stack:</strong> {project.stack}</p>
          <p><strong>Team Name:</strong> {project.team_name}</p>
          <p><strong>Team Members:</strong> {project.team_members}</p>
          <p><strong>Created:</strong> {project.created}</p>
          <button className="button-delete" onClick={() => deleteProject(project.id)}>Delete</button>
          <button className="button-edit" onClick={() => toggleEdit(project)}>Edit</button>
        </div>
      ))}
  
      {isModalOpen && editingProject && (
        <EditProjectModal
          project={editingProject}
          isOpen={isModalOpen}
          onSave={saveEdit}
          onCancel={cancelEdit}
        />
      )}
  
      <AddProjectForm onAdd={addProject} />
    </div>
  );
}

export default App