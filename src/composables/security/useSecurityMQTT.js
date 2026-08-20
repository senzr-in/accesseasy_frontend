/**
 * useSecurityMQTT.js  –  Unified wrapper delegating to singleton useMQTT.
 */
import { useMQTT } from '@/composables/useMQTT';

export function useSecurityMQTT() {
  return useMQTT();
}

