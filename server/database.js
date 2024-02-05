import mysql from "mysql2";

import dotenv from "dotenv";
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function getProjects() {
    const [rows] = await pool.query("SELECT * FROM projects")
    return rows
}

export async function getProject(id) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM projects
    WHERE id = ?
    `, [id])
    return rows
}

// const [rows] = await getProject(1)
// console.log(rows)

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

// const result = await createProject('test', 'test')
// console.log(result)