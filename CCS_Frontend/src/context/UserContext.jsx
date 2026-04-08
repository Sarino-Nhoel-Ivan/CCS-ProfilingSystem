/**
 * Part 4: Global State Management
 * ─────────────────────────────────────────────────────────────
 * UserContext provides TWO pieces of global state available to ALL pages:
 *
 *  1. currentUser  — the logged-in user object (Admin/Student/Faculty)
 *                    contains: id, name, email, role, student_id, faculty_id
 *
 *  2. DarkModeContext (CCS_Frontend/src/context/DarkModeContext.jsx)
 *                    — system theme (dark/light) shared across all admin pages
 *
 * Requirement: Show logged-in user name in all pages
 *   - Admin   → Topnav displays user name from UserContext
 *   - Student → StudentDashboard already shows name in sidebar/header
 *   - Faculty → FacultyDashboard already shows name in sidebar/header
 */

import { createContext, useContext } from 'react';

export const UserContext = createContext(null);

export const useCurrentUser = () => useContext(UserContext);
