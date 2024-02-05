import mysql from "mysql2";

import dotenv from "dotenv";
dotenv.config()

import fs from "fs/promises";

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

// Function to check if the 'projects' table exists
async function doesTableExist(tableName) {
    try {
      // Check if the table exists by querying information_schema
        const [rows] = await pool.query(
            "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = ?",
            [tableName]
        );
        return rows.length > 0;
    } catch (error) {
        console.error("Error checking table existence:", error);
        return false;
    }
}

// Function to run the 'init-db.sql' script
async function runInitScript() {
    try {
        // Read the 'init-db.sql' script from the file
        const initScript = await fs.readFile("init-db.sql", "utf8");
        
        // Execute the script
        await pool.query(initScript);
        console.log("Initialization script executed successfully.");
    } catch (error) {
        console.error("Error executing initialization script:", error);
    }
}

// Check if the 'projects' table exists
doesTableExist("projects").then((tableExists) => {
    if (!tableExists) {
        // Table doesn't exist, run the initialization script
        runInitScript();
    } 
    else {
    // Table exists, you can start your server or perform other actions here
    console.log("Table 'projects' already exists.");
    }
});

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