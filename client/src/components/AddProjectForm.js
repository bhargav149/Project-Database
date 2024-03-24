import React, { useState, useEffect, useRef } from 'react';
import './AddProjectForm.css';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Chip from '@mui/material/Chip';

function AddProjectForm({ onAdd }) {
    const [title, setTitle] = useState('');
    const [contents, setContents] = useState('');
    const [stack, setStack] = useState([]);
    const [team_name, setTeamName] = useState('');
    const [team_members, setTeamMembers] = useState('');
    const [semester, setSemester] = useState('Spring');
    const [year, setYear] = useState(new Date().getFullYear());
    const yearSelectorRef = useRef(null);
    const semesters = ['Spring', 'Fall'];
    const [selectedSemester, setSelectedSemester] = useState(semesters[0]);

    const currentYear = new Date().getFullYear();
    const years = Array.from(new Array(121), (val, index) => currentYear - 20 + index);

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

    const handleSubmit = (e) => {
        e.preventDefault();

        const stackString = stack.map(option => option.title).join(', ');
        const newSemester = `${selectedSemester} ${year}`;
        onAdd({ title, contents, stack: stackString, team_name, team_members, semesters: [newSemester] });
        
        setTitle('');
        setContents('');
        setStack([]);
        setTeamName('');
        setTeamMembers('');
        setSemester('');
        setYear(new Date().getFullYear());
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

    return (
        <form onSubmit={handleSubmit} className="form-container">
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
            <div className="form-group">
                <label htmlFor="team_name"><strong>Team Name:</strong></label>
                <input
                    id="team_name"
                    type="text"
                    value={team_name}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Brave Souls"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="team_members"><strong>Team Members:</strong></label>
                <input
                    id="team_members"
                    type="text"
                    value={team_members}
                    onChange={(e) => setTeamMembers(e.target.value)}
                    placeholder="Team Members"
                    required
                />
            </div>
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