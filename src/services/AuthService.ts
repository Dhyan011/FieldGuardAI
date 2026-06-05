/**
 * AuthService — Supervisor Authentication
 * 
 * Handles PIN-based supervisor auth with session management.
 * Sessions expire after 8 hours for security.
 */
import StorageService from './StorageService';
import { SupervisorSession } from '../models/types';
import CryptoJS from 'crypto-js';

const AUTH_SESSION_KEY = 'auth_session';
const AUTH_PINS_KEY = 'auth_supervisor_pins';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

// Default supervisor PINs (in production, these come from the cloud)
const DEFAULT_SUPERVISORS = [
  { id: 'SUP-001', name: 'Admin', pin_hash: CryptoJS.SHA256('123456').toString() },
  { id: 'SUP-002', name: 'Field Lead', pin_hash: CryptoJS.SHA256('654321').toString() },
];

class AuthService {
  constructor() {
    // Initialize default supervisors if not set
    if (!StorageService.contains(AUTH_PINS_KEY)) {
      StorageService.setJSON(AUTH_PINS_KEY, DEFAULT_SUPERVISORS);
    }
  }

  /**
   * Authenticate a supervisor with their PIN
   */
  authenticate(pin: string): { success: boolean; session?: SupervisorSession; error?: string } {
    const pinHash = CryptoJS.SHA256(pin).toString();
    const supervisors = StorageService.getJSON<any[]>(AUTH_PINS_KEY) || DEFAULT_SUPERVISORS;
    
    const match = supervisors.find(s => s.pin_hash === pinHash);
    
    if (!match) {
      return { success: false, error: 'Invalid PIN' };
    }

    const session: SupervisorSession = {
      supervisor_id: match.id,
      authenticated_at: Date.now(),
      expires_at: Date.now() + SESSION_DURATION_MS,
    };

    StorageService.setJSON(AUTH_SESSION_KEY, session);

    return { success: true, session };
  }

  /**
   * Check if there's a valid, non-expired session
   */
  getSession(): SupervisorSession | null {
    const session = StorageService.getJSON<SupervisorSession>(AUTH_SESSION_KEY);
    if (!session) return null;
    if (Date.now() > session.expires_at) {
      this.logout();
      return null;
    }
    return session;
  }

  /**
   * Check if supervisor is authenticated
   */
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Get the current supervisor ID
   */
  getSupervisorId(): string {
    const session = this.getSession();
    return session?.supervisor_id || 'UNKNOWN';
  }

  /**
   * Clear session
   */
  logout(): void {
    StorageService.delete(AUTH_SESSION_KEY);
  }
}

export const authService = new AuthService();
