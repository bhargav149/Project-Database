import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function BasicSelect({ onCategoryChange, themeMode }) {
  const [category, setCategory] = React.useState('');

  const handleChange = (event) => {
    setCategory(event.target.value);
    onCategoryChange(event.target.value);
  };

  // Dynamically create theme based on themeMode prop
  const theme = React.useMemo(() => createTheme({
    palette: {
      mode: themeMode, // Use themeMode prop here
    },
  }), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <FormControl sx={{ m:1, width: 120 }} size="small">
        <InputLabel id="demo-simple-select-label">Category</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={category}
          label="Category"
          onChange={handleChange}
          sx={{ height: 40, width: 120, color: 'text.primary', bgcolor: 'transparent' }}
        >
          <MenuItem value={'title'}>Title</MenuItem>
          <MenuItem value={'contents'}>Description</MenuItem>
          <MenuItem value={'stack'}>Stack</MenuItem>
          <MenuItem value={'team_name'}>Team Name</MenuItem>
          {/* <MenuItem value={'status'}>Status</MenuItem> */}
        </Select>
      </FormControl>
    </ThemeProvider>
  );
}
