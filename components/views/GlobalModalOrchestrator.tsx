'use client';

import React from 'react';
import { RulesModal } from '@/components/RulesModal';
import { ScoreboardModal } from '@/components/ScoreboardModal';
import { MatchHistoryModal } from '@/components/modals/MatchHistoryModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { OnboardingSandbox } from '@/components/tutorial/OnboardingSandbox';
import { RoomState } from '@/lib/types';
import { TutorialAction } from '@/lib/tutorial-engine';

interface GlobalModalOrchestratorProps {
  isRulesOpen: boolean;
  onCloseRules: () => void;
  isScoreboardOpen: boolean;
  onCloseScoreboard: () => void;
  isMatchHistoryOpen: boolean;
  onCloseMatchHistory: () => void;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
  activeRoomState: RoomState | null;
  myPlayerId: string;
  tutorialState: any;
  tutorialDispatch: React.Dispatch<TutorialAction>;
}

export const GlobalModalOrchestrator: React.FC<GlobalModalOrchestratorProps> = ({
  isRulesOpen,
  onCloseRules,
  isScoreboardOpen,
  onCloseScoreboard,
  isMatchHistoryOpen,
  onCloseMatchHistory,
  isSettingsOpen,
  onCloseSettings,
  activeRoomState,
  myPlayerId,
  tutorialState,
  tutorialDispatch,
}) => {
  return (
    <>
      <RulesModal
        isOpen={isRulesOpen}
        onClose={onCloseRules}
        onOpenTutorial={() => tutorialDispatch({ type: 'OPEN_TUTORIAL' })}
      />

      {activeRoomState && (
        <ScoreboardModal
          isOpen={isScoreboardOpen}
          onClose={onCloseScoreboard}
          room={activeRoomState}
          myPlayerId={myPlayerId}
        />
      )}

      <OnboardingSandbox
        engineState={tutorialState}
        dispatch={tutorialDispatch}
        onClose={() => tutorialDispatch({ type: 'CLOSE_TUTORIAL' })}
      />

      <MatchHistoryModal
        isOpen={isMatchHistoryOpen}
        onClose={onCloseMatchHistory}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
      />
    </>
  );
};
