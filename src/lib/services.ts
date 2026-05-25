import { Service } from "@/types/service";

const STORAGE_KEY = "tds_services";

export function getServices(): Service[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveServices(services: Service[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
}

export function addService(
  data: Omit<Service, "id" | "createdAt" | "updatedAt">
): Service {
  const now = new Date().toISOString();
  const service: Service = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  const services = getServices();
  services.unshift(service);
  saveServices(services);
  return service;
}

export function updateService(
  id: string,
  data: Partial<Omit<Service, "id" | "createdAt">>
): Service | null {
  const services = getServices();
  const index = services.findIndex((s) => s.id === id);
  if (index === -1) return null;
  services[index] = {
    ...services[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  saveServices(services);
  return services[index];
}

export function deleteService(id: string): boolean {
  const services = getServices();
  const filtered = services.filter((s) => s.id !== id);
  if (filtered.length === services.length) return false;
  saveServices(filtered);
  return true;
}

export function getServiceById(id: string): Service | null {
  return getServices().find((s) => s.id === id) ?? null;
}
