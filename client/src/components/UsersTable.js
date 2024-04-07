import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// Define columns based on user data structure
const columns = [
  { field: 'name', headerName: 'Name', width: 150 },
  { 
    field: 'pid', 
    headerName: 'Email', 
    width: 200,
    renderCell: (params) => (
      <a href={`mailto:${params.value}@vt.edu`} style={{ textDecoration: 'none' }}>
        {`${params.value}@vt.edu`}
      </a>
    ),
  },
  { 
    field: 'project_id', 
    headerName: 'Project', 
    width: 200,
    renderCell: (params) => params.row.projectName || 'No Project', // Custom rendering to show project name
  },
  {
    field: 'teamName',
    headerName: 'Team Name',
    width: 200,
    renderCell: (params) => params.value || 'No Team', // Render the team name
  },
  { 
    field: 'isAdmin', 
    headerName: 'Role', 
    width: 130,
    renderCell: (params) => (params.value ? 'Admin' : 'User'),
  },
];

// Assuming the URL is defined outside the component or passed in as a prop
const url = "http://localhost:8080/";

export default function UsersTable({ themeMode }) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSelectUser = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      const [projectsResponse, adminsResponse, usersResponse] = await Promise.all([
        fetch(url + "projects"),
        fetch(url + "admins"),
        fetch(url + "users"),
      ]);
      const projectsData = await projectsResponse.json();
      const adminsData = await adminsResponse.json();
      const usersData = await usersResponse.json();

      // Extend the project mapping to include team names
      const projectIdToProjectDetails = projectsData.reduce((acc, project) => ({
        ...acc,
        [project.id]: { 
          title: project.title, 
          teamName: project.team_name, // Include team name in the mapping
        },
      }), {});
  
      const adminPIDs = new Set(adminsData.map(admin => admin.pid));
  
      // Enrich users with project names and team names, and mark them as admin or user
      const enrichedUsers = usersData.map(user => ({
        ...user,
        projectName: projectIdToProjectDetails[user.project_id]?.title || 'No Project',
        teamName: projectIdToProjectDetails[user.project_id]?.teamName || 'No Team', // Add team name to user object
        isAdmin: adminPIDs.has(user.pid),
      }));
  
      setUsers(enrichedUsers);
    };
  
    fetchData();
  }, [url]);
  


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
      <div style={{ height: '85%', width: '70%', marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Manage Users
          </Typography>
        </div>
        <DataGrid
          rows={users}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          checkboxSelection
        />
      </div>
    </ThemeProvider>
  );
}
