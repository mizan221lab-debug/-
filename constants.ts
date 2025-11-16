import { PlanStatus, UserRole } from './types';

export const STATUS_COLORS: { [key in PlanStatus]: string } = {
  [PlanStatus.Draft]: 'bg-gray-100 text-gray-800',
  [PlanStatus.Pending_DeptHead]: 'bg-yellow-100 text-yellow-800',
  [PlanStatus.Pending_Academic]: 'bg-orange-100 text-orange-800',
  [PlanStatus.Pending_Director]: 'bg-purple-100 text-purple-800',
  [PlanStatus.Revision]: 'bg-red-100 text-red-800',
  [PlanStatus.Approved]: 'bg-green-100 text-green-800',
};

export const ROLE_LABELS: { [key in UserRole]: string } = {
    [UserRole.Teacher]: 'ครู',
    [UserRole.DepartmentHead]: 'หัวหน้ากลุ่มสาระ',
    [UserRole.AcademicAffairs]: 'ฝ่ายวิชาการ',
    [UserRole.Director]: 'ผู้อำนวยการ',
};

export const MOCK_TEACHER_ID = 'teacher_01';
export const MOCK_TEACHER_NAME = 'ครูสมชาย ใจดี';
