import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool;

async function initializeDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
    });

    await connection.query('CREATE DATABASE IF NOT EXISTS projects_app');
    await connection.end();

    pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'projects_app',
    });

    const createProjectsTableSql = `
        CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            contents TEXT NOT NULL,
            stack TEXT NOT NULL,
            team_name TEXT NOT NULL,
            team_members TEXT NOT NULL,
            created TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `;
    await pool.query(createProjectsTableSql);

    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM projects');
    if (rows[0]['count'] === 0) {
        const seedDataSql = `
            INSERT INTO projects (title, contents, stack, team_name, team_members)
            VALUES
            ('Project Database', 'Create and manage list of projects', 'MySQL, Express.js, React, Node.js', 'Brave Souls', 'Hyunje Kim, Atin Kolli, Prahaara, Bhargav Panchal'),
            ('Example project', 'Project description...', 'Project stack...', 'Project team name', 'Project team members');
        `;
        await pool.query(seedDataSql);
    }
}

initializeDatabase()

export async function getProjects() {
    const [rows] = await pool.query('SELECT * FROM projects');
    return rows;
}

export async function getProject(id) {
    const [rows] = await pool.query(`
        SELECT * 
        FROM projects
        WHERE id = ?
    `, [id]);
    return rows;
}

export async function createProject(title, contents, stack, team_name, team_members) {
    const [result] = await pool.query(`
        INSERT INTO projects (title, contents, stack, team_name, team_members)
        VALUES (?, ?, ?, ?, ?)
    `, [title, contents, stack, team_name, team_members]);
    const id = result.insertId;
    return getProject(id);
}

export async function deleteProject(id) {
    const [result] = await pool.query(`
    DELETE FROM projects
    WHERE id = ?
    `, [id]);
    return result;
}

export async function updateProject(id, title, contents, stack, team_name, team_members) {
    const [result] = await pool.query(`
        UPDATE projects 
        SET title = ?, contents = ?, stack = ?, team_name = ?, team_members = ?
        WHERE id = ?
    `, [title, contents, stack, team_name, team_members, id]);
    return getProject(id);
}