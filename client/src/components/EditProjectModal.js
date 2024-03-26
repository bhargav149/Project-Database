import React, { useState, useEffect } from 'react';
import './EditProjectModal.css';
import { X } from 'lucide-react';

function EditProjectModal({ project, isOpen, onSave, onCancel, relatedProjects }) {
  const [editedProject, setEditedProject] = useState({
    title: '',
    contents: '',
    stack: '',
    team_name: '',
    team_members: '',
    status: '',
  });

  const [currentProject, setCurrentProject] = useState(project);
  const [selectedProject, setSelectedProject] = useState(project);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);
  
  useEffect(() => {
    setSelectedProject(project);
  }, [project]);

  const selectProject = (selectedProject) => {
    setCurrentProject(selectedProject);
  };

  
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

  const handleStatusChange = (newStatus) => {
    setEditedProject(prev => ({ ...prev, status: newStatus }));
  };

  const statuses = ['Completed', 'In-Progress', 'Suspended', 'Unassigned'];

  // Function to split semester strings and return an object { term, year }
  const parseSemester = (semester) => {
    const [term, year] = semester.split(' ');
    return { term, year: parseInt(year, 10) };
  };

  // Define the order of the terms
  const termOrder = ['Spring', 'Fall'];

  // Compare function for semesters
  const compareSemesters = (a, b) => {
    const semesterA = parseSemester(a.semesters);
    const semesterB = parseSemester(b.semesters);
    const yearComparison = semesterA.year - semesterB.year;
    if (yearComparison !== 0) return yearComparison;
    return termOrder.indexOf(semesterA.term) - termOrder.indexOf(semesterB.term);
  };

  // Sorted related projects
  const sortedRelatedProjects = relatedProjects.sort(compareSemesters);

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">Quick Edit</h2>
          <X className="modal-close-btn" onClick={onCancel}>Cancel</X>
        </div>
        <hr></hr>
        <div className="project-selection-tabs">
          {sortedRelatedProjects.map((proj, index) => (
            <button
              key={index}
              onClick={() => setSelectedProject(proj)}
              className={selectedProject.id === proj.id ? 'active' : ''}
            >
              {proj.semesters}
            </button>
          ))}
        </div>
        <label htmlFor="title" className="modal-label">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          className="modal-input"
          value={selectedProject.title}
          onChange={handleChange}
        />

        <label htmlFor="contents" className="modal-label">Description</label>
        <textarea
          id="contents"
          name="contents"
          className="modal-textarea"
          value={selectedProject.contents}
          onChange={handleChange}
        />

        <label htmlFor="stack" className="modal-label">Technology Stack</label>
        <input
          id="stack"
          type="text"
          name="stack"
          className="modal-input"
          value={selectedProject.stack}
          onChange={handleChange}
        />

        <label htmlFor="team_name" className="modal-label">Team Name</label>
        <input
          id="team_name"
          type="text"
          name="team_name"
          className="modal-input"
          value={selectedProject.team_name}
          onChange={handleChange}
        />

        <label htmlFor="team_members" className="modal-label">Team Members</label>
        <textarea
          id="team_members"
          name="team_members"
          className="modal-textarea"
          value={selectedProject.team_members}
          onChange={handleChange}
        />
        <label htmlFor="status" className="modal-label">Status</label>
        <div className="modal-status-buttons">
          {statuses.map((status) => (
            <button
              key={status}
              className={`status-button-edit ${status.toLowerCase().replace(/\s+/g, '-')}${selectedProject.status === status ? ' selected' : ''}`}
              onClick={() => handleStatusChange(status)}
            >
              {status}
            </button>
          ))}
        </div>
          {/* <select
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
          </select> */}
        <div className="modal-actions">
          <button onClick={() => onSave(selectedProject)}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default EditProjectModal;