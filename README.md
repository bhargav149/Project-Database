### Installation

1. Clone the repository to your local machine.

```bash
git clone https://github.com/hyunjekim2000/Brave-Souls.git
```

2. Navigate to the project directory.

```bash
cd Brave-Souls
```

3. Install project dependencies.

```bash
npm install
```

4. Set up environment variables.

   - Create a `.env` file in the root directory of your project.
   - Add the following environment variables:

   ```env
   MYSQL_HOST=your-mysql-host
   MYSQL_USER=your-mysql-username
   MYSQL_PASSWORD=your-mysql-password
   MYSQL_DATABASE=your-mysql-database
   ```

   Replace the placeholders with your actual MySQL configuration.

5. Initialize the database (if applicable).

   Copy paste the contents of init-db.sql into your MySQL CLI.
   
## Usage

Provide instructions on how to run and use your application. Include any additional configuration or steps users need to follow.

On client, (running on port:3000)
```bash
npm start
```
On server, (listening on port:8080)
```bash
node app.js
```

Alternatively using Docker,
```bash
docker-compose -up --build
```
