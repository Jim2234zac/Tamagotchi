import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

interface Tamagotchi {
  id: string;
  name: string;
  hunger: number;
  happiness: number;
  energy: number;
  cleanliness: number;
  age: number;
  isAlive: boolean;
  lastUpdate: Date;
}

let tamagotchis: Tamagotchi[] = [];

app.get('/api/tamagotchi/:id', (req, res) => {
  const tamagotchi = tamagotchis.find(t => t.id === req.params.id);
  if (!tamagotchi) {
    return res.status(404).json({ error: 'Tamagotchi not found' });
  }
  res.json(tamagotchi);
});

app.post('/api/tamagotchi', (req, res) => {
  const { name } = req.body;
  const newTamagotchi: Tamagotchi = {
    id: Date.now().toString(),
    name: name || 'Tamagotchi',
    hunger: 50,
    happiness: 50,
    energy: 50,
    cleanliness: 50,
    age: 0,
    isAlive: true,
    lastUpdate: new Date()
  };
  tamagotchis.push(newTamagotchi);
  res.json(newTamagotchi);
});

app.put('/api/tamagotchi/:id', (req, res) => {
  const tamagotchi = tamagotchis.find(t => t.id === req.params.id);
  if (!tamagotchi) {
    return res.status(404).json({ error: 'Tamagotchi not found' });
  }
  
  const { action } = req.body;
  
  switch (action) {
    case 'feed':
      tamagotchi.hunger = Math.max(0, tamagotchi.hunger - 20);
      tamagotchi.happiness = Math.min(100, tamagotchi.happiness + 10);
      break;
    case 'play':
      tamagotchi.happiness = Math.min(100, tamagotchi.happiness + 20);
      tamagotchi.energy = Math.max(0, tamagotchi.energy - 15);
      tamagotchi.hunger = Math.min(100, tamagotchi.hunger + 10);
      break;
    case 'sleep':
      tamagotchi.energy = Math.min(100, tamagotchi.energy + 30);
      tamagotchi.hunger = Math.min(100, tamagotchi.hunger + 5);
      break;
    case 'clean':
      tamagotchi.cleanliness = Math.min(100, tamagotchi.cleanliness + 25);
      tamagotchi.happiness = Math.min(100, tamagotchi.happiness + 5);
      break;
  }
  
  tamagotchi.lastUpdate = new Date();
  checkTamagotchiStatus(tamagotchi);
  res.json(tamagotchi);
});

function checkTamagotchiStatus(tamagotchi: Tamagotchi) {
  if (tamagotchi.hunger >= 100 || tamagotchi.energy <= 0 || tamagotchi.cleanliness <= 0) {
    tamagotchi.isAlive = false;
  }
}

setInterval(() => {
  tamagotchis.forEach(tamagotchi => {
    if (tamagotchi.isAlive) {
      tamagotchi.hunger = Math.min(100, tamagotchi.hunger + 2);
      tamagotchi.happiness = Math.max(0, tamagotchi.happiness - 1);
      tamagotchi.energy = Math.max(0, tamagotchi.energy - 1);
      tamagotchi.cleanliness = Math.max(0, tamagotchi.cleanliness - 1);
      tamagotchi.age += 1;
      checkTamagotchiStatus(tamagotchi);
    }
  });
}, 10000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
