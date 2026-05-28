# IntellMeet - MERN Stack Application

A professional MERN (MongoDB, Express, React, Node.js) application for intelligent meeting management and video conferencing.

## 📁 Project Structure

```
IntellMeet/
├── frontend/                 # React + TypeScript + Vite frontend
│   ├── src/                 # React components, routes, hooks, utilities
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.ts       # Vite configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── eslint.config.js     # ESLint configuration
│   └── .env.example         # Frontend environment template
│
├── backend/                  # Express.js backend server
│   ├── server.js            # Main Express server entry point
│   ├── package.json         # Backend dependencies
│   ├── config/              # Configuration files (database, etc.)
│   ├── controllers/         # Request handlers and business logic
│   ├── middleware/          # Custom middleware (auth, error handling, etc.)
│   ├── models/              # Database schemas (MongoDB/Mongoose)
│   ├── routes/              # API route definitions
│   ├── socket/              # Socket.io handlers for real-time features
│   ├── .env.example         # Backend environment template
│   └── .env                 # Backend environment variables (local)
│
├── README.md                # This file
└── .gitignore              # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** v16+ and **npm** (or yarn/bun)
- **MongoDB** (local or Atlas cloud)
- **Git**

### Installation

1. **Clone and Navigate**
   ```bash
   cd IntellMeet
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   ```

3. **Setup Backend**
   ```bash
   cd ../backend
   npm install
   cp .env.example .env
   ```

4. **Configure Environment Variables**
   - Edit `frontend/.env` for frontend settings
   - Edit `backend/.env` for backend settings (PORT, MongoDB URI, etc.)

## 🏃 Running the Application

### Development Mode (Recommended)

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs at: `http://localhost:5000`

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

**Backend:**
```bash
cd backend
npm start
```

## 📦 Frontend Stack

- **React** 19.x - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching & caching
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## 🛠️ Backend Stack

- **Express.js** - Web framework
- **Node.js** - Runtime
- **MongoDB** - Database (when integrated)
- **Mongoose** - ODM for MongoDB (when integrated)
- **Socket.io** - Real-time communication
- **CORS** - Cross-origin requests handling
- **Nodemon** - Development auto-reload

## 📝 Development Notes

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

**Backend:**
```bash
npm run dev          # Start with auto-reload (nodemon)
npm start            # Start production server
```

### API Endpoints

Base URL: `http://localhost:5000/api`

**Health Check:**
- `GET /api/health` - Check server status

### Adding New Features

#### Backend Route Example:
1. Create controller in `backend/controllers/`
2. Define route in `backend/routes/`
3. Import and use in `server.js`

#### Frontend Page Example:
1. Create component in `src/components/`
2. Add route in `src/routes/`
3. Use TanStack Router for navigation

## 🔐 Environment Variables

### Frontend (frontend/.env)
```
VITE_API_URL=http://localhost:5000
```

### Backend (backend/.env)
```
NODE_ENV=development
PORT=5000
HOST=localhost
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/intellmeet
JWT_SECRET=your_secret_key
```

## 🚀 Deployment

### Frontend Deployment
- Build: `npm run build`
- Deploy to Vercel, Netlify, or any static host
- Point `VITE_API_URL` to production backend URL

### Backend Deployment
- Deploy to Render, Railway, Heroku, or any Node.js hosting
- Set production environment variables
- Ensure MongoDB Atlas credentials in `.env`

## 📚 Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Vite Documentation](https://vitejs.dev)
- [TanStack Router](https://tanstack.com/router)
- [Tailwind CSS](https://tailwindcss.com)
- [Socket.io](https://socket.io)
- [MongoDB](https://www.mongodb.com)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/YourFeature`
2. Commit changes: `git commit -m 'Add YourFeature'`
3. Push to branch: `git push origin feature/YourFeature`
4. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 💡 Tips

- Keep frontend and backend development servers running simultaneously
- Use `.env.example` as template when adding new env variables
- Follow the folder structure for maintainability
- Keep components small and reusable
- Document complex business logic

---

**Happy coding! 🎉**
