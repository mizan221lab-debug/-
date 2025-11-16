export enum PlanStatus {
  Draft = 'ฉบับร่าง',
  Pending_DeptHead = 'รอหัวหน้ากลุ่มสาระตรวจ',
  Pending_Academic = 'รอฝ่ายวิชาการตรวจ',
  Pending_Director = 'รอผู้อำนวยการอนุมัติ',
  Revision = 'ให้ปรับปรุง',
  Approved = 'อนุมัติแล้ว',
}

export enum UserRole {
  Teacher = 'teacher',
  DepartmentHead = 'department_head',
  AcademicAffairs = 'academic_affairs',
  Director = 'director',
}

export enum AttachmentType {
  Document = 'เอกสารประกอบ',
  Image = 'รูปภาพ',
  Link = 'ลิงค์',
}

export interface Attachment {
  id: string;
  type: AttachmentType;
  name: string;
  url: string;
  fileName?: string;
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  teacherName: string;
  planName: string;
  subject: string;
  grade: string;
  term: string;
  academicYear: string;
  unit: string;
  duration: string;
  teachingDate: string;
  standards: string;
  objectives: string;
  coreConcepts: string;
  // กระบวนการสอน 5 ขั้นตอน
  step1_engage: string;
  step2_explore: string;
  step3_explain: string;
  step4_elaborate: string;
  step5_evaluate: string;
  grouping: string;
  media: string;
  homework: string;
  assessmentMethods: string;
  assessmentTools: string;
  assessmentCriteria: string;
  teacherNotes: string;
  status: PlanStatus;
  reviewerFeedback?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}