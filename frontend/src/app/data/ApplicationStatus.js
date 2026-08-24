export class ApplicationStatus {
  constructor(data = {}) {
    this.applicationStatusId = data.applicationStatusId ?? data.ApplicationStatusId ?? 0;
    this.statusName = data.statusName ?? data.StatusName ?? '';
  }
}

export function toApplicationStatusList(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(item => new ApplicationStatus(item));
}