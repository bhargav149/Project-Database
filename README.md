### Clone the Repository

```bash
git clone https://github.com/hyunjekim2000/Brave-Souls.git
```

```bash
cd Brave-Souls
```

### Environment Setup

You need to set up environment variables for the project to run correctly. This is done by creating `.env` files in the root and server directories.

#### Root Directory `.env`

Create a `.env` file in the root directory of the project:

```plaintext
MYSQL_HOST='db'
MYSQL_USER='root'
MYSQL_PASSWORD='your-password'
MYSQL_DATABASE='projects_app'
```

Replace `your-password` with your MySQL password

#### Server Directory `.env`

Create a `.env` file in the `server` directory:

```plaintext
MYSQL_HOST='127.0.0.1'
MYSQL_USER='root'
MYSQL_PASSWORD='your-password'
MYSQL_DATABASE='projects_app'
```

Replace `your-password` with your MySQL password

### Docker Compose

Use Docker Compose to build and start the containers:

```bash
docker compose up --build
```

This command builds the images for your application and starts the services defined in your `docker-compose.yaml` file. 

### Accessing the Application

Once the containers are up and running, you can access:
- The web application at `http://localhost:3000`
- The backend API at `http://localhost:8080`

## Stopping the Application

To stop the application, run:

```bash
docker compose down
```

Optional: To remove the volumes along with the containers, use:

```bash
docker compose down -v
```


## CAS And Deployment Notes
- There is a new folder called node in the project. This is the express backend for CAS. Use node start.js to run it locally on port 5000
- In server/database.js, look at the comments and modify initializeDatabase() for local development and then revert when deploying
- The site is deployed at https://bravesouls-projectdb.discovery.cs.vt.edu/. The login page is at https://bravesouls-projectdb.discovery.cs.vt.edu/login and is working but not connected to the rest of the site. It needs to be integrated and styled
- The Docker image for the node project is not included in Dockerfile
-FILES TO MODIFY BEFORE DEPLOYMENT: 
    - server/database.js(look at lines 10-40)
    - server/app.js(lines 28/29)
    - client/src/components/LandingPage.js(lines 49/50, 64-75)
    - client/src/AppRoutes.js(line 14)
    - client/src/components/EditProjectModal.js(lines 20/21)
    - client/src/components/DataTable.js(lines 37/38)
    - client/src/components/Settings.js(lines 14-18)
    - client/src/components/UserTable.js(lines 40-41)
    - client/src/components/AddProjectForm.js(lines 33-34)
    - client/src/components/ViewProjectModal.js(lines 17-18)
    - client/src/MainPage.js(lines 11-12, 36/37)
    - client/src/components/EnterName.js(7-8)
    - all of these files will have comments telling you what to change



## IMPORTANT
- When committing, run these after git add . if you see these are staged
    - git restore --staged client/node_modules
    - git restore --staged node_modules


