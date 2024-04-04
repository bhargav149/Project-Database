import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// Define columns based on project data structure
const columns = [
  { field: 'title', headerName: 'Title', width: 200 },
  { field: 'contents', headerName: 'Description', width: 300 },
  { field: 'stack', headerName: 'Stack', width: 150 },
  { field: 'team_name', headerName: 'Team Name', width: 150 },
//   { field: 'team_members', headerName: 'Team Members', width: 200 },
//   {
//     field: 'created',
//     headerName: 'Created',
//     type: 'date',
//     width: 150,
//     valueGetter: ({ value }) => (value ? new Date(value) : null), // Convert value to Date object
//   },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'semesters', headerName: 'Semester', width: 120 },
  { 
    field: 'continuation_of_project_id', 
    headerName: 'Project Type', 
    width: 120,
    valueGetter: ({ value }) => {
      if (value === -1) {
        return "Root";
      } else {
        return "Continued";
      }
    }
  }
];

//USE FIRST URL FOR LOCAL DEVELOPMENT AND SECOND FOR DEPLOYMENT
// const url = "http://localhost:8080/";
const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"

export default function DataTable({ themeMode, deleteProject, saveEdit }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(url+"/projects");
        const data = await response.json();
        data.sort((a, b) => {
          const titleComparison = a.title.localeCompare(b.title);
          if (titleComparison !== 0) {
            return titleComparison;
          }
          return compareSemesters(a.semesters, b.semesters);
        });
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };

    fetchProjects();
  }, []);

  const compareSemesters = (semesterA, semesterB) => {
    const [, termA, yearA] = semesterA.match(/(\w+) (\d+)/);
    const [, termB, yearB] = semesterB.match(/(\w+) (\d+)/);
    const termOrder = { 'Spring': 0, 'Fall': 1 };

    const termComparison = termOrder[termA] - termOrder[termB];
    if (termComparison !== 0) {
      return termComparison;
    }
    return parseInt(yearA) - parseInt(yearB);
  };
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
      <div style={{ height: 600, width: '60%', marginTop: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Project Database
          </Typography>
        </div>
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
