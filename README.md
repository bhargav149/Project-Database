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
