## Color Picker API
- Chris Lane - [github account](https://github.com/CLLane)
- Djavan Munroe - [github account](https://github.com/djavanm)

### Installation and Setup
From the command line:
1. `git clone https://github.com/djavanm/90s-sitcoms-api <PROJECT_NAME>`
1. Run `npm install`
1. Run `nodemon server.js`

In your browser:
Open localhost://3001/

### Overview
The Color Picker API serves information for the [Color Picker App.](https://color-picker-ui.herokuapp.com/login)
Users can login to the website, and save color palettes under their specific username. The Color Picker API was deployed to heroku, and contains 8 endpoints allowing users to consume data saved within a SQL database.

### Technologies
- JavaScript / Node.js 
- Express.js 
- PostgreSQL 
- Knex.js 

### Endpoints

| url | verb | options | expected response |
| ----|------|---------|---------------- |
| `https://color-picker-api.herokuapp.com/user/login` | POST |{"email": <STRING>, "password":<STRING>} | OBJECT containing user id after successful login. |
| `https://color-picker-api.herokuapp.com/user/singup` | POST |{"email": <STRING>, "password":<STRING>} | OBJECT containing user id after successful sign up. |
| `https://color-picker-api.herokuapp.com/projects/:id` | GET | not needed | ARRAY of all projects created with the associated user id. |
| `https://color-picker-api.herokuapp.com/palettes/:id` | GET | not needed | ARRAY of all palettes created with the associated project id.|
| `https://color-picker-api.herokuapp.com/palettes` | GET | not needed | ARRAY of all palettes currently in the database. OPTIONAL query parameter for palettes seletected with a string for NAME.|
| `https://color-picker-api.herokuapp.com/projects` | POST | `{"name": <STRING>, "user_id": <INTEGER>}` | OBJECT containing uniqure project id. |
| `https://color-picker-api.herokuapp.com/palettes` | POST | `{"name": <STRING>, "hex_codes": <STRING>}, "project_id": <INTEGER> ` | OBJECT containing uniqure palette id. |
| `https://color-picker-api.herokuapp.com/palettes/:id` | PATCH | {"name": <STRING>}| OBJECT containing updated palette. |
| `https://color-picker-api.herokuapp.com/projects/:id` | DELETE | not needed | Status code 204 |
| `https://color-picker-api.herokuapp.com/palettes/:id` | DELETE | not needed | Status code 204 |

Note: All of these endpoints will return semantic errors if something is wrong with the request.