import React, { useState } from 'react';
import './AddProjectForm.css';

function AddProjectForm({ onAdd }) {
    const [title, setTitle] = useState('');
    const [contents, setContents] = useState('');
    const [stack, setStack] = useState('');
    const [team_name, setTeamName] = useState('');
    const [team_members, setTeamMembers] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({ title, contents, stack, team_name, team_members });
        setTitle('');
        setContents('');
        setStack('');
        setTeamName('');
        setTeamMembers('');
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
            <button type="submit">Create New Project</button>
        </form>
    );
}

export default AddProjectForm;