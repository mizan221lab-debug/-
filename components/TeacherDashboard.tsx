import React, { useState } from 'react';
import { LessonPlan, PlanStatus, UserRole } from '../types';
import { STATUS_COLORS, MOCK_TEACHER_ID, MOCK_TEACHER_NAME } from '../constants';
import LessonPlanFormModal from './LessonPlanFormModal';
import LessonPlanDetailModal from './LessonPlanDetailModal';
import { PencilIcon, EyeIcon, PlusIcon, DocumentTextIcon } from './common/Icons';

interface TeacherDashboardProps {
  plans: LessonPlan[];
  isLoading: boolean;
  onUpdate: () => void;
  showNotification: (message: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ plans, isLoading, onUpdate, showNotification }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);

  const handleCreateNew = () => {
    setSelectedPlan(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (plan: LessonPlan) => {
    setSelectedPlan(plan);
    setIsFormModalOpen(true);
  };
  
  const handleView = (plan: LessonPlan) => {
    setSelectedPlan(plan);
    setIsDetailModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedPlan(null);
  }

  const handleSuccess = (message: string) => {
    handleCloseModals();
    onUpdate();
    showNotification(message);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">แผนการสอนของฉัน</h2>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <PlusIcon className="mr-2 h-5 w-5" />
          สร้างแผนการสอนใหม่
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="text-center p-10">กำลังโหลดข้อมูล...</div>
          ) : plans.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อแผนการสอน</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วิชา</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ระดับชั้น</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สอน</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.planName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(plan.teachingDate).toLocaleDateString('th-TH')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[plan.status]}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                       {plan.status === PlanStatus.Draft || plan.status === PlanStatus.Revision ? (
                        <button onClick={() => handleEdit(plan)} className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                          <PencilIcon className="h-5 w-5 mr-1" /> แก้ไข
                        </button>
                      ) : (
                        <button onClick={() => handleView(plan)} className="text-gray-600 hover:text-gray-900 inline-flex items-center">
                          <EyeIcon className="h-5 w-5 mr-1" /> ดูรายละเอียด
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="text-center p-10 text-gray-500">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">ไม่พบแผนการสอน</h3>
              <p className="mt-1 text-sm">เริ่มต้นโดยการคลิก "สร้างแผนการสอนใหม่"</p>
            </div>
          )}
        </div>
      </div>
      
      {isFormModalOpen && (
        <LessonPlanFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseModals}
          plan={selectedPlan}
          onSuccess={handleSuccess}
          teacherId={MOCK_TEACHER_ID}
          teacherName={MOCK_TEACHER_NAME}
        />
      )}

      {isDetailModalOpen && selectedPlan && (
        <LessonPlanDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseModals}
          plan={selectedPlan}
          userRole={UserRole.Teacher}
          onUpdateStatus={() => {}}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
