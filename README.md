# Event Management System 🎉

A comprehensive full-stack event management platform built with React and Node.js. This system allows users to create, book, and manage events while providing administrative controls for event oversight.

## Documentation

- [Database schema](docs/Database-Schema.md)
- [ER diagram](docs/ER-Diagram.md)
- [REST API](docs/API-Documentation.md)
- [Project report](docs/Project-Report.md)

## Current stack and roles

The current implementation uses React (Create React App), React Router, Axios, Node.js, Express, JWT, MongoDB, and Mongoose. It implements `ADMIN`, `ORGANIZER`, and `PARTICIPANT` roles. TypeScript and Tailwind CSS are not used in the current repository.

[![GitHub Profile](https://img.shields.io/badge/GitHub-Rahul--Sahani04-blue?style=flat&logo=github)](https://github.com/Rahul-Sahani04)

## Features 🌟

### User Features
- 👤 User authentication (Register/Login)
- 📅 Browse and book events
- 🎫 View booked events history
- ✏️ Edit user profile
- 📞 Contact page for support
- 📝 Provide feedback

### Admin Features
- ✨ Create and manage events
- 👥 User management
- 📊 View all bookings
- 🔒 Protected admin routes

## Tech Stack 💻

### Frontend
- React.js
- CSS3 for styling
- React Router for navigation
- Protected Routes implementation

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT for authentication

## Installation & Setup 🚀

1. Clone the repository
```bash
git clone https://github.com/Rahul-Sahani04/Event-Management-System.git
cd Event-Management-System
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Configure environment variables
Create a `.env` file in the backend directory with:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3001
```

4. Install frontend dependencies
```bash
cd frontend
npm install
```

5. Run the application
```bash
# Start backend server (from backend directory)
npm start

# Start frontend development server (from frontend directory)
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure 📁

```
├── backend/
│   ├── controller/
│   ├── model/
│   └── index.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Event/
│       │   ├── Home/
│       │   ├── Login/
│       │   ├── Navbar/
│       │   └── UserProfile/
│       └── App.js
```

## Screenshots 📸

### Home Page
![Homepage](readme-assets/Home.png)

### Events
![Homepage](readme-assets/Events.png)

### Booked Events
![Homepage](readme-assets/Booked_Events.png)

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact 📧

Rahul Sahani - [GitHub Profile](https://github.com/Rahul-Sahani04)

Project Link: [https://github.com/Rahul-Sahani04/Event-Management-System](https://github.com/Rahul-Sahani04/Event-Management-System)

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Deployment

For local development, copy `backend/.env.example` to `backend/.env`, set `MONGODB_URI` and `JWT_SECRET`, run `npm install` and `npm run dev` inside `backend/`, then run `npm install` and `npm start` inside `frontend/`.

Deploy `backend/` to Render or Railway with `npm start` and configure `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, and optionally `PORT`. Use MongoDB Atlas for production data.

Deploy `frontend/` to Vercel with `frontend` as the root directory, `npm run build` as the build command, and `build` as the output directory. Set `REACT_APP_API_URL` to the deployed backend URL. `frontend/vercel.json` supports direct React Router navigation.

Never commit `.env` files or production credentials; only `.env.example` files belong in the repository.
