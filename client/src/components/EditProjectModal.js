  import React, { useState, useEffect } from 'react';
  import './EditProjectModal.css';
  import { X, Download, Trash2 } from 'lucide-react';
  import axios from 'axios';


function EditProjectModal({ project, isOpen, onSave, onCancel, relatedProjects, isAdmin, projectId, pid, notes}) {
  const [editedProject, setEditedProject] = useState({
    title: '',
    contents: '',
    stack: '',
    team_name: '',
    team_members: '',
    status: '',
    summary: '',
    repository: '',
    trello: ''
  });

  
  const [currentProject, setCurrentProject] = useState(project);
  const [selectedProject, setSelectedProject] = useState(project);
  const [dragging, setDragging] = useState(false);
  const [editedNote, setEditedNote] = useState('');

  const url = "http://localhost:8080/";
  // const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"

    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
      setCurrentProject(project);
    }, [project]);
    
useEffect(() => {
  // Ensure this effect runs when selectedProject changes
  const projectNote = notes.find(n => n.projectId === selectedProject.id);
  setEditedNote(projectNote ? projectNote.note : '');
}, [selectedProject, notes]);




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
          summary: project.summary || '',
          repository: project.repository || '',
          trello: project.trello || '',

        });
      }
    }, [project, isOpen]);

  const handleStatusChange = (newStatus) => {
    setSelectedProject(prev => ({ ...prev, status: newStatus }));
  };

  const statuses = ['Completed', 'In-Progress', 'Suspended', 'Unassigned'];

  // Function to split semester strings and return an object { term, year }
  const parseSemester = (semester) => {
    if(semester==null){
      return {}
    }
    const [term, year] = semester.split(' ');
    return { term, year: parseInt(year, 10) };
  };

  // Define the order of the terms
  const termOrder = ['Spring', 'Fall'];

  // Compare function for semesters
  const compareSemesters = (a, b) => {
    const semesterA = parseSemester(a.semesters);
    if(b==null || b.semesters==null) {
      return -1
    }
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

  useEffect(() => {
    // Clean up the preview URL
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);



    
    const handleChange = (e) => {
      const { name, value } = e.target;
      setSelectedProject(prev => ({
        ...prev,
        [name]: value
      }));
    };

    // Prevent default behavior for drag events to allow for drop handling
    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Update dragging state on drag enter
    const handleDragIn = (e) => {
      handleDrag(e);
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setDragging(true);
      }
    };

    // Update dragging state on drag leave
    const handleDragOut = (e) => {
      handleDrag(e);
      setDragging(false);
    };

    // Handle file drop
    const handleDrop = (e) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        setFile(droppedFile);
        const url = URL.createObjectURL(droppedFile);
        setPreviewUrl(url); // Set the preview URL
        e.dataTransfer.clearData();
      }
    };

    useEffect(() => {
      fetchFiles();
    }, [uploadedFiles]);

    useEffect(() => {
      fetchFiles();
    }, [selectedProject]);


    const handleDelete = async (filename) => {
      try {
        const encodedFilename = encodeURIComponent(filename);
        console.log(`Encoded filename for deletion: ${encodedFilename}`); // Log the encoded filename
        console.log(`${url}files/${encodedFilename}`);
        const response = await axios.delete(`${url}files/${encodedFilename}`);
        console.log(`Response status after file deletion: ${response.status}`); // Log response status
        if (response.status === 204) {
          console.log(`File ${filename} deleted successfully.`);
          fetchFiles();
        }
      } catch (error) {
        console.error(`Error deleting file ${filename}:`, error);
      }
    };

    const handleFileChange = (event) => {
      const fileSelected = event.target.files[0];
      if (fileSelected) {
        setFile(fileSelected);
        const url = URL.createObjectURL(fileSelected);
        setPreviewUrl(url); // Set the preview URL
      }
    };

    const handleUpload = async (fileParam) => {
      const uploadFile = fileParam || file;
      console.log(uploadFile instanceof Blob);
      const formData = new FormData();
      const uniqueFilename = `${Date.now()}_${uploadFile.name}`; // Generate unique filename
      formData.append('file', uploadFile, uniqueFilename);
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

    const handleSave = async () => {
      if (file) { // Check if there's a file to upload
          await handleUpload(file); // Wait for the file to be uploaded
      }
      // After file upload, proceed with saving project data...
      onSave({ ...selectedProject });

      
    // Continue with any additional save logic, such as closing the modal or updating local state
    onSave();
  };

  const handleNoteChange = (e) => {
    setEditedNote(e.target.value);
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
      {sortedRelatedProjects.length===1 ? (
      <><label htmlFor="title" className="modal-label">Title</label><input
            id="title"
            type="text"
            name="title"
            className="modal-input"
            value={selectedProject.title}
            onChange={handleChange} /></> ): 
          (<><label htmlFor="title" className="modal-label">Title</label><input
          id="title"
          type="text"
          name="title"
          className="modal-input"
          value={selectedProject.title}
          onChange={handleChange} 
          disabled={true}/></>)
        }

<label htmlFor="note" className="modal-label">Note:</label>
            <textarea
                id="note"
                className="modal-textarea"
                value={editedNote}
                onChange={handleNoteChange}
            />
      {sortedRelatedProjects.length===1 ? (<>
      <label htmlFor="contents" className="modal-label">Description</label>
      <textarea
        id="contents"
        name="contents"
        className="modal-textarea"
        value={selectedProject.contents}
        onChange={handleChange}
      /></>) :
      (<>
        <label htmlFor="contents" className="modal-label">Description</label>
        <textarea
          id="contents"
          name="contents"
          className="modal-textarea"
          value={selectedProject.contents}
          onChange={handleChange}
          disabled={true}
        /></>)}
      {sortedRelatedProjects.length===1 ? (<>
      <label htmlFor="stack" className="modal-label">Technology Stack</label>
      <input
        id="stack"
        type="text"
        name="stack"
        className="modal-input"
        value={selectedProject.stack}
        onChange={handleChange}
      /></>) :
      (<>
        <label htmlFor="stack" className="modal-label">Technology Stack</label>
        <input
          id="stack"
          type="text"
          name="stack"
          className="modal-input"
          value={selectedProject.stack}
          onChange={handleChange}
          disabled={true}
        /></>)}

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
      {sortedRelatedProjects.length>1 ? (<>   
      <label htmlFor="summary" className="modal-label">Semester Summary</label>
      <textarea
        id="summary"
        name="summary"
        className="modal-textarea"
        value={selectedProject.summary}
        onChange={handleChange}
      /></>) : (<></>)}
      <label htmlFor="repository" className="modal-label">Repository Link</label>
      <input
        id="repository"
        name="repository"
        className="modal-input"
        value={selectedProject.repository}
        onChange={handleChange}
      />
      <label htmlFor="trello" className="modal-label">Trello Link</label>
      <input
        id="trello"
        name="trello"
        className="modal-input"
        value={selectedProject.trello}
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

    
    <div className="file-list">
      {uploadedFiles.map((file, index) => (
        <div key={index} className="file-item">
          <div className="file-name">{file.filename}</div>
          <div>
            <a
              href={`${url}uploads/${file.filename}`}
              download
              className="download-btn"
            >
              <Download />
            </a>
            <button
              onClick={() => handleDelete(file.filename)}
              className="file-delete"
              style={{ color: '#64b5f6', border: 'none', background: 'none' }}
            >
              <Trash2 />
            </button>
          </div>
        </div>
      ))}
    </div>
    <div
      className={`drop-zone ${dragging ? "dragging" : ""}`}
      onClick={() => fileInputRef.current.click()}
      onDragOver={handleDrag}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDrop={handleDrop}
    >
    <p>Drag and drop a file here or click to select a file</p>
      <input type="file" onChange={handleFileChange} ref={fileInputRef} style={{ display: "none" }} multiple/>
    </div>
    <div className="image-preview">
      {previewUrl && (
        <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px' }} />
      )}
    </div>
    {/* <button onClick={handleUpload}>Upload File</button> */}
      {/* <div>
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
      </div> */}
  </div>
      <div className="modal-actions">
        <button onClick={handleSave}>Save</button>
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
        disabled={true}
        value={selectedProject.title}
        onChange={handleChange}
      />

<label htmlFor="note" className="modal-label">Note:</label>
            <textarea
                id="note"
                className="modal-textarea"
                value={editedNote}
                onChange={handleNoteChange}
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
            {sortedRelatedProjects.length>1 ? (<>   
      <label htmlFor="summary" className="modal-label">Semester Summary</label>
      <textarea
        id="summary"
        name="summary"
        className="modal-textarea"
        value={selectedProject.summary}
        onChange={handleChange}
        disabled={true}
      /></>) : (<></>)}
            <label htmlFor="repository" className="modal-label">Repository Link</label>
      <input
        id="repository"
        name="repository"
        className="modal-input"
        value={selectedProject.repository}
        onChange={handleChange}
        disabled={true}
      />
      <label htmlFor="trello" className="modal-label">Trello Link</label>
      <input
        id="trello"
        name="trello"
        className="modal-input"
        value={selectedProject.trello}
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
            onClick={() => handleStatusChange(status)}
          >
            {status}
          </button>
        ))}
      </div>
    <div>
    
    <div className="file-list">
      {uploadedFiles.map((file, index) => (
        <div key={index} className="file-item">
          <div className="file-name">{file.filename}</div>
          <div>
            <a
              href={`${url}uploads/${file.filename}`}
              download
              className="download-btn"
            >
              <Download />
            </a>
          </div>
        </div>
      ))}
    </div>
    <div className="image-preview">
      {previewUrl && (
        <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px' }} />
      )}
    </div>
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
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>)}
  </div>
);
}

  export default EditProjectModal;