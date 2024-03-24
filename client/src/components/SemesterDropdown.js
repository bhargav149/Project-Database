import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 5;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 180,
    },
  },
};

const semesters = [
  'Spring 2022',
  'Fall 2022',
  'Spring 2023',
];

export default function SemesterDropdown({ themeMode, availableSemesters }) {
  const [selectedSemesters, setSelectedSemesters] = React.useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedSemesters(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  // Use the themeMode prop to dynamically create the theme
  const theme = React.useMemo(() => createTheme({
    palette: {
      mode: themeMode,
    },
  }), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <FormControl sx={{ m: 1, width: 180 }} size="small">
        <InputLabel id="demo-multiple-checkbox-label">Semester</InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={selectedSemesters}
          onChange={handleChange}
          input={<OutlinedInput label="Semester" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
        >
          {availableSemesters.map((semester) => (
            <MenuItem key={semester} value={semester}>
              <Checkbox checked={selectedSemesters.indexOf(semester) > -1} />
              <ListItemText primary={semester} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </ThemeProvider>
  );
}
