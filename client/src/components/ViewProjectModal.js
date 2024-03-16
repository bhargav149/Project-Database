import React from 'react';
import './ViewProjectModal.css';
import { X } from 'lucide-react';

function ViewProjectModal({ project, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">{project.title}</h2>
          <X className="modal-close-btn" onClick={onClose}></X>
        </div>
        <hr></hr>
        <p><strong>Description:</strong> {project.contents}</p>
        <p><strong>Technology Stack:</strong> {project.stack}</p>
        <p><strong>Team Name:</strong> {project.team_name}</p>
        <p><strong>Team Members:</strong> {project.team_members}</p>
        <p><strong>Status:</strong> {project.status}</p>
      </div>
    </div>
  );
}

export default ViewProjectModal;
