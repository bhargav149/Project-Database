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

function sortSemesters(semesters) {
  return semesters.sort((a, b) => {
    const [semesterA, yearA] = a.split(' ');
    const [semesterB, yearB] = b.split(' ');

    const semesterOrder = { 'Spring': 1, 'Fall': 2 };

    if (yearA === yearB) {
      return semesterOrder[semesterA] - semesterOrder[semesterB];
    }
    return yearA - yearB;
  });
}

export default function SemesterDropdown({ themeMode, availableSemesters, selectedSemesters, setSelectedSemesters }) {
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedSemesters(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  // Use the themeMode prop to dynamically create the theme
  const theme = React.useMemo(() => createTheme({
    palette: {
      mode: themeMode,
    },
  }), [themeMode]);

  const sortedSemesters = React.useMemo(() => sortSemesters(availableSemesters), [availableSemesters]);
  
  
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
          {sortedSemesters.map((semester) => (
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
