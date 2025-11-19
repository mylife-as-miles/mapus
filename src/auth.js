// Authentication utilities for Mapus
class AuthManager {
  constructor(db) {
    this.db = db;
  }

  // Simple password hashing (for demo - in production use proper hashing)
  async hashPassword(password) {
    // Simple hash for demo - in production use crypto.subtle or bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  // Generate session ID
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
  }

  // Sign up new user
  async signUp(email, password, name) {
    // Validate input
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await this.db.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const userId = this.db.generateId();
    const hashedPassword = await this.hashPassword(password);
    
    await this.db.saveUser(userId, {
      email: email,
      passwordHash: hashedPassword,
      name: name,
      createdAt: Date.now(),
      avatar: this.generateAvatar(name)
    });

    // Create session
    const sessionId = this.generateSessionId();
    await this.db.createSession(sessionId, userId);

    // Save session to localStorage
    localStorage.setItem('mapus_session', sessionId);
    localStorage.setItem('mapus_user_id', userId);

    return {
      userId: userId,
      sessionId: sessionId,
      user: {
        id: userId,
        email: email,
        name: name
      }
    };
  }

  // Sign in existing user
  async signIn(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await this.db.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const hashedPassword = await this.hashPassword(password);
    if (user.passwordHash !== hashedPassword) {
      throw new Error('Invalid email or password');
    }

    // Create session
    const sessionId = this.generateSessionId();
    await this.db.createSession(sessionId, user.id);

    // Save session to localStorage
    localStorage.setItem('mapus_session', sessionId);
    localStorage.setItem('mapus_user_id', user.id);

    return {
      userId: user.id,
      sessionId: sessionId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    };
  }

  // Get current user from session
  async getCurrentUser() {
    const sessionId = localStorage.getItem('mapus_session');
    if (!sessionId) {
      return null;
    }

    const session = await this.db.getSession(sessionId);
    if (!session) {
      localStorage.removeItem('mapus_session');
      localStorage.removeItem('mapus_user_id');
      return null;
    }

    const user = await this.db.getUser(session.userId);
    if (!user) {
      localStorage.removeItem('mapus_session');
      localStorage.removeItem('mapus_user_id');
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    };
  }

  // Sign out
  async signOut() {
    const sessionId = localStorage.getItem('mapus_session');
    if (sessionId) {
      await this.db.deleteSession(sessionId);
    }
    localStorage.removeItem('mapus_session');
    localStorage.removeItem('mapus_user_id');
  }

  // Generate avatar from name
  generateAvatar(name) {
    const colors = ['#E15F59', '#F29F51', '#F9D458', '#5EBE86', '#4890E8', '#634FF1', '#A564D2', '#222222'];
    const initial = name.charAt(0).toUpperCase();
    const colorIndex = name.charCodeAt(0) % colors.length;
    return {
      initial: initial,
      color: colors[colorIndex]
    };
  }
}

// Create global instance
let authManager = null;

function getAuthManager(db) {
  if (!authManager) {
    authManager = new AuthManager(db);
  }
  return authManager;
}

