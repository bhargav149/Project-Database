import React, { useState, useEffect, useRef } from 'react';
import './AddProjectForm.css';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

function AddProjectForm({ onAdd, projects }) {
    const [title, setTitle] = useState('');
    const [contents, setContents] = useState('');
    const [stack, setStack] = useState([]);
    const [team_name, setTeamName] = useState('');
    const [team_members, setTeamMembers] = useState('');
    const [semester, setSemester] = useState('Spring');
    const [year, setYear] = useState(new Date().getFullYear());
    const [stackString,setStackString] = React.useState("");
    const yearSelectorRef = useRef(null);
    const semesters = ['Spring', 'Fall'];
    const [selectedSemester, setSelectedSemester] = useState(semesters[0]);
    const [isContinuation, setIsContinuation] = useState('no');
    const [selectedContinuationProject, setSelectedContinuationProject] = useState(null);
    const [cont, setCont] = useState(-1);
    const [status, setStatus] = useState('Unassigned');
    const currentYear = new Date().getFullYear();
    const years = Array.from(new Array(121), (val, index) => currentYear - 20 + index);
    const url = "http://localhost:8080/";
    // const url = "https://bravesouls-projectdb.discovery.cs.vt.edu/server/"

    const stackOptions = [
        { title: 'React.js' },
        { title: 'Vue.js' },
        { title: 'Angular' },
        { title: 'Node.js' },
        { title: 'Express.js' },
        { title: 'Django' },
        { title: 'Flask' },
        { title: 'Ruby on Rails' },
        { title: 'ASP.NET Core' },
        { title: 'Spring Boot' },
        { title: 'MySQL' },
        { title: 'PostgreSQL' },
        { title: 'MongoDB' },
        { title: 'Redis' },
        { title: 'Docker' },
        { title: 'Kubernetes' },
        { title: 'AWS' },
        { title: 'Google Cloud Platform' },
        { title: 'Azure' },
        { title: 'Git' },
        { title: 'GitHub Actions' },
        { title: 'Jest' },
        { title: 'TypeScript' },
        { title: 'Bootstrap' },
        { title: 'Tailwind CSS' },
        { title: 'VT CAS' },
        { title: 'CS CAS' },
    ];

    useEffect(() => {
        if(yearSelectorRef.current) {
            const selectedYearElement = yearSelectorRef.current.querySelector(`.year-option.selected-year`);
            if(selectedYearElement) {
                const selectedElementOffset = selectedYearElement.offsetTop - yearSelectorRef.current.offsetTop;
                const centerPosition = selectedElementOffset - (yearSelectorRef.current.offsetHeight / 2) + (selectedYearElement.offsetHeight / 2);
                yearSelectorRef.current.scrollTop = centerPosition;
            }
        }
    }, []);

    const fetchName = async () => {
        try {
          const response = await fetch(url+'projecttitle/'+title)
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          const stackFromJson = data.stack; // Extract "stack" field from JSON object
          setStack(stackFromJson); // Set "stack" variable to the value extracted from JSON
        } catch (error) {
          console.error('Error fetching data:', error);
        }
    };
  

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Calculate how far in the future the selected year is
        const yearsAhead = year - new Date().getFullYear();

        // Warn and confirm if the selected year is 3 or more years ahead
        if (yearsAhead >= 3) {
            const isConfirmed = window.confirm(`The selected year is ${yearsAhead} years in the future. Are you sure you want to proceed?`);
            if (!isConfirmed) {
                return; // If the user does not confirm, prevent form submission
            }
        }
        if(isContinuation==='yes') {
            try {
                const response = await fetch(url+'projecttitle/'+title);
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const stackFromJson = data.stack;
                const projectData = {
                    title,
                    contents,
                    stack: stackFromJson,
                    team_name,
                    team_members,
                    status,
                    semesters: [`${selectedSemester} ${year}`],
                    continuation_of_project_id: cont,
                };
                console.log(projectData)
                if (isContinuation === 'yes' && !selectedContinuationProject) {
                    console.error("Please select a project to continue.");
                    return;
                }
                onAdd(projectData);
                setTitle('');
                setContents('');
                setStack([]);
                setTeamName('');
                setTeamMembers('');
                setSemester('');
                setStatus('');
                setStackString('');
                setYear(new Date().getFullYear());
                setSelectedContinuationProject(null);
              } catch (error) {
                console.error('Error fetching data:', error);
              }
        }
        else{
            const temp = stack.map(option => option.title).join(', ')
            setStackString(temp);
            const projectData = {
                title,
                contents,
                stack: temp,
                team_name,
                team_members,
                status,
                semesters: [`${selectedSemester} ${year}`],
                continuation_of_project_id: cont,
            };
            if (isContinuation === 'yes' && !selectedContinuationProject) {
                console.error("Please select a project to continue.");
                return;
            }
            onAdd(projectData);
            
            setTitle('');
            setContents('');
            setStack([]);
            setTeamName('');
            setTeamMembers('');
            setSemester('');
            setStatus('');
            setStackString('');
            setYear(new Date().getFullYear());
            setSelectedContinuationProject(null);
        }
    };

    const handleYearClick = (selectedYear) => {
        setYear(selectedYear);
    };

    const handleSemesterClick = (semester) => {
        setSelectedSemester(semester);
    };
    
    const renderCustomTags = (value, getTagProps) =>
        value.map((option, index) => (
            <Chip
                variant="outlined"
                label={option.title}
                {...getTagProps({ index })}
                style={{ fontSize: '0.65rem' }}
            />
        ));

    const handleProjectSelection = (event, value) => {
        setSelectedContinuationProject(value);
        setTitle(value ? value.title : '');
        setCont(value ? value.id : '-1')
        console.log(title);
        console.log(cont);
    };

    const eligibleProjectsForContinuation = projects.filter(project => project.continuation_of_project_id === -1);

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
                <FormControl component="fieldset">
                    <FormLabel component="legend"><strong>Is this a continued project?</strong></FormLabel>
                    <RadioGroup
                        row
                        aria-label="isContinuation"
                        name="isContinuation"
                        value={isContinuation}
                        onChange={(e) => setIsContinuation(e.target.value)}
                        sx={{
                            '.MuiFormControlLabel-label': { 
                                fontSize: '0.75rem',
                                color: '#fff'
                            }
                        }}
                    >
                        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                        <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl><FormControl component="fieldset">
                    <FormLabel component="legend"><strong>Select Status</strong></FormLabel>
                    <RadioGroup
                        row
                        aria-label="status"
                        name="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        sx={{
                            '.MuiFormControlLabel-label': { 
                                fontSize: '0.75rem',
                                color: '#fff'
                            }
                        }}
                    >
                        <FormControlLabel value="In-Progress" control={<Radio />} label="In-Progress" />
                        <FormControlLabel value="Unassigned" control={<Radio />} label="Unassigned" />
                        <FormControlLabel value="Completed" control={<Radio />} label="Completed" />
                        <FormControlLabel value="Suspended" control={<Radio />} label="Suspended" />
                    </RadioGroup>
                </FormControl>
            </div>
            {isContinuation === 'no' && (
                <div>
                    <div className="form-group">
                        <label htmlFor="title"><strong>Title:</strong></label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Project Database"
                            required
                        />
                    </div>
                    <div className="form-group">
                <label htmlFor="contents"><strong>Description:</strong></label>
                <input
                    id="contents"
                    type="text"
                    value={contents}
                    onChange={(e) => setContents(e.target.value)}
                    placeholder="e.g. Create and manage list of projects"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="stack"><strong>Stack:</strong></label>
                <Autocomplete
                multiple
                id="stack"
                freeSolo
                options={stackOptions}
                disableCloseOnSelect
                getOptionLabel={(option) => option.title || option}
                value={stack || []}
                onChange={(event, newValue) => {
                    const valueWithObjects = newValue.map(item => 
                        typeof item === 'string' ? { title: item } : item
                    );
                    setStack(valueWithObjects);
                }}
                isOptionEqualToValue={(option, value) => option.title === value.title}
                renderOption={(props, option, { selected }) => (
                    <li {...props}>
                        <Checkbox
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        {option.title}
                    </li>
                )}
                renderTags={renderCustomTags}
                renderInput={(params) => (
                    <TextField {...params}
                    placeholder="Select or Enter Stack..."
                    sx={{ 
                        "& .MuiOutlinedInput-root": {
                            bgcolor: '#fff',
                            fontSize: '0.7rem',
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif", // Use the system font here
                            fontWeight: '300'
                        }
                    }}
                />
                )}
                popupIcon={null}
            />
            </div>
                </div>
            )}
            {isContinuation === 'yes' && (
                <div>
                    <strong>Title:</strong>
                    <Autocomplete
                        id="project-continuation-autocomplete"
                        options={eligibleProjectsForContinuation}
                        getOptionLabel={(option) => option.title}
                        style={{ width: 300, height: 50 }}
                        renderInput={(params) => <TextField {...params} variant="outlined"/>}
                        onChange={handleProjectSelection}
                        value={selectedContinuationProject}
                        sx={{ 
                            "& .MuiOutlinedInput-root": {
                                padding: '2px', // Further reduce padding around the input field
                                "& .MuiOutlinedInput-input": {
                                    padding: '6px 4px', // Minimize vertical padding
                                    fontSize: '0.75rem', // Further reduce font size if necessary for appearance
                                },
                                width: '87%',
                                backgroundColor: '#fff',
                                marginTop: '5px',
                            },
                            "& .MuiInputLabel-root": {
                                transform: 'translate(14px, 4px) scale(1)', // Adjust label initial position for smaller input
                                fontSize: '0.75rem', // Optional: Reduce label font size for consistency
                            },
                            "& .MuiInputLabel-shrink": {
                                transform: 'translate(14px, -6px) scale(0.75)', // Adjust label position for focused state
                            },
                            "& .MuiSvgIcon-root": { // Adjust icon size if necessary
                                fontSize: '1rem',
                            },
                        }}
                    />
                </div>
                
            )}
            <label><strong>Semester and Year:</strong></label>
            <div className="semester-year-group">
                <div className="semester-selector">
                    {semesters.map((semester) => (
                        <div key={semester}
                             className={`semester-option ${selectedSemester === semester ? 'selected-semester' : ''}`}
                             onClick={() => handleSemesterClick(semester)}>
                            {semester}
                        </div>
                    ))}
                </div>
                <div ref={yearSelectorRef} className="year-selector">
                    {years.map((yearOption) => (
                        <div key={yearOption} 
                             className={`year-option ${year === yearOption ? 'selected-year' : ''}`} 
                             onClick={() => handleYearClick(yearOption)}>
                            {yearOption}
                        </div>
                    ))}
                </div>
            </div>
            <button type="submit">Create New Project</button>
        </form>
    );
}

export default AddProjectForm;