import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';

// Define columns based on user data structure
const columns = [
  { field: 'name', headerName: 'Name', width: 150 },
  { 
    field: 'pid', 
    headerName: 'Email', 
    width: 150,
    renderCell: (params) => (
      <a href={`mailto:${params.value}@vt.edu`} style={{ textDecoration: 'none' }}>
        {`${params.value}@vt.edu`}
      </a>
    ),
  },
  { 
    field: 'isAdmin', 
    headerName: 'Role', 
    width: 80,
    renderCell: (params) => (params.value ? 'Admin' : 'User'),
  },
  {
    field: 'teamName',
    headerName: 'Team',
    width: 160,
    renderCell: (params) => params.value || 'No Team', // Render the team name
  },
  { 
    field: 'project_id', 
    headerName: 'Project', 
    width: 200,
    renderCell: (params) => params.row.projectName || 'No Project', // Custom rendering to show project name
  },
];

// Assuming the URL is defined outside the component or passed in as a prop
const url = "http://localhost:8080/";

export default function UsersTable({ themeMode }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const fetchData = async () => {
    const responses = await Promise.all([
      fetch(url + "projects"),
      fetch(url + "admins"),
      fetch(url + "users"),
    ]);
    const [projectsData, adminsData, usersData] = await Promise.all(responses.map(res => res.json()));

    const projectIdToProjectDetails = projectsData.reduce((acc, project) => ({
      ...acc,
      [project.id]: {
        title: project.title,
        teamName: project.team_name,
      },
    }), {});

    const adminPIDs = new Set(adminsData.map(admin => admin.pid));

    const enrichedUsers = usersData.map(user => ({
      ...user,
      id: user.id,
      projectName: projectIdToProjectDetails[user.project_id]?.title || 'No Project',
      teamName: projectIdToProjectDetails[user.project_id]?.teamName || 'No Team',
      isAdmin: adminPIDs.has(user.pid),
    }));
    console.log('Enriched Users:', enrichedUsers);
    console.log(enrichedUsers.map(user => user.id));
    setUsers(enrichedUsers);
  };

  useEffect(() => {
    fetchData();
  }, [url]);
  
  useEffect(() => {
    console.log('Updated Users:', users);
    // Any other code that needs to run after `users` is updated can go here
  }, [users]);
  
  const handleDeleteUser = async () => {
    const affectedUsers = selected.map(id => users.find(user => user.id === id));
  
    // Check if any of the users being deleted is an admin
    const adminsBeingDeleted = affectedUsers.filter(user => user.isAdmin);

    // If deleting admins, check if at least one admin will remain
    if (adminsBeingDeleted.length > 0) {
      const remainingAdminsCount = users.filter(user => user.isAdmin).length - adminsBeingDeleted.length;
      if (remainingAdminsCount < 1) {
        alert("Operation not allowed. There must be at least one admin.");
        return;
      }
    }
  
    // Show confirmation dialog with affected users details
    const confirmMakeAdmin = window.confirm(
      `Are you sure you want to delete the selected user(s)? You cannot undo this action.\n\nAffected Users:\n${affectedUsers.map(user => `- ${user.name}`).join('\n')}`
    );

    if (confirmMakeAdmin) {
      // Perform the deletion of users
      for (const id of selected) {
        try {
          await fetch(`${url}users/${id}`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.error(`Error deleting user with ID ${id}:`, error);
        }
      }
      // Refetch data after deletion
      fetchData();
    }
  };

  const makeAdmin = async () => {
    const selectedUsersNotAdmin = selected.filter(id => !users.find(user => user.id === id)?.isAdmin);

    const pidsToMakeAdmin = selectedUsersNotAdmin.map(id => users.find(user => user.id === id)?.pid).filter(Boolean);
    console.log('PIDs to make admin:', pidsToMakeAdmin);
  
    const confirmMakeAdmin = window.confirm(
      `Are you sure you want grant admin permission to the selected user(s)?\n\nAffected Users:\n${selectedUsersNotAdmin.map(id => users.find(user => user.id === id)?.name).join('\n')}`
    );
  
    if (confirmMakeAdmin) {

      for (const pid of pidsToMakeAdmin) {
        try {
          const response = await fetch(`${url}admins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pid }),
          });
          console.log(`Response for making ${pid} an admin:`, await response.json());
        } catch (error) {
          console.error(`Error making ${pid} an admin:`, error);
        }
      }
      fetchData(); // Consider refetching or updating state to reflect changes
    }
  };

  const removeAdmin = async () => {

    const affectedUsers = selected.map(id => users.find(user => user.id === id));
  
    const adminsBeingRemoved = affectedUsers.filter(user => user.isAdmin);

    // Count how many admins will remain after this operation
    const remainingAdminsCount = users.filter(user => user.isAdmin).length - adminsBeingRemoved.length;

    // Ensure at least one admin remains
    if (remainingAdminsCount < 1) {
      alert("Operation not allowed. There must be at least one admin.");
      return;
    }

    // Show confirmation dialog with affected users details
    const confirmRemoveAdmin = window.confirm(
      `Are you sure you want to remove admin privileges from the selected user(s)?\n\nAffected Users:\n${affectedUsers.map(user => `${user.name}`).join('\n')}`
    );

    if (confirmRemoveAdmin) {
      // Assuming selected contains IDs of users who are currently marked as admins and should be removed
      const pidsToRemoveAdmin = selected.map(id => users.find(user => user.id === id)?.pid).filter(Boolean);
      console.log('PIDs to remove admin:', pidsToRemoveAdmin);
    
      for (const pid of pidsToRemoveAdmin) {
        try {
          // Make sure the URL is constructed correctly to match your backend route
          const response = await fetch(`${url}admins/${pid}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            throw new Error(`Failed to delete admin with PID: ${pid}, Status: ${response.status}`);
          }
          console.log(`Response for removing ${pid} from admins: Admin deleted successfully`);
        } catch (error) {
          console.error(`Error removing ${pid} from admins:`, error);
        }
      }
      // Consider refetching or updating the state to reflect these changes in the UI
      fetchData();
    }
  };

  useEffect(() => {
    console.log('Current Selection:', selected);
  }, [selected]);
  // Use the themeMode prop to dynamically create the theme
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
        },
        components: {
          // Override styles for DataGrid
          MuiDataGrid: {
            styleOverrides: {
              // Customizes the border color
              root: {
                borderColor: 'black', // Apply black border for the whole DataGrid
                backgroundColor: themeMode === 'dark' ? '#312F2F' : '#F6E8EA',
                '.MuiDataGrid-cell': {
                  borderColor: 'black', // Apply black border for cells
                },
                '.MuiDataGrid-columnHeaders': {
                  borderColor: 'black', // Apply black border for column headers
                },
              },
            },
          },
        },
      }),
    [themeMode]
  );
  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '30px', marginLeft: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <Button 
            variant="contained" 
            onClick={makeAdmin} 
            sx={{ 
              marginRight: '10px',
              backgroundColor: '#64b5f6',
              color: 'black',
              border: '1px solid black',
              '&:hover': { 
                backgroundColor: '#64b5f6',
                color: 'white',
                border: '1px solid #64b5f6',
              }
            }}
          >
            Set Admin
          </Button>
          <Button 
            variant="contained" 
            onClick={removeAdmin} 
            sx={{ 
              marginRight: '10px',
              backgroundColor: '#64b5f6',
              color: 'black',
              border: '1px solid black',
              '&:hover': { 
                backgroundColor: '#64b5f6',
                color: 'white',
                border: '1px solid #64b5f6',
              } 
            }}
          >
            Remove Admin
          </Button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '20px' }}>
          <Button
            variant="contained" 
            onClick={handleDeleteUser} 
            sx={{
              backgroundColor: '#CD5C5C',
              color: 'black',
              border: '1px solid black',
              '&:hover': { 
                backgroundColor: '#CD5C5C',
                color: 'white',
                border: '1px solid #CD5C5C',
              } 
            }}
          >
            Remove User
          </Button>
        </div>
        </div>
        <div style={{ height: '85%', width: '98%', marginTop: '20px' }}>
          <DataGrid
            rows={users}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection={true}
            onRowSelectionModelChange={(newRowSelectionModel) => {
              console.log('New Row Selection Model:', newRowSelectionModel);
              setSelected(newRowSelectionModel);
            }}
            selected={selected}
            {...selected}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
