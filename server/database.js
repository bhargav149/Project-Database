import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool;

async function initializeDatabase() {
    console.log("Initializing database...");
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
    });

    console.log("Connected to MySQL database.");

    console.log("Creating projects database...");
    await connection.query('CREATE DATABASE IF NOT EXISTS projects_app');
    await connection.end();

    console.log("Projects database created.");

    console.log("Creating projects and project_semesters tables...");
    pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'projects_app',
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

    // Check if tables were created successfully
    console.log("Verifying tables creation...");
    const [projectsTableRows] = await pool.query("SHOW TABLES LIKE 'projects'");
    const [projectSemestersTableRows] = await pool.query("SHOW TABLES LIKE 'project_semesters'");
    if (projectsTableRows.length > 0 && projectSemestersTableRows.length > 0) {
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
            ('Project Database', 'Second phase with enhancements.', 'React, Node.js, GraphQL', 'Continuation Team 1', 'Charlie, Dana', 'In-Progress', 1),
            ('Project Database', 'Second phase with enhancements.', 'React, Node.js, GraphQL', 'Continuation Team 1', 'Charlie, Dana', 'In-Progress', 1),
            ('Project Database', 'Second phase with enhancements.', 'React, Node.js, GraphQL', 'Continuation Team 1', 'Charlie, Dana', 'In-Progress', 1),
            ('Suspended Project', 'Final phase with additional features.', 'React, Node.js, GraphQL, Docker', 'Continuation Team 2', 'Evan, Faith', 'In-Progress', 3),
            ('Suspended Project', 'Final phase with additional features.', 'React, Node.js, GraphQL, Docker', 'Continuation Team 2', 'Evan, Faith', 'In-Progress', 3),
            ('Suspended Project', 'Final phase with additional features.', 'React, Node.js, GraphQL, Docker', 'Continuation Team 2', 'Evan, Faith', 'In-Progress', 3),
            ('Suspended Project', 'Final phase with additional features.', 'React, Node.js, GraphQL, Docker', 'Continuation Team 2', 'Evan, Faith', 'In-Progress', 3),
            ('Suspended Project', 'Final phase with additional features.', 'React, Node.js, GraphQL, Docker', 'Continuation Team 2', 'Evan, Faith', 'In-Progress', 3);
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
            { projectId: 2, semester: 'Spring 2024' },
            { projectId: 3, semester: 'Spring 2024' },
            { projectId: 4, semester: 'Spring 2024' },
            { projectId: 5, semester: 'Fall 2024' },
            { projectId: 6, semester: 'Spring 2025' },
            { projectId: 7, semester: 'Fall 2025' },
            { projectId: 8, semester: 'Fall 2024' },
            { projectId: 9, semester: 'Spring 2025' },
            { projectId: 10, semester: 'Fall 2025' },
            { projectId: 11, semester: 'Spring 2026' },
            { projectId: 12, semester: 'Fall 2026' },
        ];

        await Promise.all(semesterData.map(data =>
            pool.query(`
                INSERT INTO project_semesters (project_id, semester)
                VALUES (?, ?)
            `, [data.projectId, data.semester])
        ));
        console.log("Seed data inserted successfully.");
    } else {
        console.log("Seed data already exists in projects table.");
    }

    console.log("Database initialization complete.");
}

initializeDatabase()

export async function getProjects() {
    const [projects] = await pool.query(`
        SELECT p.*, GROUP_CONCAT(ps.semester SEPARATOR ', ') AS semesters
        FROM projects p
        LEFT JOIN project_semesters ps ON p.id = ps.project_id
        GROUP BY p.id
    `);
    console.log("Fetched projects with semesters:", projects);
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

export async function createProject(title, contents, stack, team_name, team_members, status = 'Unassigned', semesters = [], continuation_of_project_id = null) {
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

export async function updateProject(id, title, contents, stack, team_name, team_members, status, semesters, continuation_of_project_id = null) {
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
    await pool.query(`
        DELETE FROM project_semesters
        WHERE project_id = ?
    `, [projectId]);

    if (semesters && semesters.length > 0) {
        await Promise.all(semesters.map(semester => 
            pool.query(`
                INSERT INTO project_semesters (project_id, semester)
                VALUES (?, ?)
            `, [projectId, semester])
        ));
    }
}
