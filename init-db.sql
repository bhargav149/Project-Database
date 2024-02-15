CREATE DATABASE IF NOT EXISTS projects_app;
USE projects_app;

CREATE TABLE projects (
    id integer PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    contents TEXT NOT NULL,
    stack TEXT NOT NULL,
    team_name TEXT NOT NULL,
    team_members TEXT NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW(),
    status ENUM('Completed', 'In-Progress', 'Suspended', 'Unassigned') NOT NULL DEFAULT 'Unassigned');

INSERT INTO projects (title, contents, stack, team_name, team_members, status)
            VALUES
            ('Project Database', 'Create and manage list of projects', 'MySQL, Express.js, React, Node.js', 'Brave Souls', 'Hyunje Kim, Atin Kolli, Prahaara, Bhargav Panchal', 'In-Progress'),
            ('Completed Project', 'Description of completed project...', 'Stack of completed project...', 'Completed Team', 'Completed Team Members', 'Completed'),
            ('Suspended Project', 'Description of suspended project...', 'Stack of suspended project...', 'Suspended Team', 'Suspended Team Members', 'Suspended'),
            ('Unassigned Project', 'Description of unassigned project...', 'Stack of unassigned project...', 'Unassigned Team', 'Unassigned Team Members', 'Unassigned');
