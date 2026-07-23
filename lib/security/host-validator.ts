import { 
  RoomState, 
  Player, 
  Card, 
  Suit, 
  GameStatus, 
  RoundNumber, 
  TrickCard 
} from '../types';

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Host Authority Validator
 * Checks if caller matches host ID or player isHost flag
 */
export function validateHostAuthority(room: RoomState, callerId: string): boolean {
  if (!room || !callerId) return false;
  return room.hostId === callerId || room.players.some(p => p.id === callerId && p.isHost);
}

/**
 * Validates mutation privileges for state fields.
 * Restricted host fields: 'status', 'dealerIndex', 'scores', 'currentRound', 'totalScores', 'lastCompletedTrick'
 */
export function validateStateMutation(
  room: RoomState,
  callerId: string,
  field: 'status' | 'dealerIndex' | 'scores' | 'currentRound' | 'totalScores' | 'lastCompletedTrick' | 'currentTrick' | 'hands'
): ValidationResult {
  const isHost = validateHostAuthority(room, callerId);
  const hostOnlyFields = ['status', 'dealerIndex', 'scores', 'currentRound', 'totalScores', 'lastCompletedTrick'];

  if (hostOnlyFields.includes(field) && !isHost) {
    return {
      isValid: false,
      reason: `Unauthorized mutation attempt on host-only state field '${field}' by user '${callerId}'`
    };
  }

  return { isValid: true };
}

/**
 * Validates standard card schema.
 * Must have suit enum ('HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES') and value (2-14).
 */
export function validateCardSchema(card: unknown): card is Card {
  if (!card || typeof card !== 'object') return false;
  const c = card as Record<string, unknown>;

  const validSuits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
  const isValidSuit = typeof c.suit === 'string' && validSuits.includes(c.suit as Suit);
  const isValidValue = typeof c.value === 'number' && Number.isInteger(c.value) && c.value >= 2 && c.value <= 14;

  return isValidSuit && isValidValue;
}

/**
 * Validates turn authority for a non-host player making a move.
 * Enforces that non-host player can only play during their assigned turnSeatIndex.
 */
export function validateTurnAuthority(room: RoomState, playerId: string): ValidationResult {
  if (!room) return { isValid: false, reason: 'Room state missing' };

  const isHost = validateHostAuthority(room, playerId);
  if (isHost) return { isValid: true }; // Host retains management overrides

  const player = room.players.find(p => p.id === playerId);
  if (!player) {
    return { isValid: false, reason: `Player '${playerId}' is not in room` };
  }

  if (player.seatIndex !== room.turnSeatIndex) {
    return {
      isValid: false,
      reason: `Not player's turn. Active seat: ${room.turnSeatIndex}, Player seat: ${player.seatIndex}`
    };
  }

  return { isValid: true };
}

/**
 * Enforces isolated hand subcollection access rules.
 * Path: /rooms/$roomId/hands/$playerId/$cardIndex
 * Read rule: $playerId === auth.uid
 */
export function validateHandAccess(
  callerId: string, 
  targetPlayerId: string, 
  isHost: boolean = false
): ValidationResult {
  if (callerId === targetPlayerId || isHost) {
    return { isValid: true };
  }

  return {
    isValid: false,
    reason: `Access Denied: Player '${callerId}' cannot inspect or mutate hand of opponent '${targetPlayerId}'`
  };
}

/**
 * Validates legal GameStatus state transitions.
 */
export function validateHostStateTransition(
  currentStatus: GameStatus,
  nextStatus: GameStatus,
  isHost: boolean
): ValidationResult {
  if (!isHost) {
    return { isValid: false, reason: 'Only host can change game status' };
  }

  const validTransitions: Record<GameStatus, GameStatus[]> = {
    LOBBY_WAITING: ['DEAL_HANDS', 'PLAYER_TURN'],
    DEAL_HANDS: ['PLAYER_TURN'],
    PLAYER_TURN: ['TRICK_EVALUATION', 'ROUND_END', 'GAME_OVER'],
    TRICK_EVALUATION: ['PLAYER_TURN', 'ROUND_END', 'GAME_OVER'],
    ROUND_END: ['DEAL_HANDS', 'PLAYER_TURN', 'GAME_OVER'],
    GAME_OVER: ['LOBBY_WAITING', 'DEAL_HANDS', 'PLAYER_TURN']
  };

  const allowedNext = validTransitions[currentStatus] || [];
  if (!allowedNext.includes(nextStatus)) {
    return {
      isValid: false,
      reason: `Invalid status transition from '${currentStatus}' to '${nextStatus}'`
    };
  }

  return { isValid: true };
}

/**
 * Validates move payload at /rooms/$roomId/currentTrick/$playerId
 */
export function validateMovePayload(
  room: RoomState, 
  playerId: string, 
  payload: unknown
): ValidationResult {
  // Turn authority check
  const turnCheck = validateTurnAuthority(room, playerId);
  if (!turnCheck.isValid) return turnCheck;

  // Schema check
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, reason: 'Move payload must be an object' };
  }

  const p = payload as Record<string, unknown>;
  const cardObj = p.card ? p.card : p;

  if (!validateCardSchema(cardObj)) {
    return {
      isValid: false,
      reason: 'Move payload does not match standard card schema (suit: HEARTS|DIAMONDS|CLUBS|SPADES, value: 2-14)'
    };
  }

  return { isValid: true };
}

/**
 * Validates scores array integrity for 4 rounds per player.
 */
export function validateScoresIntegrity(
  scores: Record<string, number[]>,
  currentRound: RoundNumber
): boolean {
  if (!scores || typeof scores !== 'object') return false;

  for (const pid of Object.keys(scores)) {
    const roundScores = scores[pid];
    if (!Array.isArray(roundScores) || roundScores.length !== 4) return false;
    for (const score of roundScores) {
      if (typeof score !== 'number' || isNaN(score)) return false;
    }
  }

  return true;
}
