import React, { useState, useEffect } from 'react';
import './Settings.css';
import UsersTable from './UsersTable';
import { createTheme } from '@mui/material/styles';

function SettingsPage({ themeMode }) {
    const [userName, setUserName] = useState('');
    const [teamId, setTeamId] = useState('');
    const [activeTab, setActiveTab] = useState('Profile');
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    
    // Hardcoded PID for the current user
    const pid = "k3h0j8";
    const id = "1";
    //USE FIRST URL FOR LOCAL DEVELOPMENT AND SECOND FOR DEPLOYMENT
    const url = "http://localhost:8080/";
    // const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"

    useEffect(() => {
        fetch(url+"users/"+id)
        .then(response => response.json())
        .then(data => {
        setUserName(data.name);
        setTeamId(data.team_id);
        })
        .catch(error => console.error('There was an error fetching the user data:', error));

        fetch(url + "users")
            .then(response => response.json())
            .then(data => {
                setUsers(data); // Store users data in state
            })
            .catch(error => console.error('Error fetching users:', error));
    }, [url, id]);
    
    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'Profile':
                return (
                    <>
                        <h2>Profile Information</h2>
                        <div>Name: {userName}</div>
                    </>
                );
            case 'Teams':
                return (
                    <>
                        <h2>Manage Teams</h2>
                        <div>Team ID: {teamId}</div>
                    </>
                );
            // case 'Users':
            //     return renderUsersTable();
            case 'Users':
                return (
                    <>
                        <h2>Manage Users</h2>
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
