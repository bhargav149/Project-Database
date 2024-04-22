import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Toast from './Toast';

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
const url = "http://localhost:8080/";
// const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"

export default function DataTable({ themeMode, deleteProject, saveEdit, data }) {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastFadeOut, setToastFadeOut] = useState(false);
  const [toastError, setToastError] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [data]);

  const showToastWithFadeOut = (message, error = false) => {
    if (showToast) {
      // If a toast is currently shown, hide it immediately
      setShowToast(false);
      setTimeout(() => {
        // Set the new toast after a brief timeout to ensure it triggers properly
        setToastMessage(message);
        setToastError(error);
        setShowToast(true);
      }, 100); // A short delay to reset the toast display
    } else {
      // Show new toast immediately if no toast is visible
      setToastMessage(message);
      setToastError(error);
      setShowToast(true);
    }

    setTimeout(() => {
      setShowToast(false); // Automatically hide toast after 10 seconds
    }, 10000);
  };

  const showErrorToastWithFadeOut = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setToastFadeOut(false); // Reset fade-out animation
    setToastError(true)
  
    setTimeout(() => {
      setToastFadeOut(true); // Start fade-out animation
      setTimeout(() => {
        setShowToast(false);
        setToastFadeOut(false); // Ensure the fade-out state is reset for the next toast
      }, 700); // This duration should match the CSS animation duration for fading out
    }, 10000); // Time the toast is visible before starting to fade out
  };


  const parseSemester = (semester) => {
  const match = semester.match(/(\w+) (\d+)/);
  if (!match) {
    return { term: 'Fall', year: 0 }; // Consider throwing an error or handling this case differently
  }
  return { term: match[1], year: parseInt(match[2]) };
};

