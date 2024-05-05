# User Management API

This repository contains a backend API built using Node.js and Express.js for managing user profiles, including registration, login, logout, and profile updates. The API also provides features to fetch a user's channel profile, watch history, and subscriber count.

## Getting Started

To get started with this project, follow these steps:

1. Clone this repository to your local machine.
2. Install the required dependencies by running npm install in the project directory.
3. Set up your database connection by creating a .env file in the root directory of the project. An example `.env` file is provided in the `.env.example` file.
4. Start the server by running `npm start`.

## Dependencies

This project uses the following dependencies:

- `express`: A fast, unopinionated, minimalist web framework for Node.js.
- `mongoose`: Object modeling tool designed to work in an asynchronous environment.
- `jsonwebtoken`: A package for generating JSON Web Tokens.
- `multer`: A middleware for handling multipart/form-data, which is primarily used for uploading files.
- `dotenv`: A zero-dependency module that loads environment variables from a .env file into process.env.
- `bcryptjs`: A library for hashing passwords.
- `express`-async-errors: A middleware for handling async errors in Express applications.
- `express`-rate-limit: A middleware for limiting the number of requests from a single IP address.
  express-validator: A middleware for validating request data in Express applications.
- `nodemon`: A tool that restarts the Node.js application when file changes are detected.

## API Endpoints

The following API endpoints are available for user management:

| Endpoint             | Method  | Description                                                 |
| -------------------- | ------- | ----------------------------------------------------------- |
| `/register`          | `POST`  | Register a new user and generate access and refresh tokens. |
| `/login`             | `POST`  | Log in a user and generate access and refresh tokens.       |
| `/logout`            | `POST`  | Log out a user.                                             |
| `/refresh-token`     | `POST`  | Generate new access and refresh tokens for a user.          |
| `/change-password`   | `POST`  | Update a user's password.                                   |
| `/current-user`      | `GET`   | Fetch a user's profile details.                             |
| `/update-account`    | `PATCH` | Update a user's account details.                            |
| `/update-avatar`     | `PATCH` | Update a user's avatar.                                     |
| `/cover-image`       | `PATCH` | Update a user's cover image.                                |
| `/channel/:username` | `GET`   | Fetch a user's channel profile details.                     |
| `/watch-history`     | `GET`   | Fetch a user's watch history.                               |

## Testing

To test the API endpoints, you can use a tool like Postman or Insomnia. Simply send a request to the desired endpoint with the appropriate headers and body.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
