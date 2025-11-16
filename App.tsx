import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, LessonPlan } from './types';
import { ROLE_LABELS, MOCK_TEACHER_ID } from './constants';
import TeacherDashboard from './components/TeacherDashboard';
import ReviewerDashboard from './components/ReviewerDashboard';
import { api } from './services/api';

// --- Header and Role Switcher Component ---
interface AppHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ currentRole, onRoleChange }) => (
  <header className="bg-white shadow-md">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 12.75l4.5-4.5m0 4.5l-4.5 4.5M19.5 6.75h-15a2.25 2.25 0 00-2.25 2.25v6c0 1.242 1.008 2.25 2.25 2.25h15a2.25 2.25 0 002.25-2.25v-6a2.25 2.25 0 00-2.25-2.25z" />
          </svg>
          <h1 className="text-xl font-bold text-gray-800 ml-3">ระบบจัดการแผนการสอน</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-600">มุมมอง:</span>
          <div className="relative inline-block text-left">
             <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
          </div>
        </div>
      </div>
    </div>
  </header>
);

// --- Main App Component ---
export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.Teacher);
  const [allPlans, setAllPlans] = useState<LessonPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [notification, setNotification] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const plans = await api.getLessonPlans();
      setAllPlans(plans);
    } catch (error) {
      console.error("Failed to fetch lesson plans:", error);
      showNotification("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const teacherPlans = allPlans.filter(p => p.teacherId === MOCK_TEACHER_ID);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <AppHeader currentRole={userRole} onRoleChange={setUserRole} />
      
      {notification && (
        <div className="fixed top-20 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out z-50">
          {notification}
        </div>
      )}

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {userRole === UserRole.Teacher ? (
          <TeacherDashboard 
            plans={teacherPlans} 
            isLoading={isLoading}
            onUpdate={fetchPlans}
            showNotification={showNotification}
          />
        ) : (
          <ReviewerDashboard 
            plans={allPlans}
            isLoading={isLoading} 
            onUpdate={fetchPlans}
            showNotification={showNotification}
            currentUserRole={userRole}
          />
        )}
      </main>
    </div>
  );
}
