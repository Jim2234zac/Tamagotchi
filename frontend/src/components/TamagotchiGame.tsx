import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TamagotchiGame.css';
import './PixelArt.css';
import './PixelUI.css';
import SoundManager from './SoundManager';

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

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
  animalType?: string;
}

interface TamagotchiGameProps {
  user: User;
  onLogout: () => void;
}

const TamagotchiGame: React.FC<TamagotchiGameProps> = ({ user, onLogout }) => {
  const [tamagotchi, setTamagotchi] = useState<Tamagotchi | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [name, setName] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState('cat');
  const [soundManager] = useState(() => new SoundManager());
  const [currentAction, setCurrentAction] = useState('');
  const [userTamagotchis, setUserTamagotchis] = useState<Tamagotchi[]>([]);
  const [selectedTamagotchiId, setSelectedTamagotchiId] = useState<string | null>(null);

  useEffect(() => {
    if (tamagotchi && tamagotchi.isAlive) {
      const interval = setInterval(() => {
        fetchTamagotchi();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [tamagotchi?.id]);

  // Check if pet died and handle transition
  useEffect(() => {
    if (tamagotchi && !tamagotchi.isAlive) {
      soundManager.playGameOverSound();
      // After 3 seconds, transition back to pet selection
      setTimeout(() => {
        setGameStarted(false);
        setTamagotchi(null);
        setSelectedTamagotchiId(null);
        setName('');
        setSelectedAnimal('cat');
      }, 3000);
    }
  }, [tamagotchi?.isAlive]);

  useEffect(() => {
    if (gameStarted) {
      soundManager.resumeAudioContext();
      soundManager.playBackgroundMusic();
    }
    return () => {
      soundManager.stopBackgroundMusic();
    };
  }, [gameStarted, soundManager]);

  useEffect(() => {
    // Fetch user's tamagotchis on component mount
    fetchUserTamagotchis();
  }, [user.id]);

  const fetchUserTamagotchis = async () => {
    try {
      const response = await axios.get<Tamagotchi[]>('http://localhost:3001/api/tamagotchis', {
        withCredentials: true
      });
      setUserTamagotchis(response.data);
    } catch (error) {
      console.error('Error fetching user tamagotchis:', error);
    }
  };

  const fetchTamagotchi = async () => {
    if (!selectedTamagotchiId) return;
    try {
      const response = await axios.get<Tamagotchi>(`http://localhost:3001/api/tamagotchi/${selectedTamagotchiId}`, {
        withCredentials: true
      });
      setTamagotchi(response.data);
    } catch (error) {
      console.error('Error fetching tamagotchi:', error);
    }
  };

  const createTamagotchi = async () => {
    try {
      const response = await axios.post<Tamagotchi>('http://localhost:3001/api/tamagotchi', { 
        name,
        animalType: selectedAnimal 
      }, {
        withCredentials: true
      });
      setTamagotchi(response.data);
      setGameStarted(true);
      setSelectedTamagotchiId(response.data.id);
      soundManager.playHappySound();
      // Refresh user's tamagotchis list
      await fetchUserTamagotchis();
    } catch (error) {
      console.error('Error creating tamagotchi:', error);
    }
  };

  const performAction = async (action: string) => {
    if (!tamagotchi?.id) return;
    try {
      setCurrentAction(action);
      
      // Play sound effects
      switch (action) {
        case 'feed':
          soundManager.playEatSound();
          break;
        case 'play':
          soundManager.playPlaySound();
          break;
        case 'sleep':
          soundManager.playSleepSound();
          break;
        case 'clean':
          soundManager.playCleanSound();
          break;
      }
      
      const response = await axios.put<Tamagotchi>(`http://localhost:3001/api/tamagotchi/${tamagotchi.id}`, { action }, {
        withCredentials: true
      });
      setTamagotchi(response.data);
      
      setTimeout(() => setCurrentAction(''), 1000);
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const getStatusClass = (value: number) => {
    if (value >= 80) return '';
    if (value >= 50) return 'warning';
    return 'danger';
  };

  const getPixelCharacter = () => {
    const animalType = tamagotchi?.animalType || 'cat';
    if (!tamagotchi?.isAlive) return `${animalType}-dead`;
    if (tamagotchi.happiness >= 80) return `${animalType}-happy`;
    if (tamagotchi.happiness >= 50) return `${animalType}-happy`;
    if (tamagotchi.happiness >= 30) return `${animalType}-sad`;
    return `${animalType}-sad`;
  };

  const getAnimationClass = () => {
    if (currentAction === 'feed') return 'eating';
    if (currentAction === 'play') return 'playing';
    if (currentAction === 'sleep') return 'sleeping';
    if (tamagotchi && tamagotchi.happiness >= 50) return 'happy';
    return '';
  };

  const selectTamagotchi = (tamagotchiId: string) => {
    setSelectedTamagotchiId(tamagotchiId);
    const selected = userTamagotchis.find(t => t.id === tamagotchiId);
    if (selected) {
      setTamagotchi(selected);
      setGameStarted(true);
      setName(selected.name);
      setSelectedAnimal(selected.animalType || 'cat');
    }
  };

  if (!gameStarted) {
    return (
      <div className="pixel-container game-container">
        <div className="pixel-screen">
          <div className="user-info">
            <h3>👤 USER: {user.username}</h3>
            <button className="auth-btn logout-btn" onClick={onLogout}>
              🚪 LOGOUT
            </button>
          </div>
          
          <h1 className="pixel-title">🎮 PIXEL PET 🎮</h1>
          
          {userTamagotchis.length > 0 && (
            <div className="tamagotchi-selection">
              <h3 className="pixel-subtitle">SELECT YOUR PET:</h3>
              <div className="animal-options">
                {userTamagotchis.map(tamagotchi => (
                  <button 
                    key={tamagotchi.id}
                    className={`pixel-btn ${selectedTamagotchiId === tamagotchi.id ? 'selected' : ''}`}
                    onClick={() => selectTamagotchi(tamagotchi.id)}
                  >
                    {tamagotchi.animalType === 'cat' && '🐱'}
                    {tamagotchi.animalType === 'dog' && '🐶'}
                    {tamagotchi.animalType === 'bird' && '🐦'}
                    {tamagotchi.animalType === 'bunny' && '🐰'}
                    {' ' + tamagotchi.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="animal-selection">
            <h3 className="pixel-subtitle">CREATE NEW PET:</h3>
            <div className="animal-options">
              <button 
                className={`pixel-btn ${selectedAnimal === 'cat' ? 'selected' : ''}`}
                onClick={() => setSelectedAnimal('cat')}
              >
                🐱 Cat
              </button>
              <button 
                className={`pixel-btn ${selectedAnimal === 'dog' ? 'selected' : ''}`}
                onClick={() => setSelectedAnimal('dog')}
              >
                🐶 Dog
              </button>
              <button 
                className={`pixel-btn ${selectedAnimal === 'bird' ? 'selected' : ''}`}
                onClick={() => setSelectedAnimal('bird')}
              >
                🐦 Bird
              </button>
              <button 
                className={`pixel-btn ${selectedAnimal === 'bunny' ? 'selected' : ''}`}
                onClick={() => setSelectedAnimal('bunny')}
              >
                🐰 Bunny
              </button>
            </div>
          </div>
          
          <div className="name-input">
            <input
              type="text"
              className="pixel-input"
              placeholder="ENTER PET NAME"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              maxLength={20}
            />
            <button 
              className="pixel-btn" 
              onClick={createTamagotchi} 
              disabled={!name.trim()}
            >
              CREATE PET
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tamagotchi) {
    return <div className="pixel-container game-container"><div className="pixel-screen"><div className="pixel-title">LOADING...</div></div></div>;
  }

  return (
    <div className="pixel-container game-container">
      <div className="pixel-screen">
        <div className="user-info">
          <h3>👤 USER: {user.username}</h3>
          <button className="auth-btn logout-btn" onClick={onLogout}>
            🚪 LOGOUT
          </button>
        </div>
        
        <h1 className="pixel-title">🎮 PIXEL PET 🎮</h1>
        
        <div className="pixel-character-container">
          <div className="pixel-clouds">
            <div className="pixel-cloud pixel-cloud1"></div>
          </div>
          <div className="pixel-stars">
            <div className="pixel-star"></div>
            <div className="pixel-star"></div>
            <div className="pixel-star"></div>
            <div className="pixel-star"></div>
            <div className="pixel-star"></div>
          </div>
          <div className={`pixel-character ${getPixelCharacter()} ${getAnimationClass()}`}></div>
        </div>
        
        <div className="pet-info">
          <h2 className="pixel-subtitle">{tamagotchi.name}</h2>
          <p className="pixel-subtitle">AGE: {tamagotchi.age} CYCLES</p>
          {!tamagotchi.isAlive && <div className="game-over-screen">GAME OVER! YOUR PET HAS PASSED AWAY<br/>RETURNING TO PET SELECTION...</div>}
        </div>

        <div className="pixel-stats">
          <div className="pixel-stat-item">
            <span className="pixel-stat-label">🍔 HUNGER</span>
            <div className="pixel-progress">
              <div 
                className={`pixel-progress-fill ${getStatusClass(100 - tamagotchi.hunger)}`}
                style={{ width: `${100 - tamagotchi.hunger}%` }}
              />
            </div>
            <span className="pixel-stat-value">{100 - tamagotchi.hunger}%</span>
          </div>

          <div className="pixel-stat-item">
            <span className="pixel-stat-label">😊 HAPPINESS</span>
            <div className="pixel-progress">
              <div 
                className={`pixel-progress-fill ${getStatusClass(tamagotchi.happiness)}`}
                style={{ width: `${tamagotchi.happiness}%` }}
              />
            </div>
            <span className="pixel-stat-value">{tamagotchi.happiness}%</span>
          </div>

          <div className="pixel-stat-item">
            <span className="pixel-stat-label">⚡ ENERGY</span>
            <div className="pixel-progress">
              <div 
                className={`pixel-progress-fill ${getStatusClass(tamagotchi.energy)}`}
                style={{ width: `${tamagotchi.energy}%` }}
              />
            </div>
            <span className="pixel-stat-value">{tamagotchi.energy}%</span>
          </div>

          <div className="pixel-stat-item">
            <span className="pixel-stat-label">🧼 CLEANLINESS</span>
            <div className="pixel-progress">
              <div 
                className={`pixel-progress-fill ${getStatusClass(tamagotchi.cleanliness)}`}
                style={{ width: `${tamagotchi.cleanliness}%` }}
              />
            </div>
            <span className="pixel-stat-value">{tamagotchi.cleanliness}%</span>
          </div>
        </div>

        <div className="actions-container">
          <button 
            onClick={() => performAction('feed')} 
            disabled={!tamagotchi.isAlive}
            className="pixel-btn feed"
          >
            🍔 FEED
          </button>
          <button 
            onClick={() => performAction('play')} 
            disabled={!tamagotchi.isAlive}
            className="pixel-btn play"
          >
            🎮 PLAY
          </button>
          <button 
            onClick={() => performAction('sleep')} 
            disabled={!tamagotchi.isAlive}
            className="pixel-btn sleep"
          >
            😴 SLEEP
          </button>
          <button 
            onClick={() => performAction('clean')} 
            disabled={!tamagotchi.isAlive}
            className="pixel-btn clean"
          >
            🧼 CLEAN
          </button>
        </div>
      </div>
    </div>
  );
};

export default TamagotchiGame;
