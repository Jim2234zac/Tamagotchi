import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TamagotchiGame.css';

interface Tamagotchi {
  id: string;
  name: string;
  hunger: number;
  happiness: number;
  energy: number;
  cleanliness: number;
  age: number;
  isAlive: boolean;
  lastUpdate: string;
}

const TamagotchiGame: React.FC = () => {
  const [tamagotchi, setTamagotchi] = useState<Tamagotchi | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (tamagotchi && tamagotchi.isAlive) {
      const interval = setInterval(() => {
        fetchTamagotchi();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [tamagotchi?.id]);

  const createTamagotchi = async () => {
    try {
      const response = await axios.post<Tamagotchi>('http://localhost:3001/api/tamagotchi', { name });
      setTamagotchi(response.data);
      setGameStarted(true);
    } catch (error) {
      console.error('Error creating tamagotchi:', error);
    }
  };

  const fetchTamagotchi = async () => {
    if (!tamagotchi?.id) return;
    try {
      const response = await axios.get<Tamagotchi>(`http://localhost:3001/api/tamagotchi/${tamagotchi.id}`);
      setTamagotchi(response.data);
    } catch (error) {
      console.error('Error fetching tamagotchi:', error);
    }
  };

  const performAction = async (action: string) => {
    if (!tamagotchi?.id) return;
    try {
      const response = await axios.put<Tamagotchi>(`http://localhost:3001/api/tamagotchi/${tamagotchi.id}`, { action });
      setTamagotchi(response.data);
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const getStatusColor = (value: number) => {
    if (value >= 80) return '#4CAF50';
    if (value >= 50) return '#FFC107';
    if (value >= 30) return '#FF9800';
    return '#F44336';
  };

  const getMood = () => {
    if (!tamagotchi?.isAlive) return '💀';
    if (tamagotchi.happiness >= 80) return '😊';
    if (tamagotchi.happiness >= 50) return '😐';
    if (tamagotchi.happiness >= 30) return '😟';
    return '😢';
  };

  if (!gameStarted) {
    return (
      <div className="game-container">
        <div className="start-screen">
          <h1>🥚 Tamagotchi Game 🥚</h1>
          <div className="name-input">
            <input
              type="text"
              placeholder="Enter your pet's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
            <button onClick={createTamagotchi} disabled={!name.trim()}>
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tamagotchi) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="game-container">
      <div className="pet-display">
        <div className="pet-avatar">
          <div className="mood">{getMood()}</div>
          <div className="pet-info">
            <h2>{tamagotchi.name}</h2>
            <p>Age: {tamagotchi.age} cycles</p>
            {!tamagotchi.isAlive && <p className="game-over">Game Over! Your pet has passed away.</p>}
          </div>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-item">
          <span>🍔 Hunger</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${100 - tamagotchi.hunger}%`,
                backgroundColor: getStatusColor(100 - tamagotchi.hunger)
              }}
            />
          </div>
          <span>{100 - tamagotchi.hunger}%</span>
        </div>

        <div className="stat-item">
          <span>😊 Happiness</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${tamagotchi.happiness}%`,
                backgroundColor: getStatusColor(tamagotchi.happiness)
              }}
            />
          </div>
          <span>{tamagotchi.happiness}%</span>
        </div>

        <div className="stat-item">
          <span>⚡ Energy</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${tamagotchi.energy}%`,
                backgroundColor: getStatusColor(tamagotchi.energy)
              }}
            />
          </div>
          <span>{tamagotchi.energy}%</span>
        </div>

        <div className="stat-item">
          <span>🧼 Cleanliness</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${tamagotchi.cleanliness}%`,
                backgroundColor: getStatusColor(tamagotchi.cleanliness)
              }}
            />
          </div>
          <span>{tamagotchi.cleanliness}%</span>
        </div>
      </div>

      <div className="actions-container">
        <button 
          onClick={() => performAction('feed')} 
          disabled={!tamagotchi.isAlive}
          className="action-btn feed"
        >
          🍔 Feed
        </button>
        <button 
          onClick={() => performAction('play')} 
          disabled={!tamagotchi.isAlive}
          className="action-btn play"
        >
          🎮 Play
        </button>
        <button 
          onClick={() => performAction('sleep')} 
          disabled={!tamagotchi.isAlive}
          className="action-btn sleep"
        >
          😴 Sleep
        </button>
        <button 
          onClick={() => performAction('clean')} 
          disabled={!tamagotchi.isAlive}
          className="action-btn clean"
        >
          🧼 Clean
        </button>
      </div>
    </div>
  );
};

export default TamagotchiGame;
