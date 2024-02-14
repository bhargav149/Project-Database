import React, { useState, useEffect } from 'react';
import './EditProjectModal.css';

function EditProjectModal({ project, isOpen, onSave, onCancel }) {
  const [editedProject, setEditedProject] = useState({
    title: '',
    contents: '',
    stack: '',
    team_name: '',
    team_members: '',
    status: '',
  });

  useEffect(() => {
    if (project && isOpen) {
      setEditedProject({
        id: project.id,
        title: project.title || '',
        contents: project.contents || '',
        stack: project.stack || '',
        team_name: project.team_name || '',
        team_members: project.team_members || '',
        status: project.status || '',
      });
    }
  }, [project, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({ ...prev, [name]: value }));
    // console.log(`Updating status to: ${value}`);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2 className="modal-title"> Modify Project Contents</h2>
        <label htmlFor="title" className="modal-label">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          className="modal-input"
          value={editedProject.title}
          onChange={handleChange}
        />

        <label htmlFor="contents" className="modal-label">Description</label>
        <textarea
          id="contents"
          name="contents"
          className="modal-textarea"
          value={editedProject.contents}
          onChange={handleChange}
        />

        <label htmlFor="stack" className="modal-label">Technology Stack</label>
        <input
          id="stack"
          type="text"
          name="stack"
          className="modal-input"
          value={editedProject.stack}
          onChange={handleChange}
        />

        <label htmlFor="team_name" className="modal-label">Team Name</label>
        <input
          id="team_name"
          type="text"
          name="team_name"
          className="modal-input"
          value={editedProject.team_name}
          onChange={handleChange}
        />

        <label htmlFor="team_members" className="modal-label">Team Members</label>
        <textarea
          id="team_members"
          name="team_members"
          className="modal-textarea"
          value={editedProject.team_members}
          onChange={handleChange}
        />
        <label htmlFor="status" className="modal-label">Status</label>
          <select
            id="status"
            name="status"
            className="modal-input"
            value={editedProject.status || 'Unassigned'}
            onChange={handleChange}
          >
            <option value="Completed">Completed</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Suspended">Suspended</option>
            <option value="Unassigned">Unassigned</option>
          </select>
        <div className="modal-actions">
          <button onClick={() => onSave(editedProject)}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default EditProjectModal;