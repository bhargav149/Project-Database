import mysql from 'mysql2/promise';
import dotenv from 'dotenv';    
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
dotenv.config();

let pool;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function initializeDatabase() {
    console.log("Initializing database...");
    const connection = await mysql.createConnection({
        // use for local development
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        //use for deployment
        // host:	'bravesouls-projectdb-mysql',
        // user: 'user',
        // password: 'bravesouls',

    });

    console.log("Connected to MySQL database.");

    console.log("Creating projects database...");
    await connection.query('CREATE DATABASE IF NOT EXISTS projects_app');
    await connection.end();

    console.log("Projects database created.");

    console.log("Creating projects and project_semesters tables...");
    pool = mysql.createPool({
        //use for local development
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'projects_app',

        // use for cloud deployment
        // host:	'bravesouls-projectdb-mysql',
        // user: 'user',
        // password: 'bravesouls',
        // database: 'projects_app',
    });

    // Create projects table
    const createProjectsTableSql = `
    CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        contents TEXT NOT NULL,
        stack TEXT NOT NULL,
        team_name TEXT NOT NULL,
        team_members TEXT NOT NULL,
        created TIMESTAMP NOT NULL DEFAULT NOW(),
        status ENUM('Completed', 'In-Progress', 'Suspended', 'Unassigned') NOT NULL DEFAULT 'Unassigned',
        continuation_of_project_id INT DEFAULT -1
    );
    `;

    console.log("Creating projects table...");
    await pool.query(createProjectsTableSql);
    console.log("Projects table created.");

    // Create project_semesters table
    const createProjectSemestersTableSql = `
    CREATE TABLE IF NOT EXISTS project_semesters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT,
        semester VARCHAR(20),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );`;

    console.log("Creating project_semesters table...");
    await pool.query(createProjectSemestersTableSql);
    console.log("Project_semesters table created.");

    console.log("Creating user table...");
    const createUserTableSql = `
    CREATE TABLE IF NOT EXISTS user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pid VARCHAR(255) NOT NULL,
        name VARCHAR(255) DEFAULT 'None',
        project_id INT DEFAULT -1
    );`;
    await pool.query(createUserTableSql);
    console.log("User table created.");

    console.log("Creating admin table...");
    const createAdminTableSql = `
    CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pid VARCHAR(255) NOT NULL
    );`;
    await pool.query(createAdminTableSql);
    console.log("Admin table created.");

    console.log("Creating team table...");
    const createTeamTableSql = `
    CREATE TABLE IF NOT EXISTS team (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_name VARCHAR(255) NOT NULL,
        team_members VARCHAR(255) NOT NULL,
        project_id INT DEFAULT -1
    );`;

    await pool.query(createTeamTableSql);
    console.log("Team table created or modified.");

    console.log("Creating admin_project_notes table...");
    const createAdminProjectNotesTableSql = `
    CREATE TABLE IF NOT EXISTS admin_project_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT,
        project_id INT,
        note TEXT NOT NULL,
        FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );`;
    await pool.query(createAdminProjectNotesTableSql);
    console.log("Admin_project_notes table created.");

    const createFileTableSql = `
    CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT,
        filename VARCHAR(255) NOT NULL,
        filetype VARCHAR(255) NOT NULL
    );`;

    await pool.query(createFileTableSql);

    // Check if tables were created successfully
    console.log("Verifying tables creation...");
    const [projectsTableRows] = await pool.query("SHOW TABLES LIKE 'projects'");
    const [projectSemestersTableRows] = await pool.query("SHOW TABLES LIKE 'project_semesters'");
    const [projectTeamTableRows] = await pool.query("SHOW TABLES LIKE 'team'");
    const [projectUserTableRows] = await pool.query("SHOW TABLES LIKE 'user'");
    const [projectAdminTableRows] = await pool.query("SHOW TABLES LIKE 'admin'");

    if (projectsTableRows.length > 0 && projectSemestersTableRows.length > 0 && projectTeamTableRows.length > 0
        && projectUserTableRows.length > 0 && projectAdminTableRows.length > 0) {
        console.log("Tables created successfully.");
    } else {
        console.error("Failed to create tables.");
    }

    // Seed data
    console.log("Seeding initial data...");
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM projects');
    if (rows[0]['count'] === 0) {
        console.log("Inserting seed data into projects table...");
        const seedDataSql = `
            INSERT INTO projects (title, contents, stack, team_name, team_members, status, continuation_of_project_id)
            VALUES
            ('Project Database', 'Create and manage list of projects', 'MySQL, Express.js, React, Node.js', 'Brave Souls', 'Hyunje Kim, Atin Kolli, Prahaara, Bhargav Panchal', 'In-Progress', -1),
            ('Completed Project', 'Description of completed project...', 'Stack of completed project...', 'Completed Team', 'Completed Team Members', 'Completed', -1),
            ('Suspended Project', 'Description of suspended project...', 'Stack of suspended project...', 'Suspended Team', 'Suspended Team Members', 'Suspended', -1),
            ('Unassigned Project', 'Description of unassigned project...', 'Stack of unassigned project...', 'Unassigned Team', 'Unassigned Team Members', 'Unassigned', -1),
            ('Project Database', 'Second phase with enhancements.', 'React, Node.js, MongoDB', 'Continuation Team 1', 'Charlie, Dan', 'In-Progress', 1),
            ('Project Database', 'Third phase with enhancements.', 'React, Node.js, GraphQL', 'Continuation Team 2', 'Jay, John', 'Suspended', 1),
            ('Project Database', 'Fourth phase with enhancements.', 'React, Node.js, GraphQL, Express.js', 'Continuation Team 3', 'Sam, Nguyen', 'Completed', 1),
            ('Suspended Project', 'Second phase with enhancements.', 'React, Node.js, GraphQL, Docker', 'Continuation Team 1', 'Evan, Faith', 'In-Progress', 3),
            ('Suspended Project', 'Third phase with enhancements.', 'React, Node.js, GraphQL, Docker', 'Continuation Team 2', 'Chris, Boone', 'In-Progress', 3),
            ('Suspended Project', 'Fourth phase with enhancements.', 'React, Node.js, GraphQL, Docker', 'Continuation Team 3', 'Brown, Sunny', 'In-Progress', 3),
            ('Suspended Project', 'Fifth phase with enhancements.', 'React, Node.js, GraphQL, Docker', 'Continuation Team 4', 'Some Creative Name, Some Creative Name', 'In-Progress', 3),
            ('Suspended Project', 'Final phase with enhancements.', 'React, Node.js, GraphQL, Docker', 'Continuation Team 5', 'Running out of Ideas..., Running out of Ideas...', 'In-Progress', 3),
            ('Mobile App Development', 'Development of a cross-platform mobile application', 'React Native, Node.js', 'Mobile Devs', 'Alice, Bob, Charlie', 'In-Progress', -1),
            ('Data Analysis Tool', 'Tool for analyzing large datasets with AI', 'Python, Pandas, TensorFlow', 'Data Wizards', 'Diana, Edward', 'Completed', -1),
            ('E-commerce Website', 'An e-commerce website with custom CMS', 'PHP, Laravel, Vue.js', 'Commerce Crew', 'Faith, George, Hannah', 'Suspended', -1);
            `;
        await pool.query(seedDataSql);




        // Insert 'Spring 2024' semester for all projects
        const spring2024Semester = 'Spring 2024';

        const [projects] = await pool.query('SELECT id FROM projects');
        const projectIds = projects.map(project => project.id);
        // await Promise.all(projectIds.map(projectId =>
        //     pool.query(`
        //         INSERT INTO project_semesters (project_id, semester)
        //         VALUES (?, ?)
        //     `, [projectId, spring2024Semester])
        // ));
    
        const semesterData = [
            { projectId: 1, semester: 'Spring 2024' },
            { projectId: 2, semester: 'Fall 2018' },
            { projectId: 3, semester: 'Spring 2020' },
            { projectId: 4, semester: 'Spring 2024' },
            { projectId: 5, semester: 'Fall 2024' },
            { projectId: 6, semester: 'Spring 2025' },
            { projectId: 7, semester: 'Fall 2025' },
            { projectId: 8, semester: 'Fall 2024' },
            { projectId: 9, semester: 'Spring 2025' },
            { projectId: 10, semester: 'Fall 2025' },
            { projectId: 11, semester: 'Spring 2026' },
            { projectId: 12, semester: 'Fall 2026' },
            { projectId: 13, semester: 'Spring 2024' },
            { projectId: 14, semester: 'Fall 2023' },
            { projectId: 15, semester: 'Spring 2024' },
        ];

        await Promise.all(semesterData.map(data =>
            pool.query(`
                INSERT INTO project_semesters (project_id, semester)
                VALUES (?, ?)
            `, [data.projectId, data.semester])
        ));

        console.log("Seeding initial data for team, user, and admin tables...");
        // Insert teams linked to projects
        await pool.query(
            "INSERT INTO team (team_name, team_members, project_id) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)", 
            ['Team 1', 'HyunJe, Atin, Prahaara', 1,
            'Mobile Devs', 'Alice, Bob, Charlie', 13,
            'Data Wizards', 'Diana, Edward', 14,
            'Commerce Crew', 'Faith, George, Hannah', 15]
        );        
        // Insert users linked to teams
        await pool.query(`
            INSERT INTO user (name, pid, project_id) VALUES
            ('HyunJe', 'k3h0j8', 1),
            ('Random person 1', 'pid1', 1),
            ('Random person 2', 'pid2', 2),
            ('Random person 3', 'pid3', 3),
            ('Random person 4', 'pid4', 4),
            ('Alice', 'user1', 2),
            ('Bob', 'user2', 2),
            ('Charlie', 'user3', 2),
            ('Diana', 'user4', 3),
            ('Edward', 'user5', 3),
            ('Faith', 'user6', 4),
            ('George', 'user7', 4),
            ('Hannah', 'user8', 4);
        `);
        // Insert admins linked to teams
        await pool.query(`
            INSERT INTO admin (pid) VALUES
            ('k3h0j8'),
            ('atink'),
            ('prahaara08'),
            ('barry22'),
            ('adminpid');
        `);
    
        console.log("Seed data for team, user, and admin tables inserted successfully.");

        console.log("Inserting initial note into admin_project_notes table...");
        const insertNoteSql = `
            INSERT INTO admin_project_notes (admin_id, project_id, note)
            VALUES 
            (1, 1, 'Project Database, Spring 2024, Written by: Admin 1'),
            (2, 1, 'Project Database, Spring 2024, Written by: Admin 2'),
            (1, 2, 'Completed Project, Spring 2024, Written by: Admin 1'),
            (2, 2, 'Completed Project, Spring 2024, Written by: Admin 2'),
            (1, 3, 'Suspended Project, Spring 2024, Written by: Admin 1'),
            (2, 3, 'Suspended Project, Spring 2024, Written by: Admin 2'),
            (1, 4, 'Unassigned Project, Spring 2024, Written by: Admin 1'),
            (2, 4, 'Unassigned Project, Spring 2024, Written by: Admin 2'),
            (1, 5, 'Project Database Phase 2, Spring 2024, Written by: Admin 1'),
            (2, 5, 'Project Database Phase 2, Spring 2024, Written by: Admin 2'),
            (1, 6, 'Project Database Phase 3, Spring 2024, Written by: Admin 1'),
            (2, 6, 'Project Database Phase 3, Spring 2024, Written by: Admin 2'),
            (1, 7, 'Project Database Phase 4, Spring 2024, Written by: Admin 1'),
            (2, 7, 'Project Database Phase 4, Spring 2024, Written by: Admin 2'),
            (1, 8, 'Suspended Project Phase 2, Spring 2024, Written by: Admin 1'),
            (2, 8, 'Suspended Project Phase 2, Spring 2024, Written by: Admin 2'),
            (1, 9, 'Suspended Project Phase 3, Spring 2024, Written by: Admin 1'),
            (2, 9, 'Suspended Project Phase 3, Spring 2024, Written by: Admin 2'),
            (1, 10, 'Suspended Project Phase 4, Spring 2024, Written by: Admin 1'),
            (2, 10, 'Suspended Project Phase 4, Spring 2024, Written by: Admin 2'),
            (1, 11, 'Suspended Project Phase 5, Spring 2024, Written by: Admin 1'),
            (2, 11, 'Suspended Project Phase 5, Spring 2024, Written by: Admin 2'),
            (1, 12, 'Suspended Project Final Phase, Spring 2024, Written by: Admin 1'),
            (2, 12, 'Suspended Project Final Phase, Spring 2024, Written by: Admin 2'),
            (1, 13, 'Mobile App Development, Spring 2024, Written by: Admin 1'),
            (2, 13, 'Mobile App Development, Spring 2024, Written by: Admin 2'),
            (1, 14, 'Data Analysis Tool, Spring 2024, Written by: Admin 1'),
            (2, 14, 'Data Analysis Tool, Spring 2024, Written by: Admin 2'),
            (1, 15, 'E-commerce Website, Spring 2024, Written by: Admin 1'),
            (2, 15, 'E-commerce Website, Spring 2024, Written by: Admin 2');
        `;
        await pool.query(insertNoteSql);
        console.log("Initial note inserted into admin_project_notes table.");

        console.log("Seed data inserted successfully.");
    } else {
        console.log("Seed data already exists in projects table.");
    }
    console.log("Database initialization complete.");
}

