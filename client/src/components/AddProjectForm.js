import React, { useState } from 'react';

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
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project Title"
                required
            />
            <input
                type="text"
                value={contents}
                onChange={(e) => setContents(e.target.value)}
                placeholder="Project Contents"
                required
            />
            <input
                type="text"
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                placeholder="Project Stack"
                required
            />
            <input
                type="text"
                value={team_name}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Project Team Name"
                required
                />
            <input
                type="text"
                value={team_members}
                onChange={(e) => setTeamMembers(e.target.value)}
                placeholder="Project Team Members"
                required
            />
            <button type="submit">Add Project</button>
        </form>
    );
}

export default AddProjectForm;