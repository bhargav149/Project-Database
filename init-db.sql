CREATE DATABASE IF NOT EXISTS projects_app;
USE projects_app;

CREATE TABLE projects (
    id integer PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    contents TEXT NOT NULL,
    stack TEXT NOT NULL,
    team_name TEXT NOT NULL,
    team_members TEXT NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO projects (title, contents, stack, team_name, team_members)
VALUES
('Project Database', 'Create and manage list of projects', 'MySQL, Express.js, React, Node.js', 'Brave Souls', 'Hyunje Kim, Atin Kolli, Prahaara, Bhargav Panchal'),
('Second project', 'Second project description', 'Second project stack', 'Second project team name', 'Second project team members');
