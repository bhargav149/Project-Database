import express from 'express'
import cors from 'cors'
import {
    getProjects,
    getProject,
    createProject,
    deleteProject,
    updateProject,
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    createAdmin,
    getAdmins,
    getAdmin,
    updateAdmin,
    deleteAdmin,
    createTeam,
    getTeams,
    getTeam,
    updateTeam,
    deleteTeam,
    addNoteToProject,
    getNotesForProject,
    updateNoteForProject,
    deleteNoteForProject
} from './database.js'

const app = express()

app.use(express.json())
app.use(cors())

//use placeholder for local development, add "/server" for deployed
const url=""
// const url="/server"



app.get(url+"/projects", async (req, res) => {
    const projects = await getProjects()
    res.json(projects)
})

app.get(url+"/projects/:id", async (req, res, next) => {
    const id = req.params.id
    const project = await getProject(id)
    res.json(project)
})

app.post(url+"/projects", async (req, res, next) => {
    const {title, contents, stack, team_name, team_members, status, semesters, continuation_of_project_id} = req.body;
    try {
        const project = await createProject(title, contents, stack, team_name, team_members, status, semesters, continuation_of_project_id);
        res.status(201).json(project);
    } catch (err) {
        console.error("Error creating project:", err);
        res.status(500).send('Something went wrong');
    }
})

app.delete(url+"/projects/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await deleteProject(id);
        if (result.affectedRows > 0) {
            res.status(200).send(`Project with ID: ${id} deleted successfully.`);
        } else {
            res.status(404).send("Project not found.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong');
    }
});

app.put(url+"/projects/:id", async (req, res) => {
    const { id } = req.params;
    const { title, contents, stack, team_name, team_members, status, semesters, continuation_of_project_id } = req.body; // Assume `semesters` is provided as an array

    try {
        const updatedProject = await updateProject(id, title, contents, stack, team_name, team_members, status, semesters, continuation_of_project_id); // Pass `semesters` to your function
        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).send('Something went wrong');
    }
});

app.get(`${url}/users`, async (req, res) => {
    try {
        const users = await getUsers();
        res.json(users);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
});

app.get(`${url}/users/:id`, async (req, res) => {
    try {
        const user = await getUser(req.params.id);
        if (user) res.json(user);
        else res.status(404).send('User not found');
    } catch (error) {
        res.status(500).send('Error fetching user');
    }
});

app.post(`${url}/users`, async (req, res) => {
    try {
        const id = await createUser(req.body.name, req.body.pid, req.body.team_id);
        res.status(201).json({ id, ...req.body });
    } catch (error) {
        res.status(500).send('Error creating user');
    }
});

app.put(`${url}/users/:id`, async (req, res) => {
    try {
        await updateUser(req.params.id, req.body.name, req.body.pid, req.body.team_id);
        res.status(200).send('User updated successfully');
    } catch (error) {
        res.status(500).send('Error updating user');
    }
});

app.delete(`${url}/users/:id`, async (req, res) => {
    try {
        await deleteUser(req.params.id);
        res.status(200).send('User deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting user');
    }
});

app.get(`${url}/admins`, async (req, res) => {
    try {
        const admins = await getAdmins();
        res.json(admins);
    } catch (error) {
        res.status(500).send('Error fetching admins');
    }
});

app.get(`${url}/admins/:id`, async (req, res) => {
    try {
        const admin = await getAdmin(req.params.id);
        if (admin) res.json(admin);
        else res.status(404).send('Admin not found');
    } catch (error) {
        res.status(500).send('Error fetching admin');
    }
});

app.post(`${url}/admins`, async (req, res) => {
    try {
        const id = await createAdmin(req.body.pid);
        res.status(201).json({ id, ...req.body });
    } catch (error) {
        res.status(500).send('Error creating admin');
    }
});

app.put(`${url}/admins/:id`, async (req, res) => {
    try {
        await updateAdmin(req.params.id, req.body.pid);
        res.status(200).send('Admin updated successfully');
    } catch (error) {
        res.status(500).send('Error updating admin');
    }
});

app.delete(`${url}/admins/:id`, async (req, res) => {
    try {
        await deleteAdmin(req.params.id);
        res.status(200).send('Admin deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting admin');
    }
});

// Get all teams
app.get(`${url}/teams`, async (req, res) => {
    try {
        const teams = await getTeams();
        res.json(teams);
    } catch (error) {
        res.status(500).send('Error fetching teams');
    }
});

// Get a single team by ID
app.get(`${url}/teams/:id`, async (req, res) => {
    try {
        const team = await getTeam(req.params.id);
        if (team) res.json(team);
        else res.status(404).send('Team not found');
    } catch (error) {
        res.status(500).send('Error fetching team');
    }
});

// Create a new team
app.post(`${url}/teams`, async (req, res) => {
    try {
        const id = await createTeam(req.body.team_name, req.body.team_members, req.body.project_id);
        res.status(201).json({ id, ...req.body });
    } catch (error) {
        res.status(500).send('Error creating team');
    }
});

// Update an existing team
app.put(`${url}/teams/:id`, async (req, res) => {
    try {
        await updateTeam(req.params.id, req.body.team_name, req.body.team_members, req.body.project_id);
        res.status(200).send('Team updated successfully');
    } catch (error) {
        res.status(500).send('Error updating team');
    }
});

// Delete a team
app.delete(`${url}/teams/:id`, async (req, res) => {
    try {
        await deleteTeam(req.params.id);
        res.status(200).send('Team deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting team');
    }
});

// Get notes for a project
app.get('/projects/:projectId/notes', async (req, res) => {
    const { projectId } = req.params;
    const admin_id = 1;

    try {
        const notes = await getNotesForProject(admin_id, projectId);
        console.log(`Notes fetched: ${JSON.stringify(notes)}`);
        res.json(notes);
    } catch (error) {
        console.error(`Error fetching notes for project ID ${projectId}:`, error);
        res.status(500).send('Error fetching project notes');
    }
});


// Add a note to a project
app.post(`${url}/projects/:projectId/notes`, async (req, res) => {
    const { admin_id, note } = req.body;
    try {
        await addNoteToProject(admin_id, req.params.projectId, note);
        res.status(201).send('Note added successfully');
    } catch (error) {
        res.status(500).send('Error adding note to project');
    }
});

// Update a note for a project
app.put(`${url}/notes/:noteId`, async (req, res) => {
    const { admin_id, newNote } = req.body;
    try {
        await updateNoteForProject(req.params.noteId, admin_id, newNote);
        res.status(200).send('Note updated successfully');
    } catch (error) {
        res.status(500).send('Error updating project note');
    }
});

// Delete a note for a project
app.delete(`${url}/notes/:noteId`, async (req, res) => {
    const { admin_id } = req.body; // Assuming you want to verify the admin ID on deletion
    try {
        await deleteNoteForProject(req.params.noteId, admin_id);
        res.status(200).send('Note deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting project note');
    }
});

app.use((err, req, res, next) => {
    // console.error(err.stack);
    res.status(500).send('Something went wrong')
})

app.listen(8080, () => {
    console.log('listening on port 8080')
})