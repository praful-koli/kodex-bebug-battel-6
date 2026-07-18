import GameHeader from '../components/GameHeader';
import GameHero from '../components/GameHero';

const GameDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <GameHeader />
      <GameHero />
    </div>
  );
};

export default GameDashboard;
