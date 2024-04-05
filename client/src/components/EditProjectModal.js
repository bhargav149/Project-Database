import React, { useState, useEffect } from 'react';
import './EditProjectModal.css';
import { X } from 'lucide-react';
import axios from 'axios';


function EditProjectModal({ project, isOpen, onSave, onCancel, relatedProjects, isAdmin, projectId, pid}) {
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

  // const url = "http://localhost:8080/";
  const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);
  
  useEffect(() => {
    setSelectedProject(project);
  }, [project]);

  const selectProject = (selectedProject) => {
    setCurrentProject(selectedProject);
  };

  const changeProject = (project) => {
    setSelectedProject(project)
    fetchFiles()
  }

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
    setSelectedProject(prev => ({
      ...prev,
      [name]: value
    }));
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

  const [fileType, setFileType] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, [uploadedFiles]);

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

  const fetchFiles = () => {
    fetch(url+"files/"+selectedProject.id)
      .then(res => res.json())
      .then(data => setUploadedFiles(data.map(project => ({ ...project}))))
      .catch(err => console.error(err));
  };
  const handleDelete = async (index) => {
    const filename = uploadedFiles[index].filename;
    try {
      // Send DELETE request to the Express backend endpoint
      await axios.delete(url+`files/${filename}`);
      console.log(`File ${filename} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting file ${filename}:`, error);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    const uniqueFilename = `${Date.now()}_${file.name}`; // Generate unique filename
    formData.append('file', file, uniqueFilename);
    try {
      const response = await axios.post(url+'upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('File uploaded successfully:', response.data);
      setUploadedFile(response.data.filename); // Assuming the server returns the filename
      setFileType(response.data.fileType); // Assuming the server returns the file type
      console.log("file type ",response.data.fileType);
      fetch(url+"files", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: selectedProject.id,
          filename: response.data.filename,
          filetype: response.data.fileType
        }),
      })
      .then(response => response.json())
      .then(() => {fetchFiles()})
      .catch(err => console.error(err));
      console.log(uploadedFiles)

    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="modal-overlay">
      {isAdmin || projectId===selectedProject.id ?

      (<div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">Quick Edit</h2>
          <X className="modal-close-btn" onClick={onCancel}>Cancel</X>
        </div>
        <hr></hr>
        <div className="project-selection-tabs">
          {sortedRelatedProjects.map((proj, index) => (
            <button
              key={index}
              onClick={() => changeProject(proj)}
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
      <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload File</button>
        <div>
          {uploadedFiles.map((file, index) => (
                <div key={index}>
                  {file.filetype.startsWith('image') ? (
                    <img src={url+`uploads/${file.filename}`} alt={`Uploaded File ${index + 1}`} style={{ maxWidth: '100%', maxHeight: '400px' }} />
                  ) : (
                    <div>
                      <a href={url+`uploads/${file.filename}`} download>{file.filename}</a>
                    </div>
                  )}
                  <button onClick={() => handleDelete(index)}><i className="fas fa-trash-alt"></i></button>
                </div>
              ))}
        </div>
    </div>
        <div className="modal-actions">
          <button onClick={() => onSave(selectedProject)}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>) :
          (<div className="modal-card">
          <div className="modal-header">
            <h2 className="modal-title">Quick Edit</h2>
            <X className="modal-close-btn" onClick={onCancel}>Cancel</X>
          </div>
          <hr></hr>
          <div className="project-selection-tabs">
            {sortedRelatedProjects.map((proj, index) => (
              <button
                key={index}
                onClick={() => changeProject(proj)}
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
            disabled={true}
          />
  
          <label htmlFor="contents" className="modal-label">Description</label>
          <textarea
            id="contents"
            name="contents"
            className="modal-textarea"
            value={selectedProject.contents}
            onChange={handleChange}
            disabled={true}
          />
  
          <label htmlFor="stack" className="modal-label">Technology Stack</label>
          <input
            id="stack"
            type="text"
            name="stack"
            className="modal-input"
            value={selectedProject.stack}
            onChange={handleChange}
            disabled={true}
          />
  
          <label htmlFor="team_name" className="modal-label">Team Name</label>
          <input
            id="team_name"
            type="text"
            name="team_name"
            className="modal-input"
            value={selectedProject.team_name}
            onChange={handleChange}
            disabled={true}
          />
  
          <label htmlFor="team_members" className="modal-label">Team Members</label>
          <textarea
            id="team_members"
            name="team_members"
            className="modal-textarea"
            value={selectedProject.team_members}
            onChange={handleChange}
            disabled={true}
          />
          <label htmlFor="status" className="modal-label">Status</label>
          <div className="modal-status-buttons">
            {statuses.map((status) => (
              <button
                key={status}
                disabled={true}
                className={`status-button-edit ${status.toLowerCase().replace(/\s+/g, '-')}${selectedProject.status === status ? ' selected' : ''}`}
                onClick={() => handleStatusChange(status)
                }
              >
                {status}
              </button>
            ))}
          </div>
        <div>
          <div>
            {uploadedFiles.map((file, index) => (
                  <div key={index}>
                    {file.filetype.startsWith('image') ? (
                      <img src={url+`uploads/${file.filename}`} alt={`Uploaded File ${index + 1}`} style={{ maxWidth: '100%', maxHeight: '400px' }} />
                    ) : (
                      <div>
                        <a href={url+`uploads/${file.filename}`} download>{file.filename}</a>
                      </div>
                    )}
                  </div>
                ))}
          </div>
      </div>
          <div className="modal-actions">
          <button onClick={(event) => {
                      event.stopPropagation();
                      switchUserProject(selectedProject.id)
                      onSave(selectedProject)
                    }}>Join Team</button>
            <button onClick={onCancel}>Cancel</button>
          </div>
        </div>)
    }
    </div>
  );
}

export default EditProjectModal;