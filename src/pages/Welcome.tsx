import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FirstTimeTutorial } from '@/components/welcome/FirstTimeTutorial';

const FIRST_VISIT_KEY = 'ryl_first_visit_completed';

export default function Welcome() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(FIRST_VISIT_KEY);
    
    if (hasSeenTutorial) {
      // Already seen tutorial, go to landing
      navigate('/', { replace: true });
    } else {
      // First time visitor, show tutorial
      setShowTutorial(true);
    }
    setIsChecking(false);
  }, [navigate]);

  const handleComplete = () => {
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    navigate('/auth');
  };

  if (isChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!showTutorial) {
    return null;
  }

  return <FirstTimeTutorial onComplete={handleComplete} />;
}
