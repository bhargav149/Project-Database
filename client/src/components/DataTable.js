import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Define columns based on project data structure
const columns = [
  { field: 'title', headerName: 'Title', width: 200 },
  { field: 'contents', headerName: 'Description', width: 250 },
  { field: 'stack', headerName: 'Stack', width: 150 },
  { field: 'team_name', headerName: 'Team Name', width: 150 },
  { field: 'team_members', headerName: 'Team Members', width: 200 },
  {
    field: 'created',
    headerName: 'Created',
    type: 'date',
    width: 150,
    valueGetter: ({ value }) => (value ? new Date(value) : null), // Convert value to Date object
  },
  { field: 'status', headerName: 'Status', width: 120 },
];

export default function DataTable({ themeMode }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:8080/projects"); // Update the URL to match your API endpoint
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };

    fetchProjects();
  }, []); // Empty dependency array means this effect will only run once, after initial render

  // Use the themeMode prop to dynamically create the theme
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
        },
      }),
    [themeMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <div style={{ height: 600, width: '80%', margin: '0 auto' }}>
        <DataGrid
          rows={projects.map((project) => ({
            ...project,
            created: project.created ? new Date(project.created) : null, // Convert 'created' to Date object
          }))}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          checkboxSelection
        />
      </div>
    </ThemeProvider>
  );
}