initializeDatabase()

export async function getFiles(projectId) {
    const [files] = await pool.query(`
        SELECT * FROM files WHERE project_id = ?
    `, [projectId]);
    return files;
}

export async function addFile(project_id, filename, filetype) {
    const [result] = await pool.query(`
    INSERT INTO files (project_id, filename, filetype)
    VALUES (?,?,?)
    `, [project_id,filename,filetype]);
    return getFiles(project_id);
}

export async function getProjects() {
    const [projects] = await pool.query(`
        SELECT p.*, GROUP_CONCAT(ps.semester SEPARATOR ', ') AS semesters
        FROM projects p
        LEFT JOIN project_semesters ps ON p.id = ps.project_id
        GROUP BY p.id
    `);
    // console.log("Fetched projects with semesters:", projects);
    return projects;
}


export async function getProject(id) {
    const [rows] = await pool.query(`
        SELECT * 
        FROM projects
        WHERE id = ?
    `, [id]);
    return rows;
}

export async function createProject(title, contents, stack, team_name, team_members, status = 'Unassigned', semesters = [], continuation_of_project_id) {
    console.log(`Creating project with semesters: ${semesters}`);
    const [projectResult] = await pool.query(`
        INSERT INTO projects (title, contents, stack, team_name, team_members, status, continuation_of_project_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, contents, stack, team_name, team_members, status, continuation_of_project_id]);
    const projectId = projectResult.insertId;

    await Promise.all(semesters.map(semester => 
        pool.query(`
            INSERT INTO project_semesters (project_id, semester)
            VALUES (?, ?)
        `, [projectId, semester]).then(() => console.log(`Inserted semester ${semester} for project ${projectId}`))
         .catch(err => console.error(`Error inserting semester ${semester} for project ${projectId}:`, err))
    ));

    console.log(`Inserted semesters for project ID ${projectId}: ${semesters}`);
    return getProjectWithSemesters(projectId);
}

async function getProjectWithSemesters(projectId) {
    const [projectRows] = await pool.query(`
        SELECT * 
        FROM projects
        WHERE id = ?
    `, [projectId]);

    if (projectRows.length === 0) {
        return null;
    }

    const [semesterRows] = await pool.query(`
        SELECT semester 
        FROM project_semesters
        WHERE project_id = ?
    `, [projectId]);

    const project = projectRows[0];
    const semesters = semesterRows.map(row => row.semester);

    return { ...project, semesters };
}


export async function deleteProject(id) {
    const [result] = await pool.query(`
    DELETE FROM projects
    WHERE id = ?
    `, [id]);
    return result;
}

export async function updateProject(id, title, contents, stack, team_name, team_members, status, semesters, continuation_of_project_id) {
    const query = `
        UPDATE projects 
        SET title = ?, contents = ?, stack = ?, team_name = ?, team_members = ?, status = ?, continuation_of_project_id = ?
        WHERE id = ?
    `;

    await pool.query(query, [title, contents, stack, team_name, team_members, status, continuation_of_project_id, id]);
    await updateProjectSemesters(id, semesters);
    return getProjectWithSemesters(id);
}


export async function addSemesterToProject(project_id, semester) {
    await pool.query(`
        INSERT INTO project_semesters (project_id, semester)
        VALUES (?, ?)
    `, [project_id, semester]);
}

export async function getProjectSemesters(project_id) {
    const [rows] = await pool.query(`
        SELECT semester 
        FROM project_semesters
        WHERE project_id = ?
    `, [project_id]);
    return rows.map(row => row.semester);
}

async function updateProjectSemesters(projectId, semesters) {
    // Ensure semesters is always an array
    const semestersArray = Array.isArray(semesters) ? semesters : [semesters].filter(Boolean);

    await pool.query(`
        DELETE FROM project_semesters
        WHERE project_id = ?
    `, [projectId]);

    if (semestersArray.length > 0) {
        await Promise.all(semestersArray.map(semester => 
            pool.query(`
                INSERT INTO project_semesters (project_id, semester)
                VALUES (?, ?)
            `, [projectId, semester])
        ));
    }
}

export async function addNoteToProject(admin_id, project_id, note) {
    await pool.query(`
        INSERT INTO admin_project_notes (admin_id, project_id, note)
        VALUES (?, ?, ?)
    `, [admin_id, project_id, note]);
}

export async function getNotesForProject(admin_id, project_id) {
    try {
        console.log(`Fetching notes for project ID ${project_id} by admin ID ${admin_id}`);
        
        // Include `project_id` in your SELECT clause
        const [rows] = await pool.query(`
            SELECT note, project_id
            FROM admin_project_notes
            WHERE admin_id = ? AND project_id = ?
        `, [admin_id, project_id]);
        
        console.log(`Fetched ${rows.length} notes for project ID ${project_id}`);
        
        // Now, since `project_id` is being selected, it will be included in each row
        return rows.map(row => ({
            note: row.note,
            projectId: row.project_id  // Correctly including project_id in the response
        }));
    } catch (error) {
        console.error('Error fetching notes for project:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
}


export async function updateNoteForProject(note_id, admin_id, newNote) {
    await pool.query(`
        UPDATE admin_project_notes
        SET note = ?
        WHERE id = ? AND admin_id = ?
    `, [newNote, note_id, admin_id]);
}

export async function deleteNoteForProject(note_id, admin_id) {
    await pool.query(`
        DELETE FROM admin_project_notes
        WHERE id = ? AND admin_id = ?
    `, [note_id, admin_id]);
}

export async function createUser(pid, name, project_id) {
    const [result] = await pool.query(`
        INSERT INTO user (pid, name, project_id)
        VALUES (?, ?, ?)
    `, [pid, name, project_id]);
    return result.insertId;
}

export async function getUsers() {
    const [users] = await pool.query(`SELECT * FROM user`);
    return users;
}

export async function getUser(id) {
    const [rows] = await pool.query(`SELECT * FROM user WHERE id = ?`, [id]);
    return rows[0];
}
export async function updateUser(id, name, pid, team_id) {
    await pool.query(`
        UPDATE user SET name = ?, pid = ?, team_id = ?
        WHERE id = ?
    `, [name, pid, team_id, id]);
}

export async function deleteUser(id) {
    await pool.query(`DELETE FROM user WHERE id = ?`, [id]);
}

export async function createAdmin(pid) {
    const [result] = await pool.query(`
        INSERT INTO admin (pid)
        VALUES (?)
    `, [pid]);
    return result.insertId;
}

export async function getAdmins() {
    const [admins] = await pool.query(`SELECT * FROM admin`);
    return admins;
}

export async function getAdmin(id) {
    const [rows] = await pool.query(`SELECT * FROM admin WHERE pid = ?`, [id]);
    return rows[0];
}

export async function updateAdmin(id, pid) {
    await pool.query(`
        UPDATE admin SET pid = ?
        WHERE id = ?
    `, [pid, id]);
}

export async function deleteAdmin(id) {
    await pool.query(`DELETE FROM admin WHERE id = ?`, [id]);
}

export async function createTeam(team_name, team_members, project_id) {
    const [result] = await pool.query(`
        INSERT INTO team (team_name, team_members, project_id)
        VALUES (?, ?, ?)
    `, [team_name, team_members, project_id]);
    return result.insertId;
}

export async function getTeams() {
    const [teams] = await pool.query(`SELECT * FROM team`);
    return teams;
}

export async function getTeam(id) {
    const [rows] = await pool.query(`SELECT * FROM team WHERE id = ?`, [id]);
    return rows[0];
}

export async function updateTeam(id, team_name, team_members, project_id) {
    await pool.query(`
        UPDATE team SET team_name = ?, team_members = ?, project_id = ?
        WHERE id = ?
    `, [team_name, team_members, project_id, id]);
}

export async function deleteTeam(id) {
    await pool.query(`DELETE FROM team WHERE id = ?`, [id]);
}

// Method to delete file entry from MySQL database
export async function deleteFileFromDatabase(filename) {
    try {
      // First, delete the file record from the database
      const sql = 'DELETE FROM files WHERE filename = ?';
      const [result] = await pool.query(sql, [filename]);
      
      // Check if the file was actually deleted from the database
      if (result.affectedRows > 0) {
          // Construct the path to the file
          const filePath = path.join(__dirname, 'uploads', filename);

      // Check if the file exists and delete it
      fs.unlink(filePath, (err) => {
          if (err) {
              console.error(`Failed to delete file from file system: ${filename}`, err);
              // Consider how you want to handle this error. You might not want to throw here.
          } else {
              console.log(`File ${filename} deleted from file system.`);
          }
      });
    } else {
        console.log(`No database entry found for filename: ${filename}`);
    }

    return result; // You might adjust what you return based on your needs
  } catch (error) {
    console.error(`Database error when attempting to delete file ${filename}:`, error);
    throw error; // Make sure to re-throw the error to catch it in the route handler
  }
}


export async function getProjectByPID(pid) {
    const [rows] = await pool.query(`
        SELECT project_id 
        FROM user
        WHERE pid = ?
    `, [pid]);
    return rows[0];
}

export async function switchProject(pid, project_id) {
    await pool.query(`
        UPDATE user SET project_id = ?
        WHERE pid = ?
    `, [project_id, pid]);
}

