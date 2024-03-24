import React, { useState, useEffect, useRef } from 'react';
import './AddProjectForm.css';

function AddProjectForm({ onAdd }) {
    const [title, setTitle] = useState('');
    const [contents, setContents] = useState('');
    const [stack, setStack] = useState('');
    const [team_name, setTeamName] = useState('');
    const [team_members, setTeamMembers] = useState('');
    const [semester, setSemester] = useState('Spring');
    const [year, setYear] = useState(new Date().getFullYear());
    const yearSelectorRef = useRef(null);
    const semesters = ['Spring', 'Fall'];
    const [selectedSemester, setSelectedSemester] = useState(semesters[0]);

    const currentYear = new Date().getFullYear();
    const years = Array.from(new Array(121), (val, index) => currentYear - 20 + index);

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

        const newSemester = `${selectedSemester} ${year}`;
        onAdd({ title, contents, stack, team_name, team_members, semesters: [newSemester] });
        
        setTitle('');
        setContents('');
        setStack('');
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

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
                <label htmlFor="title"><strong>Title:</strong></label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Project Title"
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
                    placeholder="Project Description"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="stack"><strong>Stack:</strong></label>
                <input
                    id="stack"
                    type="text"
                    value={stack}
                    onChange={(e) => setStack(e.target.value)}
                    placeholder="Project Stack"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="team_name"><strong>Team Name:</strong></label>
                <input
                    id="team_name"
                    type="text"
                    value={team_name}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Team Name"
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
