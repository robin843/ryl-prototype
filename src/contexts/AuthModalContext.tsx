import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Types of actions that require authentication
export type AuthReason = 
  | { type: 'purchase'; productId: string; episodeId?: string; hotspotId?: string }
  | { type: 'comment'; episodeId: string }
  | { type: 'save'; productId: string; episodeId?: string }
  | { type: 'follow'; creatorId: string }
  | { type: 'like'; episodeId: string }
  | { type: 'series-continue'; seriesId: string }
  | { type: 'flow-limit' }
  | { type: 'generic'; message?: string };

interface AuthModalContextType {
  isOpen: boolean;
  reason: AuthReason | null;
  showAuthModal: (reason: AuthReason) => void;
  hideAuthModal: () => void;
  // For executing pending action after successful auth
  pendingAction: AuthReason | null;
  clearPendingAction: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<AuthReason | null>(null);
  const [pendingAction, setPendingAction] = useState<AuthReason | null>(null);

  const showAuthModal = useCallback((authReason: AuthReason) => {
    // If user is already logged in, don't show modal
    if (user) {
      console.log('[AuthModal] User already logged in, skipping modal');
      return;
    }
    
    setReason(authReason);
    setPendingAction(authReason);
    setIsOpen(true);
  }, [user]);

  const hideAuthModal = useCallback(() => {
    setIsOpen(false);
    // Keep reason/pendingAction for a moment to allow animations
    setTimeout(() => {
      setReason(null);
    }, 300);
  }, []);

  const clearPendingAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  // When user logs in, close modal and keep pending action for execution
  useEffect(() => {
    if (user && isOpen) {
      hideAuthModal();
      // Pending action stays set so caller can execute it
    }
  }, [user, isOpen, hideAuthModal]);

  return (
    <AuthModalContext.Provider value={{
      isOpen,
      reason,
      showAuthModal,
      hideAuthModal,
      pendingAction,
      clearPendingAction,
    }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
}

// Helper hook for checking auth before action
export function useRequireAuth() {
  const { user } = useAuth();
  const { showAuthModal, pendingAction, clearPendingAction } = useAuthModal();

  const requireAuth = useCallback((reason: AuthReason): boolean => {
    if (user) {
      return true; // User is logged in, proceed
    }
    showAuthModal(reason);
    return false; // User not logged in, modal shown
  }, [user, showAuthModal]);

  return { 
    isAuthenticated: !!user, 
    requireAuth,
    pendingAction,
    clearPendingAction,
  };
}
