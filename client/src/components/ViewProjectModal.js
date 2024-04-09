import React, { useState, useEffect } from 'react';
import './ViewProjectModal.css';
import { X, Mail } from 'lucide-react';

function ViewProjectModal({ project, isOpen, onClose, theme, relatedProjects, notes, pid }) {
  const [selectedProject, setSelectedProject] = useState(project);
  const [userProject, setUserProject] = React.useState(null);
  const [userRootProject, setUserRootProject] = useState(-1);
  

  useEffect(() => {
    setSelectedProject(project); // Reset selected project when the main project changes
  }, [project]);

  useEffect(() => {
    getUserProject();
  });

  if (!isOpen) return null;
  console.log('Notes prop:', notes);
  const themeClass = theme === 'dark' ? 'dark-theme' : 'light-theme';
  const semesterTabs = relatedProjects.map(proj => proj.semesters);

  const url = "http://localhost:8080/";
  // const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"


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

  const getUserProject =() => {
    fetch(url+"user/"+pid)
    .then(res => res.json())
    .then(data => {
      // console.log("Fetched user project: ", data, data.project_id)
      setUserProject(data.project_id);
      // console.log("Current user's project: ", userProject)
      getUserRootProject()
    })
    .catch(error => {
      // console.error("Error fetching user project:", error);
    });
  }

  const getUserRootProject =() => {
    fetch(url+"projects/"+userProject)
    .then(res => res.json())
    .then(data => {
      // console.log("Fetched project row: ", data)
      if (data && data.length > 0) {
        const rootId = data[0].continuation_of_project_id;
        if(rootId===-1){
          setUserRootProject(userProject);
        }
        else{
          setUserRootProject(rootId)
        }
      }
      else {
        // console.log("No project data found");
      }
      // console.log("Current user's root project: ", userRootProject)
    })
    .catch(error => {
      console.error("Error fetching user root project:", error);
    });
  }

  const switchUserProject = (project_id) => {
    fetch(url+"user/"+pid, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: project_id,
      }),
    })
    .catch(err => console.error(err));
  }


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
        <div className="modal-actions">
        {selectedProject.status==="Unassigned" && selectedProject.id !== userProject? (<button onClick={(event) => {
          // event.stopPropagation();
          switchUserProject(selectedProject.id)
          onClose()
        }}>Join Team</button>) : <></>}
        <a href={`mailto:${selectedProject.team_members}?subject=Project%20${encodeURIComponent(project.title)}%20Discussion`} className="email-icon-container">
          <Mail size={24} style={{ cursor: 'pointer' }} />
        </a>
        </div>

      </div>
    </div>
  );
}

export default ViewProjectModal;
