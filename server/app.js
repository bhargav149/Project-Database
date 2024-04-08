import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import mime from 'mime-types'
import fs from 'fs'


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
    deleteNoteForProject,
    getFiles,
    addFile,
    deleteFileFromDatabase,
    getProjectByPID,
    switchProject,
    getProjectByTitle,
    getUserByPID,
    getProjectWithSemesters,
    updateProjectMembers
} from './database.js'

const app = express()

app.use(express.json())
app.use(cors())

//use placeholder for local development, add "/server" for deployed
const url=""
// const url="/server"


const storage = multer.diskStorage({
destination: function (req, file, cb) {
    cb(null, 'uploads/')
},
filename: function (req, file, cb) {
    cb(null, file.originalname)
}
});
const upload = multer({ storage: storage });
const __dirname = dirname(fileURLToPath(import.meta.url));


// POST endpoint for file uploads
app.post(url+'/upload', upload.single('file'), (req, res) => {
    // Access the uploaded file details from req.file
    console.log('File uploaded:', req.file);
    
    // Generate a unique filename to ensure uniqueness
    // const uniqueFilename = `${Date.now()}_${req.file.originalname}`;
    
    // Determine the file type
    const fileType = mime.lookup(req.file.originalname);
    
    // Send the filename and file type in the response
    res.json({ filename: req.file.originalname, fileType });
});

// Serve uploaded files statically
app.use(url+'/uploads', express.static(path.join(__dirname, 'uploads')));

app.post(url+'/files', async (req,res) => {
    const {project_id, filename, filetype} = req.body;
    try {
        const file = await addFile(project_id, filename, filetype);
        res.status(201).json(file);
    } catch (err) {
        console.error("Error uploading file:", err);
        res.status(500).send('Something went wrong');
    }
})

app.get(url+'/files/:semesterId', async (req,res) => {
    const files = await getFiles(req.params.semesterId);
    res.json(files);
})

app.delete(url+'/files/:filename', async (req, res) => {
    const filename = req.params.filename;
    console.log(`Received request to delete file: ${filename}`);
    // Delete file entry from MySQL database
    try {
      console.log(`Attempting to delete file: ${filename}`);
      await deleteFileFromDatabase(filename);
      console.log(`File ${filename} deleted from database.`);
      res.sendStatus(204); // No content - operation successful
    } catch (error) {
      console.error(`Error deleting file ${filename} from database:`, error);
      res.status(500).send('Internal Server Error');
    }
  });



app.get(url+"/projects", async (req, res) => {
    const projects = await getProjects()
    res.json(projects)
})


app.get(url+"/projects/:id", async (req, res, next) => {
    const id = req.params.id
    const project = await getProject(id)
    res.json(project)
})

app.get(url+"/projecttitle/:title", async (req,res) => {
    const title = req.params.title
    const project = await getProjectByTitle(title)
    console.log(project.stack)
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

app.get(`${url}/user/:pid`, async (req, res) => {
    try {
        const project_id = await getProjectByPID(req.params.pid)
        if (!project_id) {
            await createUser(req.params.pid, "None", -1);
            return res.json({ project_id: -1 });
        }
        res.json(project_id)
    }catch (error) {
        res.status(500).send('Error fetching project by pid');
    }
})

app.put(`${url}/user/:pid`, async(req,res) => {
    try {
        const user = await getUserByPID(req.params.pid)
        //first remove user from old project
        const oldProjectId = await getProjectByPID(req.params.pid)
        const oldProjects = await getProject(oldProjectId.project_id)
        if(oldProjects.length>0){
            const oldProject = oldProjects[0]
            console.log("old project: ", oldProject)
            const oldMembers = oldProject.team_members
            console.log("old members: ", oldMembers)
            const index = oldMembers.indexOf(user.name);
            let prefix = '';
            let suffix=0
            if (index > 0) {
                prefix = ', ';
            }
            else{
                suffix=2
            }
            console.log("string stuff", index, prefix.length)

            const removedMembers = oldMembers.slice(0, index - prefix.length) + oldMembers.slice(index + suffix + user.name.length);
            await updateProjectMembers(oldProjectId.project_id,removedMembers); 
            console.log("Updated old members")
        }


        //then switch the project and add the user to the new one
        await switchProject(req.params.pid, req.body.project_id);
        console.log("REQ PARAM AND PROJECT ID: ", req.body.project_id, req.params.pid);
        const project = await getProjectWithSemesters(req.body.project_id)
        let newMembers = project.team_members+", "+user.name
        if(project.team_members==''){
            newMembers = user.name
        }
        await updateProjectMembers(req.body.project_id,newMembers); 
        const newProject = await getProjectWithSemesters(req.body.project_id)
        res.status(200).send('Project switched successfully',newProject);
    }catch (error) {
        res.status(500).send('Error switching project');
    }
})

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

app.get(`${url}/admins/:pid`, async (req, res) => {
    try {
        const admin = await getAdmin(req.params.pid);
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

app.delete(`${url}/admins/:pid`, async (req, res) => {
    try {
        const result = await deleteAdmin(req.params.pid);
        // if (result.affectedRows === 0) {
        //     // No rows affected, meaning the pid doesn't exist
        //     return res.status(404).send('Admin not found');
        // }
        res.status(200).send('Admin deleted successfully');
    } catch (error) {
        console.error('Error deleting admin:', error);
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
app.get(`${url}/projects/:projectId/notes`, async (req, res) => {
    const { projectId } = req.params;
    const admin_id = 1;

    try {
        console.log(`Received request to fetch notes for project ID ${projectId}`);
        
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