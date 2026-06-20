/**
 * HeuristicAI — Services barrel export
 */

export { supabase, signInWithEmail, signUpWithEmail, signOut, getCurrentUser, getCurrentSession } from './supabase';
export { pushSync, pullSync, startSyncListener, stopSyncListener } from './sync';
export { speakCue, speakCueSequence, stopAllCues, isSpeaking, FormCues } from './audio-cues';
export { poseDetectionService, calculateAngle, calculateDistance, LandmarkIndex } from './pose-detection';
export { evaluateSquatForm } from './form-rules/squat';
export { evaluatePushupForm } from './form-rules/pushup';
export { evaluateDeadliftForm } from './form-rules/deadlift';
export { evaluateLungeForm } from './form-rules/lunge';
export { evaluatePlankForm } from './form-rules/plank';
