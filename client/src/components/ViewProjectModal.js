import React, { useState, useEffect } from 'react';
import './ViewProjectModal.css';
import { X } from 'lucide-react';

function ViewProjectModal({ project, isOpen, onClose, theme, relatedProjects, notes }) {
  const [selectedProject, setSelectedProject] = useState(project);

  useEffect(() => {
    setSelectedProject(project); // Reset selected project when the main project changes
  }, [project]);

  if (!isOpen) return null;
  console.log('Notes prop:', notes);
  const themeClass = theme === 'dark' ? 'dark-theme' : 'light-theme';
  const semesterTabs = relatedProjects.map(proj => proj.semesters);

  const getAllSemesters = () => {
    const semesterSet = new Set();
    relatedProjects.forEach(proj => {
      // Ensure semesters is treated as an array
      const semesters = Array.isArray(proj.semesters) ? proj.semesters : [proj.semesters];
      semesters.forEach(semester => {
        semesterSet.add(semester);
      });
    });
    // Convert to array and sort, if sorting is needed
    return Array.from(semesterSet).sort(); // Implement actual sorting logic if needed
  };

  const filteredNotes = notes.filter(note => note.projectId === selectedProject.id);


  return (
    <div className={`modal-overlay ${themeClass}`}>
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">{project.title}</h2>
          <X className="modal-close-btn" onClick={onClose}></X>
        </div>
        <hr></hr>
        <div className="project-selection-tabs">
          {relatedProjects.map((proj, index) => (
            <button
              key={index}
              className={`semester-tab ${selectedProject.id === proj.id ? 'active' : ''}`}
              onClick={() => setSelectedProject(proj)}
            >
              {proj.semesters}
            </button>
          ))}
        </div>
        <div>
          <strong>Note:</strong>
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note, index) => (
              <p key={index}>{note.note}</p>
            ))
          ) : (
            <p>No notes for this project.</p>
          )}
        </div>
        <p><strong>Description:</strong> {selectedProject.contents}</p>
        <p><strong>Stack:</strong> {selectedProject.stack}</p>
        <p><strong>Team:</strong> {selectedProject.team_name}</p>
        <p><strong>Members:</strong> {selectedProject.team_members}</p>
        <p><strong>Status:</strong> {selectedProject.status}</p>
      </div>
    </div>
  );
}

export default ViewProjectModal;
