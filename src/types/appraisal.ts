export interface PendingAppraisal {
  date: string;
  serviceType: string;
  sessionId: string;
  customerEmail: string;
  customerName: string;
  appraisalStatus: string;
  appraisalEditLink: string;
  imageDescription: string;
  customerDescription: string;
  appraisalValue: string;
  appraisersDescription: string;
  finalDescription: string;
  pdfLink: string;
  docLink: string;
  imagesJson: string;
}

export interface PendingAppraisalsResponse {
  appraisals: PendingAppraisal[];
  total: number;
}