import { Card, TrickCard } from './types';
import { TUTORIAL_STEP_DEFINITIONS, TutorialStepDefinition } from './tutorial/tutorial-step-defs';

export { TUTORIAL_STEP_DEFINITIONS };
export type { TutorialStepDefinition };

export interface TutorialStepState {
  stepIndex: number;
  phase: 'PROMPT' | 'CARD_PLAYED' | 'EVALUATING' | 'STEP_COMPLETED';
  currentTrick: TrickCard[];
  playerHand: Card[];
  selectedCardId: string | null;
  playedCard: Card | null;
  lastError: string | null;
  trickWinnerPlayerId: string | null;
  trickWinnerSeat: number | null;
  pointsAwarded: number;
  anomalyDetected: boolean;
}

export interface TutorialEngineState {
  isOpen: boolean;
  activeStepIndex: number;
  stepState: TutorialStepState;
  completedSteps: boolean[];
  isFinished: boolean;
  history: TutorialStepState[];
}

export function createInitialStepState(stepIndex: number): TutorialStepState {
  const def = TUTORIAL_STEP_DEFINITIONS[stepIndex] || TUTORIAL_STEP_DEFINITIONS[0];
  return {
    stepIndex,
    phase: 'PROMPT',
    currentTrick: [...def.botCardsPlayedBeforePlayer],
    playerHand: [...def.playerHand],
    selectedCardId: null,
    playedCard: null,
    lastError: null,
    trickWinnerPlayerId: null,
    trickWinnerSeat: null,
    pointsAwarded: 0,
    anomalyDetected: false,
  };
}

export function createInitialTutorialEngineState(): TutorialEngineState {
  const firstStep = createInitialStepState(0);
  return {
    isOpen: false,
    activeStepIndex: 0,
    stepState: firstStep,
    completedSteps: [false, false, false, false],
    isFinished: false,
    history: [firstStep],
  };
}

export type TutorialAction =
  | { type: 'OPEN_TUTORIAL' }
  | { type: 'CLOSE_TUTORIAL' }
  | { type: 'PLAY_CARD'; cardId: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; stepIndex: number }
  | { type: 'RESET_STEP' }
  | { type: 'TRIGGER_ANOMALY' }
  | { type: 'COMPLETE_TUTORIAL' };

export function tutorialEngineReducer(
  state: TutorialEngineState,
  action: TutorialAction
): TutorialEngineState {
  const currentDef = TUTORIAL_STEP_DEFINITIONS[state.activeStepIndex];

  switch (action.type) {
    case 'OPEN_TUTORIAL': {
      const step0 = createInitialStepState(0);
      return {
        ...state,
        isOpen: true,
        activeStepIndex: 0,
        stepState: step0,
        completedSteps: [false, false, false, false],
        isFinished: false,
        history: [step0],
      };
    }

    case 'CLOSE_TUTORIAL': {
      return {
        ...state,
        isOpen: false,
      };
    }

    case 'RESET_STEP': {
      const resetStepState = createInitialStepState(state.activeStepIndex);
      return {
        ...state,
        stepState: resetStepState,
        history: [...state.history, resetStepState],
      };
    }

    case 'TRIGGER_ANOMALY': {
      const recoveredStepState = {
        ...createInitialStepState(state.activeStepIndex),
        lastError: 'State anomaly detected! Auto-reset step to t0 successfully.',
        anomalyDetected: true,
      };
      return {
        ...state,
        stepState: recoveredStepState,
        history: [...state.history, recoveredStepState],
      };
    }

    case 'PLAY_CARD': {
      if (!currentDef || state.stepState.phase !== 'PROMPT') {
        return state;
      }

      const playedCard = state.stepState.playerHand.find((c) => c.id === action.cardId);
      if (!playedCard) {
        return state;
      }

      if (action.cardId !== currentDef.targetCardId) {
        const feedback =
          currentDef.wrongCardFeedback[action.cardId] ||
          'Illegal move for this step! Follow the highlighted guidance card.';
        const nextStepState: TutorialStepState = {
          ...state.stepState,
          lastError: feedback,
        };
        return {
          ...state,
          stepState: nextStepState,
        };
      }

      const playerTrickCard: TrickCard = {
        playerId: 'player_you',
        seatIndex: 0,
        card: playedCard,
      };

      const updatedTrick = [
        ...state.stepState.currentTrick,
        playerTrickCard,
        ...currentDef.botCardsPlayedAfterPlayer,
      ];

      const remainingHand = state.stepState.playerHand.filter((c) => c.id !== action.cardId);

      const winningPlayer = currentDef.players.find((p) => p.seatIndex === currentDef.trickWinnerSeat);

      const completedStepState: TutorialStepState = {
        ...state.stepState,
        phase: 'STEP_COMPLETED',
        currentTrick: updatedTrick,
        playerHand: remainingHand,
        selectedCardId: action.cardId,
        playedCard: playedCard,
        lastError: null,
        trickWinnerSeat: currentDef.trickWinnerSeat,
        trickWinnerPlayerId: winningPlayer?.id || 'bot_1',
        pointsAwarded: currentDef.pointsExchanged,
      };

      const newCompleted = [...state.completedSteps];
      newCompleted[state.activeStepIndex] = true;

      return {
        ...state,
        completedSteps: newCompleted,
        stepState: completedStepState,
        history: [...state.history, completedStepState],
      };
    }

    case 'NEXT_STEP': {
      const nextIdx = state.activeStepIndex + 1;
      if (nextIdx >= TUTORIAL_STEP_DEFINITIONS.length) {
        return {
          ...state,
          isFinished: true,
        };
      }
      const nextStepState = createInitialStepState(nextIdx);
      return {
        ...state,
        activeStepIndex: nextIdx,
        stepState: nextStepState,
        history: [...state.history, nextStepState],
      };
    }

    case 'PREV_STEP': {
      const prevIdx = Math.max(0, state.activeStepIndex - 1);
      const prevStepState = createInitialStepState(prevIdx);
      return {
        ...state,
        activeStepIndex: prevIdx,
        stepState: prevStepState,
        history: [...state.history, prevStepState],
      };
    }

    case 'GO_TO_STEP': {
      const targetIdx = Math.min(Math.max(0, action.stepIndex), TUTORIAL_STEP_DEFINITIONS.length - 1);
      const targetStepState = createInitialStepState(targetIdx);
      return {
        ...state,
        activeStepIndex: targetIdx,
        stepState: targetStepState,
        history: [...state.history, targetStepState],
      };
    }

    case 'COMPLETE_TUTORIAL': {
      if (typeof window !== 'undefined') {
        localStorage.setItem('fun_tutorial_completed', 'true');
      }
      return {
        ...state,
        isOpen: false,
        isFinished: true,
      };
    }

    default:
      return state;
  }
}
