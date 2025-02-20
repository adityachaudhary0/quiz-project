# Brain Bite - Programming Quiz Platform

Brain Bite is an interactive programming quiz platform that challenges users with quizzes on various programming languages (Python, C, HTML/CSS, etc.). It features user authentication (login/registration), dynamic question fetching via an API, and real-time score tracking.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Interactive Quizzes:** Challenge yourself with a variety of programming questions.
- **User Authentication:** Secure registration and login with password hashing using bcrypt.
- **Dynamic Questions:** Questions are loaded from a JSON file and can be updated via API.
- **Responsive Design:** A modern user interface built with HTML, CSS, and JavaScript.

## Project Structure

Brain-Bite/ ├── public/ │ ├── index.html # Main HTML file │ ├── style.css # Custom styles │ └── app.js # Frontend JavaScript ├── server.js # Express server setup ├── questions.json # Quiz questions data ├── users.json # User data (for demo/testing) ├── package.json # Project metadata and dependencies ├── package-lock.json # Exact dependency versions ├── README.md # Project documentation (this file) └── .gitignore # Files and folders to ignore in Git

bash
Copy
Edit

## Installation

1. **Clone the repository:**

   ```sh
   git clone git@github.com:adityachaudhary0/Quiz-Project.git
   cd Quiz-Project
Install dependencies:

sh
Copy
Edit
npm install
Usage
Start the server:

sh
Copy
Edit
npm start
Access the application:

Open your browser and go to http://localhost:3000

API Endpoints
GET /api/questions: Returns all quiz questions.
POST /api/questions: Adds a new quiz question.
PUT /api/questions/:id: Updates an existing quiz question.
DELETE /api/questions/:id: Deletes a quiz question.
Refer to server.js for more details on the API routes.

Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a new branch for your feature or bug fix:
sh
Copy
Edit
git checkout -b feature/your-feature
Commit your changes and push your branch:
sh
Copy
Edit
git push -u origin feature/your-feature
Open a pull request with a detailed description of your changes.
License
This project is licensed under the MIT License.

yaml
Copy
Edit

---

### File: .gitignore

```gitignore
# Node modules
node_modules/

# Environment files
.env

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS generated files
.DS_Store

# Other
coverage/
