import React, { useState, useEffect } from 'react';
import './Settings.css';
import UsersTable from './UsersTable';
import { createTheme, Button } from '@mui/material/styles';
import { FormControl, InputLabel, NativeSelect } from '@mui/material';

function SettingsPage({ themeMode }) {
    const [userName, setUserName] = useState('');
    const [projectID, setProjectID] = useState('');
    const [projectInfo, setProjectInfo] = useState({});
    const [activeTab, setActiveTab] = useState('Profile');
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');

    // Hardcoded PID for the current user
    const pid = "k3h0j8";
    const id = "1";
    //USE FIRST URL FOR LOCAL DEVELOPMENT AND SECOND FOR DEPLOYMENT
    const url = "http://localhost:8080/";
    // const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"

    useEffect(() => {
        console.log("Fetching user data...");
        fetch(url + "users/1") // Assuming '1' is the user ID for the sake of example
            .then(response => response.json())
            .then(data => {
                console.log("User data:", data);
                setUserName(data.name);
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
                    setProjectInfo(projectData[0]); // Adjust according to actual data structure
                } else {
                    console.log("Project data is empty or not structured as expected.");
                }
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
    }, [url]);

    const handleChange = (event) => {
        setSelectedProject(event.target.value);
    };
    
    const handleJoinTeam = () => {
        const updatedData = { pid: pid, project_id: selectedProject };
        const requestUrl = `${url}user/${pid}`;
        console.log("updated data: ", updatedData);
        console.log("request url: ", requestUrl);

        fetch(requestUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        })
        .then(response => {
            console.log("stringfy json body: ", JSON.stringify(updatedData));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            // Handle successful join here
            // Update UI with new project information
            fetch(url + "users/1") // Fetch updated user data
                .then(response => response.json())
                .then(userData => {
                    console.log("Updated user data:", userData);
                    setUserName(userData.name);
                    setProjectID(userData.project_id);
                })
                .catch(error => console.error('Error fetching updated user data:', error));
            
            fetch(url + "projects/" + selectedProject) // Fetch updated project details
                .then(response => response.json())
                .then(projectData => {
                    console.log("Updated project data:", projectData);
                    setProjectInfo(projectData); // Update project info state
                })
                .catch(error => console.error('Error fetching updated project data:', error));
        })
        .catch(error => {
            console.error('Error joining team:', error);
        });
    };

    const handleLeaveTeam = () => {
        // Confirmation dialog
        const isConfirmed = window.confirm('Are you sure you want to leave the team? This action cannot be undone.');
    
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
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(() => {
                setProjectID(-1);
                setProjectInfo({});
            })
            .catch(error => {
                console.error('Error leaving team:', error);
                alert('Error switching project. Please try again.');
            });
        }
    };

    useEffect(() => {
        console.log("Updated project info:", projectInfo);
    }, [projectInfo]);

    const handleSaveProfile = () => {
        // Example PUT request to update user data
        const updatedData = { name: userName, team_id: projectID };
        fetch(url + "users/" + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch(error => console.error('Error updating profile:', error));
    };
    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'Profile':
                return (
                    <>
                        <div className="profile-section" style={{ backgroundColor: 'transparent', color: 'black'}}>
                        {/* Personal Information Section */}
                        <div className="personal-info">
                            <h2>Profile Information</h2>
                            <p>Name: {userName}</p>
                            <p>Project: {projectInfo.title}</p>
                            <p>Team: {projectInfo.team_name}</p>

                            <h2>Search Open Projects</h2>
                            <div className="search-projects">
                            <FormControl>
                                <NativeSelect
                                    value={selectedProject}
                                    onChange={handleChange}
                                    inputProps={{
                                    name: 'project',
                                    id: 'project-select',
                                    }}
                                >
                                    {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.title}
                                    </option>
                                    ))}
                                </NativeSelect>
                                </FormControl>

                                <button 
                                    onClick={handleJoinTeam} 
                                    style={{marginLeft: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
                                >
                                    Join Team
                                </button>
                            </div>
                        </div>
                        {/* Project Information Section */}
                        <div className="project-info">
                        {projectID !== -1 ? (
                        <div className="project-info">
                            <h2>Project Overview</h2>
                            <p>Name: {projectInfo.title}</p>
                            <p>Description: {projectInfo.contents}</p>
                            <p>Stack: {projectInfo.stack}</p>
                            <p>Semester:</p>
                            <p>Summary:</p>
                            <p>Team: {projectInfo.team_name}</p>
                            <p>Members: {projectInfo.team_members}</p>
                            <p>Status: {projectInfo.status}</p>
                            <p>Links:</p>
                            <p>Files:</p>

                            {projectID !== -1 && (
                                    <div style={{marginTop: '20px'}}>
                                        <button 
                                            onClick={handleLeaveTeam} 
                                            style={{padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
                                        >
                                        Leave Team
                                        </button>
                                    </div>
                            )}
                        </div>
                        ) : (
                            <div className="project-info">
                                <h2>You are not part of a team</h2>
                                <p>Join a team to see project information</p>
                            </div>
                        )}
                        </div>
                    </div>
                    </>
                );
            case 'Teams':
                return (
                    <>
                        <div style={{ marginLeft: '20px' }}>
                            <h2>Manage Teams</h2>
                            <div>Team ID: {projectID}</div>
                        </div>
                    </>
                );
            // case 'Users':
            //     return renderUsersTable();
            case 'Users':
                return (
                    <>
                        <h2 style={{ marginLeft: '20px' }} >Manage Users</h2>
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
                <div className={`navLink ${activeTab === 'Profile' ? 'active' : ''}`} onClick={() => setActiveTab('Profile')}>Profile</div>
                <div className={`navLink ${activeTab === 'Teams' ? 'active' : ''}`} onClick={() => setActiveTab('Teams')}>Teams</div>
                <div className={`navLink ${activeTab === 'Users' ? 'active' : ''}`} onClick={() => setActiveTab('Users')}>Users</div>
            </div>
            <div className="mainContent">
                {renderContent()} {/* Render content based on the active tab */}
            </div>
        </div>
    );
}

export default SettingsPage;
