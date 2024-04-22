import React, { useState, useEffect } from 'react';
import './ViewProjectModal.css';
import { X, Mail } from 'lucide-react';
import Toast from './Toast';

function ViewProjectModal({ project, isOpen, onClose, theme, relatedProjects, notes, pid, isAdmin }) {
  const [selectedProject, setSelectedProject] = useState(project);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastFadeOut, setToastFadeOut] = useState(false);
  const [userProject, setUserProject] = React.useState(null);
  const [userRootProject, setUserRootProject] = useState(-1);
  const [name, setName] = useState('')
  const [error,setError] = useState(false)
  const [emails,setEmails] = useState(null)

  const url = "http://localhost:8080/";
  // const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"

  
  const getEmails = (projectId) => {
    fetch(url+"emails/"+projectId)
    .then(res=>res.json())
    .then(data => {
      console.log("data", data)
      setEmails(data.map(({ pid }) => pid+"@vt.edu"));
      console.log("Emails",emails)
    })
    .catch(err => console.error(err));
  }

  useEffect(() => {
    setSelectedProject(project); // Reset selected project when the main project changes
  }, [project]);

  useEffect(() => {
    getUserProject();
    getName();
    console.log("Name: ",name, name!=='')
  });


  if(emails===null) {
    getEmails(project.id)
  }

  const changeProject =(proj) => {
    setSelectedProject(proj)
    getEmails(proj.id)
  }

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

  const getName =() => {
    fetch(url+"name/"+pid)
    .then(res => res.json())
    .then(data => {
      setName(data.name);
    })
    .catch(error => {
      console.error("Error fetching user name:", error);
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
    if(name==='' || name==='None') {
      console.log("Name not set")
      showToastWithFadeOut("Error: please set name to join project")
      return
    }
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
    showToastWithFadeOut("Project joined")
  }

  const showToastWithFadeOut = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setToastFadeOut(false); // Reset fade-out animation
  
    setTimeout(() => {
      setToastFadeOut(true); // Start fade-out animation
      setTimeout(() => {
        setShowToast(false);
        setToastFadeOut(false); // Ensure the fade-out state is reset for the next toast
      }, 700); // This duration should match the CSS animation duration for fading out
    }, 10000); // Time the toast is visible before starting to fade out
  };


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
              onClick={() => {
                changeProject(proj)
              }}
            >
              {proj.semesters}
            </button>
          ))}
        </div>
        <div>
          <strong>Note: </strong>
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note, index) => (
              <span key={index}>
                {note.note}{index < filteredNotes.length - 1 ? ', ' : ''}
              </span>
            ))
          ) : (
            <span>No notes for this project.</span>
          )}
        </div>
        <p><strong>Description:</strong> {selectedProject.contents}</p>
        <p><strong>Stack:</strong> {selectedProject.stack}</p>
        <p><strong>Team:</strong> {selectedProject.team_name}</p>
        <p><strong>Members:</strong> {selectedProject.team_members}</p>
        {relatedProjects.length>1 ? (<p><strong>Semester Summary:</strong> {selectedProject.summary}</p>) : (<></>)}
        <p><strong>Repository Link:</strong> <a href={`${selectedProject.repository}`} target="_blank" rel="noopener noreferrer" style={{ color: '#64b5f6' }}>{selectedProject.repository}</a></p>
        <p><strong>Production URL:</strong> <a href={`${selectedProject.production_url}`} target="_blank" rel="noopener noreferrer" style={{ color: '#64b5f6' }}>{selectedProject.production_url}</a></p>
        <p><strong>Status:</strong> {selectedProject.status}</p>
        <div className="modal-actions">
        {selectedProject.status==="Unassigned" && selectedProject.id !== userProject ? (<button onClick={(event) => {
          // event.stopPropagation();
          switchUserProject(selectedProject.id)
          if(name!=='' && name!=='None'){
            onClose()
          }
        }}>Join Team</button>) : <></>}
        {isAdmin ? (<> <a href={`mailto:${emails}?subject=Project%20${encodeURIComponent(project.title)}%20Discussion`} className="email-icon-container">
          <Mail size={24} style={{ cursor: 'pointer' }} />
        </a></>) : (<></>)}

        </div>

      </div>
      <Toast show={showToast} message={toastMessage} fadeOut={toastFadeOut} error={true}/>
    </div>
  );
}

export default ViewProjectModal;
