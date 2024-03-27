// import mysql from 'mysql2/promise';
const mysql = require('mysql2/promise');
const dotenv = require('dotenv')
// import dotenv from 'dotenv';
dotenv.config();

let pool;

async function initializeDatabase() {
    const connection = await mysql.createConnection({
        //use for local development
        // host: process.env.MYSQL_HOST,
        // user: process.env.MYSQL_USER,
        // password: process.env.MYSQL_PASSWORD,

        //use for deployment
        host:	'bravesouls-projectdb-mysql',
        user: 'user',
        password: 'bravesouls',

    });

    await connection.query('CREATE DATABASE IF NOT EXISTS projects_app');
    await connection.end();

    pool = mysql.createPool({
        //use for local development
        // host: process.env.MYSQL_HOST,
        //user: process.env.MYSQL_USER,
        //password: process.env.MYSQL_PASSWORD,

        //use for cloud deployment
        host:	'bravesouls-projectdb-mysql',
        user: 'user',
        password: 'bravesouls',
        
        database: 'projects_app',
    });

    const createProjectsTableSql = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        timestamp VARCHAR(255) NOT NULL

    );
    `;
    await pool.query(createProjectsTableSql);

}

initializeDatabase()

async function getUsers() {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
}

async function getUser(username) {
    const [rows] = await pool.query(`
        SELECT * 
        FROM users
        WHERE username = ?
    `, [username]);
    return rows;
}

async function createUser(username, timestamp) {
    const [result] = await pool.query(`
        INSERT INTO users (username, timestamp)
        VALUES (?, ?)
    `, [username, timestamp]);
    const id = result.insertId;
    return getUser(username);
}

async function deleteUser(id) {
    const [result] = await pool.query(`
    DELETE FROM users
    WHERE id = ?
    `, [id]);
    return result;
}

module.exports={getUsers,getUser,createUser,deleteUser}
