import { createContext, useContext } from 'react';

// Reference data (stages, sectors, leads) loaded once from Supabase and made
// available to presentational components via context — replacing the prototype's
// global window.PIPELINE lookups.
const RefDataContext = createContext({ stages: [], sectors: {}, leads: [] });

export function RefDataProvider({ value, children }) {
  return <RefDataContext.Provider value={value}>{children}</RefDataContext.Provider>;
}

export function useRefData() {
  return useContext(RefDataContext);
}

export function useSectorColor() {
  const { sectors } = useRefData();
  return (sector) => sectors[sector] || '#6B7A99';
}

export function useLeadById() {
  const { leads } = useRefData();
  return (id) => leads.find((l) => l.id === id) || { initials: '?', name: 'Unassigned' };
}
