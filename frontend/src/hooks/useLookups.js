import { useCallback, useEffect, useState } from "react";
import {
  getAllApplicationStatuses,
  getAllServices
} from "../services/lookupService";
import { toApplicationStatusList } from "../app/data/ApplicationStatus";
import { toServiceList } from "../app/data/Service";

export function useApplicationStatuses() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getAllApplicationStatuses();
      setStatuses(toApplicationStatusList(raw ?? []));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load application statuses");
      setStatuses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { statuses, loading, error, reload: load };
}

export function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getAllServices();
      setServices(toServiceList(raw ?? []));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { services, loading, error, reload: load };
}

export function useAllLookups() {
  const statusesHook = useApplicationStatuses();
  const servicesHook = useServices();

  return {
    statuses: statusesHook.statuses,
    services: servicesHook.services,
    loading: statusesHook.loading || servicesHook.loading,
    error: statusesHook.error || servicesHook.error,
    reload: () => {
      statusesHook.reload();
      servicesHook.reload();
    }
  };
}