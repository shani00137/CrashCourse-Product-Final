export class Service {
  constructor(data = {}) {
    this.serviceId = data.serviceId ?? data.ServiceId ?? 0;
    this.serviceName = data.serviceName ?? data.ServiceName ?? '';
  }
}

export function toServiceList(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(item => new Service(item));
}