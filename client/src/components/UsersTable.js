import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// Define columns based on user data structure
const columns = [
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'pid', headerName: 'Email', width: 200 },
  { field: 'team_id', headerName: 'Role', width: 130 },
];

// Assuming the URL is defined outside the component or passed in as a prop
const url = "http://localhost:8080/";

export default function UsersTable({ themeMode }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(url + "users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    fetchUsers();
  }, []);

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
      <div style={{ height: 600, width: '100%', marginTop: '20px' }}>
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
