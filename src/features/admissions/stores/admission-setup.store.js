import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** UI-only selection state. Academic years load from the API. */
export const useAdmissionSetupStore = create(
  persist(
    (set) => ({
      selectedYearId: null,
      setSelectedYearId: (id) => set({ selectedYearId: id }),
    }),
    { name: 'scholaone-admission-setup-selection' },
  ),
)
