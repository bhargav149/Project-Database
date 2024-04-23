import React, { useState, useEffect } from 'react';
import './Settings.css';
import UsersTable from './UsersTable';
import DataTable from './DataTable';
import { createTheme, Button } from '@mui/material/styles';
import { FormControl, InputLabel, NativeSelect } from '@mui/material';
import EditProjectModal from './EditProjectModal';
import { FilePenLine, Info } from 'lucide-react';
import { Tooltip } from '@mui/material';
import {Download, Trash2 } from 'lucide-react';
import axios from 'axios';

function SettingsPage({ themeMode, data, isAdmin, isRootProject, pid }) {
    const [userName, setUserName] = useState('');
    const [projectID, setProjectID] = useState('');
    const [projectInfo, setProjectInfo] = useState({});
    const [activeTab, setActiveTab] = useState('Profile');
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);


    //USE FIRST URL FOR LOCAL DEVELOPMENT AND SECOND FOR DEPLOYMENT
    const url = "http://localhost:8080/";
    // const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"
    const [semester, setSemester] = useState(null);

    const fetchFiles = () => {
        fetch(url+"files/"+projectID)
          .then(res => res.json())
          .then(data => setUploadedFiles(data.map(project => ({ ...project}))))
          .catch(err => console.error(err));
        console.log()
      };

      useEffect(() => {
        fetchFiles();
      }, [fetchFiles, uploadedFiles]);

      useEffect(() => {
        fetch(url+"name/"+pid)
            .then(response=>response.json())
            .then(data => {
                setUserName(data.name)
            })
      })
    useEffect(() => {
        console.log("Fetching user data...");

        fetch(url + "user/"+pid) // Assuming '1' is the user ID for the sake of example
            .then(response => response.json())
            .then(data => {
                console.log("User data:", data);
                setProjectID(data.project_id);
                console.log("Fetching project data for project ID:", data.project_id);
                // Assuming you have an endpoint that matches this pattern to fetch project details
                // Adjust the endpoint as necessary for your API
                return fetch(url + "projects/" + data.project_id);
            })
            .then(response => response.json())
            .then(projectData => {
                console.log("Project data:", projectData);
                // Assuming projectData is an array and we need the first item
                if (projectData.length > 0) {
                    const { created, ...projectInfoWithoutCreated } = projectData[0]; // Destructure the object and exclude the "created" field
                    setProjectInfo(projectInfoWithoutCreated); // Adjust according to actual data structure
    
                    console.log("Fetching semester data for project ID:", projectInfoWithoutCreated.id);
                    return fetch(url + "semester/" + projectInfoWithoutCreated.id);
                } else {
                    console.log("Project data is empty or not structured as expected.");
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log("Semester data:", data);
                setSemester(data.semester);
            })
            .catch(error => console.error('There was an error:', error));
    
        fetch(url + "users")
            .then(response => response.json())
            .then(data => {
                setUsers(data); // Store users data in state
            })
            .catch(error => console.error('Error fetching users:', error));
    
        fetch(url + "projects")
            .then(response => response.json())
            .then(data => {
                console.log("All projects:", data);
                // Filter for unassigned projects based on your criteria
                const unassignedProjects = data.filter(project => project.status === "Unassigned");
                setProjects(unassignedProjects);
                console.log("Unassigned projects:", unassignedProjects);
            })
            .catch(error => console.error('Error fetching projects:', error));
    }, [projectID, url]);
    
    const handleChange = (event) => {
        setSelectedProject(event.target.value);
    };
    
    const handleJoinTeam = async () => {
        if (projectID != '-1') { // Assuming '-1' indicates not part of a team, adjust as needed
            alert('You are already part of a team. You must leave the team before joining another team.');
            return; // Exit the function to prevent further execution
        }

        if (selectedProject === '') { // Check if the default option is selected
            alert('Please select a project to join.');
            return;
        }

        try {
            const updatedData = { pid: pid, project_id: selectedProject };
            const requestUrl = `${url}user/${pid}`;
            console.log("Updated data:", updatedData);
            console.log("Request URL:", requestUrl);
    
            const response = await fetch(requestUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
    
            console.log("Update response:", response);
            
            // Fetch updated user data
            const userDataResponse = await fetch(url + "users/1");
            const userData = await userDataResponse.json();
            setUserName(userData.name);
            setProjectID(userData.project_id);
    
            // Fetch updated project details
            const projectDataResponse = await fetch(url + "projects/" + selectedProject);
            const projectData = await projectDataResponse.json();
            setProjectInfo(projectData);
    
        } catch (error) {
            console.error('Error in handleJoinTeam:', error);
        }
    };
    

    const handleLeaveTeam = () => {
        // Confirmation dialog
        const isConfirmed = window.confirm('Are you sure you want to leave the team? You are only able to join currently open projects.');
    
        // Proceed only if the user confirms
        if (isConfirmed) {
            const updatedData = { project_id: -1 };
            // Use `pid` instead of `id` for the user identifier in the URL
            const requestUrl = `${url}user/${pid}`; // Ensure `url` and `pid` are correctly defined
    
            fetch(requestUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            })
            .then(response => {
                // if (!response.ok) {
                //     throw new Error('Network response was not ok');
                // }
                // return response.text();
            })
            .then(() => {
                setProjectID(-1);
                setProjectInfo({});
            })
            // .catch(error => {
            //     console.error('Error leaving team:', error);
            //     alert('Error switching project. Please try again.');
            // });
        }
    };

    useEffect(() => {
        console.log("Updated project info:", projectInfo);
    }, [projectInfo]);

    // const handleSaveProfile = () => {
    //     // Example PUT request to update user data
    //     const updatedData = { name: userName, team_id: projectID };
    //     fetch(url + "users/" + id, {
    //         method: 'PUT',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(updatedData),
    //     })
    //     .then(response => response.json())
    //     .then(data => console.log('Success:', data))
    //     .catch(error => console.error('Error updating profile:', error));
    // };
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
    const saveEdit = async (updatedProject) => {
        // console.log(`Saving project with updated status: `, updatedProject);
        try {
            const updatedProjectInfo = {
                ...updatedProject, // Spread existing projectInfo object
                semesters: semester // Add semesters field with its value
              };
          const response = await fetch(url + `projects/${updatedProject.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProjectInfo),
          });
          if (!response.ok) {
            throw new Error("Failed to update project");
          }
          setIsEditModalOpen(false)
          setProjectInfo(updatedProject)
        } catch (error) {
          console.error(error);
        }
      };
    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'Profile':
                return (
                    <>
                    <div className="top-section">
                        {/* User Profile & Search Projects */}
                        <div className="leftSection">
                            <div className={`${themeMode==='dark' ? 'profile-settings' : 'profile-settings-light'}`}>
                                <div className="title-container">
                                    <h2>Profile Information</h2>
                                    <hr />
                                </div>
                                <p><strong>Name: </strong> {userName}</p>
                                <p><strong>Project: </strong> {projectInfo.title}</p>
                                <p><strong>Team: </strong> {projectInfo.team_name}</p>
                            </div>
                        </div>
                        <div className="rightSection">
                        <div className={`${themeMode==='dark' ? 'search-projects' : 'search-projects-light'}`}>
                                <h2>Search Open Projects</h2>
                                <FormControl>
                                    <NativeSelect
                                        value={selectedProject}
                                        onChange={handleChange}
                                        inputProps={{
                                        name: 'project',
                                        id: 'project-select',
                                        }}
                                        sx={{ 
                                            color: themeMode==='dark' ?'#F6E8EA' : "black", // Text color
                                            '& .MuiNativeSelect-icon': { // Dropdown icon color
                                                color: themeMode==='dark' ?'#F6E8EA' : "black",
                                            },
                                            '&::before': { // Underline color when not focused
                                                borderColor: themeMode==='dark' ?'#F6E8EA' : "black",
                                            },
                                            '&::after': { // Underline color when focused
                                                borderColor: themeMode==='dark' ?'#F6E8EA' : "black",
                                            }
                                        }}
                                    >
                                        <option value="" disabled>Select a project to join</option>
                                        {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.title} - {project.team_name.length > 0 ? project.team_name : "No team assigned"}                                        </option>
                                        ))}
                                    </NativeSelect>
                                    </FormControl>
                                    <Tooltip title="Can't find what you are looking for? Try refreshing the page.">
                                        <span>
                                            <Info size={24} style={{color:themeMode==='dark' ? 'lightblue' : '#3371FF', marginTop: '4px', marginLeft: '4px'}}/>
                                        </span>
                                    </Tooltip>
                                    <button 
                                        onClick={handleJoinTeam} 
                                        className="join-team-button"
                                    >
                                        Join Team
                                    </button>
                            </div>
                        </div>
                    </div>
                    <div className={`${themeMode==='dark' ? 'bottom-section' : 'bottom-section-light'}`}>
                        {/* Project Overview */}
                        {projectID !== -1 ? (
                        <div className="project-overview">
                            <div className="title-container">
                                <h2>Project Overview</h2>
                                <hr></hr>
                            </div>
                            <p><strong>Name:</strong> {projectInfo.title}</p>
                            <p><strong>Description:</strong> {projectInfo.contents}</p>
                            <p><strong>Stack:</strong> {projectInfo.stack}</p>
                            <p><strong>Semester:</strong></p>
                            {!isRootProject ? <p><strong>Summary:</strong> {projectInfo.summary}</p> : <></>}
                            <p><strong>Team:</strong> {projectInfo.team_name}</p>
                            <p><strong>Members:</strong> {projectInfo.team_members}</p>
                            <p><strong>Status:</strong> {projectInfo.status}</p>
                            <p><strong>Repository Link:</strong> <a href={`${projectInfo.repository}`} target="_blank" rel="noopener noreferrer" style={{ color: '#64b5f6' }}>{projectInfo.repository}</a></p>
                            <p><strong>Production URL:</strong> <a href={`${projectInfo.production_url}`} target="_blank" rel="noopener noreferrer" style={{ color: '#64b5f6' }}>{projectInfo.production_url}</a></p>
                            <p><strong>Files:</strong></p>
                            <div className="file-list">
                            {uploadedFiles.map((file, index) => (
                                <div key={index} className="file-item">
                                <div className='file-name'>{file.filename}</div>
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
                            {projectID !== -1 && (
                                    <div style={{marginTop: '20px'}}>
                                    <span 
                                        className="edit-project-button" 
                                        onClick={() => {
                                            setEditingProject(projectInfo);
                                            setIsEditModalOpen(true);
                                        }}
                                    >
                                        <FilePenLine />
                                    </span>
                                    <button 
                                        onClick={handleLeaveTeam} 
                                        className="leave-team-button"
                                    >
                                    Leave Team
                                    </button>
                                </div>
                            )}
                        </div>
                        ) : (
                            <div className="project-overview">
                                <h2>You are not part of a team</h2>
                                <p>Join a team to see project information</p>
                            </div>
                        )}
                    </div>
                    {isEditModalOpen && (
                        <EditProjectModal
                            project={projectInfo} // Assuming projectInfo holds the current project's data
                            isOpen={isEditModalOpen}
                            onSave={saveEdit}
                            onCancel={() => setIsEditModalOpen(false)}
                            relatedProjects={[]} // Pass related projects if applicable
                            isAdmin={true} // Adjust based on your logic to determine if the user is an admin
                            projectId={projectID} // The current project ID
                            pid={pid} // User's PID
                            notes={[]} // Pass notes if applicable
                            theme={themeMode}
                        />
                        )}
                    </>
                );
            case 'Users':
                return (
                    <>
                        <UsersTable themeMode="light" />
                    </>
                );
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className={`settings-container ${themeMode}`}>
            <div className="sidebar">
                <div className={`navLink ${activeTab === 'Profile' ? 'active' : ''}`} onClick={() => setActiveTab('Profile')}>Settings</div>
                {isAdmin ? (<div className={`navLink ${activeTab === 'Users' ? 'active' : ''}`} onClick={() => setActiveTab('Users')}>Users</div>) : (<></>)}
            </div>
            <div className="mainContent">
                {renderContent()} {/* Render content based on the active tab */}
            </div>
        </div>
    );
}

export default SettingsPage;
