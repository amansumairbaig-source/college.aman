import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext(null);

const DEMO_USERS = {
  student: {
    id: 'usr_student_1',
    name: 'Alex Johnson',
    email: 'student@college.edu',
    role: 'student',
    rollNo: 'CS-2024-042',
    department: 'Computer Science',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  admin: {
    id: 'usr_admin_1',
    name: 'Dean Martinez',
    email: 'admin@college.edu',
    role: 'admin',
    title: 'Head of Campus Operations',
    department: 'Administration',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  staff: {
    id: 'usr_staff_wifi',
    name: 'David Vance (IT Lead)',
    email: 'wifi.support@college.edu',
    role: 'staff',
    department: 'IT & Wi-Fi Support',
    title: 'Senior Network Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cr_user');
      return saved ? JSON.parse(saved) : DEMO_USERS.student;
    } catch {
      return DEMO_USERS.student;
    }
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cr_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cr_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cr_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cr_user');
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      setUser(res.user);
      return res.user;
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      setUser(res.user);
      return res.user;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchDemoRole = (role) => {
    if (DEMO_USERS[role]) {
      setUser(DEMO_USERS[role]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff',
        isStudent: user?.role === 'student',
        theme,
        toggleTheme,
        login,
        register,
        logout,
        switchDemoRole,
        DEMO_USERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
