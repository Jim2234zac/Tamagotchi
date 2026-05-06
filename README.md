# 🥚 Tamagotchi Web Game

A modern Tamagotchi-style virtual pet game built with React (frontend) and Node.js/Express (backend).

## 🎮 Game Features

- **Create and name your virtual pet**
- **Monitor pet stats**: Hunger, Happiness, Energy, and Cleanliness
- **Interactive actions**: Feed, Play, Sleep, and Clean
- **Real-time stat updates**: Pet stats change automatically over time
- **Responsive design**: Works on desktop and mobile devices
- **Beautiful UI**: Modern gradient design with smooth animations

## 🛠️ Technology Stack

### Frontend
- React with TypeScript
- Axios for API communication
- CSS3 with animations

### Backend
- Node.js with Express.js
- TypeScript
- CORS for cross-origin requests
- In-memory data storage

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd tamagodchi
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Running the Game

### Step 1: Start the Backend Server
```bash
cd backend
npm run dev
```
The backend server will start on `http://localhost:3001`

### Step 2: Start the Frontend Development Server
Open a new terminal and run:
```bash
cd frontend
npm start
```
The frontend will start on `http://localhost:3000`

### Step 3: Play the Game
Open your browser and navigate to `http://localhost:3000`

## 🎯 How to Play

1. **Start the Game**: Enter a name for your pet and click "Start Game"
2. **Monitor Stats**: Keep an eye on your pet's four main stats:
   - 🍔 **Hunger**: Increases over time - Feed your pet when it gets high
   - 😊 **Happiness**: Decreases over time - Play with your pet to increase it
   - ⚡ **Energy**: Decreases with activities - Let your pet sleep to restore
   - 🧼 **Cleanliness**: Decreases over time - Clean your pet regularly

3. **Take Actions**: Use the action buttons to care for your pet:
   - **🍔 Feed**: Reduces hunger, slightly increases happiness
   - **🎮 Play**: Increases happiness, reduces energy, increases hunger
   - **😴 Sleep**: Restores energy, slightly increases hunger
   - **🧼 Clean**: Improves cleanliness, slightly increases happiness

4. **Keep Your Pet Alive**: Your pet will pass away if:
   - Hunger reaches 100%
   - Energy reaches 0%
   - Cleanliness reaches 0%

## 📊 Game Mechanics

- Stats update automatically every 10 seconds
- Pet age increases with each update cycle
- Color-coded progress bars show status levels:
  - 🟢 Green (80-100%): Excellent
  - 🟡 Yellow (50-79%): Good
  - 🟠 Orange (30-49%): Warning
  - 🔴 Red (0-29%): Critical

## 🔧 Development Scripts

### Backend
```bash
npm run dev    # Start development server with auto-reload
npm run build  # Compile TypeScript to JavaScript
npm start      # Start production server
```

### Frontend
```bash
npm start      # Start development server
npm run build  # Build for production
npm test       # Run tests
```

## 🎨 Customization

The game is easily customizable:
- Modify stat change values in `backend/src/index.ts`
- Adjust update intervals in the backend
- Customize colors and animations in `frontend/src/components/TamagotchiGame.css`
- Add new actions and features by extending the API endpoints

## 🐛 Troubleshooting

**Backend won't start**: Make sure port 3001 is not in use
**Frontend can't connect to backend**: Ensure the backend server is running on port 3001
**TypeScript errors**: Run `npm install` in both frontend and backend directories

## 🚀 Future Enhancements

- [ ] Database persistence (MongoDB/PostgreSQL)
- [ ] Multiple pet support
- [ ] Pet evolution system
- [ ] Mini-games for interaction
- [ ] Sound effects and music
- [ ] Pet customization options
- [ ] Leaderboards and achievements

## 📝 License

This project is open source and available under the MIT License.
