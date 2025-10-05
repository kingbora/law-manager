export const CASE_STAGES = ['立案', '证据交换', '庭前会议', '庭审', '调解', '判决', '执行'] as const;

export const URGENCY_LEVELS = ['普通', '紧急', '特急'] as const;

export type CaseStage = (typeof CASE_STAGES)[number];
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];

export type CaseRecord = {
	caseNo: string;
	reason: string;
	client: string;
	parties: string[];
	lawyer: string;
	stage: CaseStage;
	urgency: UrgencyLevel;
	acceptDate: string;
	description: string;
	materials: string[];
};