const compareSemesters = (semesterA, semesterB) => {
  const { term: termA, year: yearA } = parseSemester(semesterA);
  const { term: termB, year: yearB } = parseSemester(semesterB);
  const termOrder = { 'Spring': 0, 'Fall': 1 };

  const yearComparison = yearB - yearA;
  if (yearComparison !== 0) {
    return -yearComparison;
  }
  return termOrder[termA] - termOrder[termB];
};
  
  // Modify fetchProjects to include debug for sorting
  const fetchProjects = async () => {
    try {
      const response = await fetch(url + "projects");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const sortedData = data.sort((a, b) => {
        const result = compareSemesters(b.semesters, a.semesters);
        return result;
      });
  
      setProjects([...sortedData]); // Set state with a new array to ensure re-render
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };
  

  const theme = React.useMemo(() => {
    return createTheme({
      palette: {
        mode: themeMode,
      },
      components: {
        MuiDataGrid: {
          styleOverrides: {
            root: {
              borderColor: 'black',
              backgroundColor: themeMode === 'dark' ? '#312F2F' : 'inherit',
              '& .MuiDataGrid-row': {
                '&:nth-of-type(odd)': {
                  backgroundColor: themeMode === 'dark' ? '#2b2b2b' : '#f7f7f7',
                },
                '&:nth-of-type(even)': {
                  backgroundColor: themeMode === 'dark' ? '#202020' : '#ffffff',
                },
              },
              '& .MuiDataGrid-cell': {
                borderColor: 'black',
                backgroundColor: 'inherit',
              },
              '& .MuiDataGrid-columnHeaders': {
                borderColor: 'white',
                backgroundColor: 'inherit',
              },
            },
          },
        },
      },
    });
  }, [themeMode]);
  

  // Function to update project status
  const updateStatus = async (newStatus) => {
    // Use Promise.all to wait for all updates to finish before refreshing
    let error=false;
    await Promise.all(selected.map(async (projectId) => {
      const projectToUpdate = projects.find(p => p.id === projectId);
      if (!projectToUpdate) {
        console.error('Project not found in local data:', projectId);
        setToastError(true);
        showToastWithFadeOut("Error: Project not found in local data")
        return;
      }
      const { title, contents, stack, team_name, team_members, semesters, continuation_of_project_id, summary, repository, production_url } = projectToUpdate;
      const requestBody = {
        title,
        contents,
        stack,
        team_name,
        team_members: team_members || [],
        status: newStatus,
        semesters: semesters || [],
        continuation_of_project_id,
        summary,
        repository,
        production_url
      };

      console.log(`Updating project (ID: ${projectId}): `, requestBody); // Log the request body
      if(newStatus==='Completed' && (title==='' || contents===''|| stack===''|| team_name===''|| team_members===''|| repository===''|| production_url==='')){
        error=true;
      }
      else{
        const response = await fetch(url + `projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        console.log(`Failed to update project (ID: ${projectId}):`);
        setToastError(true);
        showToastWithFadeOut("Error: : HTTP error occurred while updating the project")
      }
    }
    }));
    setToastError(error);
    if(error){
      showErrorToastWithFadeOut("Some project(s) could not be marked as complete - links missing");
    }
    else{
      showToastWithFadeOut("Successfully updated selected project status");
    }
    fetchProjects(); // Only refresh after all updates are complete
  };
  

  // Function to delete selected project
  const deleteSelectedProject = async () => {

    const isConfirmed = window.confirm('Are you sure you want to permanently delete the selected project(s)? You cannot undo this action.');
    
    // Proceed only if the user confirms
    if (isConfirmed) {
      await Promise.all(selected.map(async (projectId) => {
        try {
          const response = await fetch(url + `projects/${projectId}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            throw new Error('HTTP error occurred while deleting the project');
          }
        } catch (error) {
          console.error('Error deleting project:', error);
          setToastError(true);
          showToastWithFadeOut("Error: Failed to delete selected project");
          return; // Early return to skip further execution in case of error
        }
      }));
      setToastError(false);
      showToastWithFadeOut("Successfully deleted selected projects");
      fetchProjects(); // Refresh the projects list after all deletions are processed
    }
  };
  
  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', marginTop: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Status buttons on the left */}
          <div>
            <Button 
              onClick={() => updateStatus('Unassigned')}
              variant="contained" 
              sx={{ marginRight: '10px', backgroundColor: '#ffb74d', color: 'black', '&:hover': { backgroundColor: '#ffb74d', color: 'white' } }}
            >
              Set Unassigned
            </Button>
            <Button 
              onClick={() => updateStatus('In-Progress')}
              variant="contained" 
              sx={{ marginRight: '10px', backgroundColor: '#64b5f6', color: 'black', '&:hover': { backgroundColor: '#64b5f6', color: 'white' } }}
            >
              Set In-Progress
            </Button>
            <Button 
              onClick={() => updateStatus('Completed')}
              variant="contained" 
              sx={{ marginRight: '10px', backgroundColor: '#8bc34a', color: 'black', '&:hover': { backgroundColor: '#8bc34a', color: 'white' } }}
            >
              Set Completed
            </Button>
            <Button 
              onClick={() => updateStatus('Suspended')}
              variant="contained" 
              sx={{ marginRight: '10px', backgroundColor: '#e57373', color: 'black', '&:hover': { backgroundColor: '#e57373', color: 'white' } }}
            >
              Set Suspended
            </Button>
          </div>
          {/* Delete button on the far right */}
          <Button
            onClick={deleteSelectedProject}
            variant="contained" 
            sx={{ backgroundColor: '#312F2F', color: 'red', border: '1px solid red', '&:hover': { backgroundColor: '#312F2F', color: 'white' } }}
          >
            Delete Project
          </Button>
        </div>
          </div>
          <DataGrid
            rows={projects.map((project) => ({
              ...project,
              created: project.created ? new Date(project.created) : null, // Convert 'created' to Date object
            }))}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection={true}
            onRowSelectionModelChange={(newRowSelectionModel) => {
              setSelected(newRowSelectionModel);
            }}
            selected={selected}
            {...selected}
          />
      </div>
      <Toast show={showToast} message={toastMessage} fadeOut={toastFadeOut} error={toastError}/>
    </ThemeProvider>
  );
}
