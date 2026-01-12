import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Kontextuelle Datenerfassung nach Elite UX-Prinzipien:
 * 
 * 1. NIEMALS den Flow unterbrechen
 * 2. Alter NUR bei rechtlichem Zwang (18+ Content/Produkte)
 * 3. Präferenzen NUR nach stabiler Nutzung (>5 Min)
 * 4. Maximal EINE Frage pro Session
 * 5. Immer überspringbar (außer rechtliche Pflicht)
 */

interface ContextualDataState {
  hasAgeData: boolean;
  hasPreferenceData: boolean;
  sessionMinutes: number;
  questionsAskedThisSession: number;
}

interface TriggerCondition {
  shouldAskAge: boolean;
  ageReason?: "content" | "product";
  shouldAskPreference: boolean;
}

export function useContextualDataCollection() {
  const { user } = useAuth();
  const [state, setState] = useState<ContextualDataState>({
    hasAgeData: true, // Assume true until proven otherwise
    hasPreferenceData: true,
    sessionMinutes: 0,
    questionsAskedThisSession: 0,
  });
  
  const sessionStartRef = useRef<number>(Date.now());
  const hasCheckedProfileRef = useRef(false);

  // Check existing profile data on mount
  useEffect(() => {
    if (!user || hasCheckedProfileRef.current) return;
    hasCheckedProfileRef.current = true;

    const checkProfile = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("age_at_signup, gender")
        .eq("user_id", user.id)
        .single();

      setState(prev => ({
        ...prev,
        hasAgeData: !!profile?.age_at_signup,
        hasPreferenceData: !!profile?.gender,
      }));
    };

    checkProfile();
  }, [user]);

  // Track session time
  useEffect(() => {
    const interval = setInterval(() => {
      const minutesElapsed = (Date.now() - sessionStartRef.current) / 60000;
      setState(prev => ({ ...prev, sessionMinutes: minutesElapsed }));
    }, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  /**
   * Prüft ob Alter für 18+ Content abgefragt werden muss
   * EINZIGER legitimer Trigger für Altersabfrage
   */
  const checkAgeForRestrictedContent = useCallback((): TriggerCondition => {
    // Wenn bereits Alter bekannt: nie wieder fragen
    if (state.hasAgeData) {
      return { shouldAskAge: false, shouldAskPreference: false };
    }

    // Ansonsten: JA, aber NUR wenn 18+ Content aktiv aufgerufen wird
    return { 
      shouldAskAge: true, 
      ageReason: "content",
      shouldAskPreference: false 
    };
  }, [state.hasAgeData]);

  /**
   * Prüft ob Alter für 18+ Produkt abgefragt werden muss
   * z.B. Alkohol, Tabak, etc.
   */
  const checkAgeForRestrictedProduct = useCallback((): TriggerCondition => {
    if (state.hasAgeData) {
      return { shouldAskAge: false, shouldAskPreference: false };
    }

    return { 
      shouldAskAge: true, 
      ageReason: "product",
      shouldAskPreference: false 
    };
  }, [state.hasAgeData]);

  /**
   * Prüft ob Präferenzabfrage möglich ist
   * NUR nach stabiler Nutzung (>5 Min) und max 1 Frage pro Session
   */
  const checkPreferenceTrigger = useCallback((): TriggerCondition => {
    // Schon Daten? Nie wieder fragen.
    if (state.hasPreferenceData) {
      return { shouldAskAge: false, shouldAskPreference: false };
    }

    // Schon eine Frage diese Session? Keine weitere.
    if (state.questionsAskedThisSession >= 1) {
      return { shouldAskAge: false, shouldAskPreference: false };
    }

    // Zu früh in der Session? Warten.
    if (state.sessionMinutes < 5) {
      return { shouldAskAge: false, shouldAskPreference: false };
    }

    // Alle Bedingungen erfüllt
    return { shouldAskAge: false, shouldAskPreference: true };
  }, [state]);

  /**
   * Markiert Frage als gestellt (für Session-Limit)
   */
  const recordQuestionAsked = useCallback(() => {
    setState(prev => ({
      ...prev,
      questionsAskedThisSession: prev.questionsAskedThisSession + 1,
    }));
  }, []);

  /**
   * Markiert Alter als erfasst
   */
  const recordAgeCollected = useCallback(() => {
    setState(prev => ({ ...prev, hasAgeData: true }));
    recordQuestionAsked();
  }, [recordQuestionAsked]);

  /**
   * Markiert Präferenz als erfasst
   */
  const recordPreferenceCollected = useCallback(() => {
    setState(prev => ({ ...prev, hasPreferenceData: true }));
    recordQuestionAsked();
  }, [recordQuestionAsked]);

  return {
    // State
    hasAgeData: state.hasAgeData,
    hasPreferenceData: state.hasPreferenceData,
    sessionMinutes: state.sessionMinutes,
    
    // Trigger checks
    checkAgeForRestrictedContent,
    checkAgeForRestrictedProduct,
    checkPreferenceTrigger,
    
    // Recording
    recordAgeCollected,
    recordPreferenceCollected,
    recordQuestionAsked,
  };
}
