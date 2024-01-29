CREATE DATABASE projects_app;
USE projects_app;

CREATE TABLE projects (
    id integer PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    contents TEXT NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO projects (title, contents)
VALUES
('First project', 'First project content'),
('Second project', 'Second project content');