import { create } from 'zustand';

interface AutoSignStore {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  syncFromSDK: (autoSign: any, chainId: string) => void;
}

export const useAutoSignStore = create<AutoSignStore>((set) => ({
  enabled: typeof window !== "undefined"
    ? localStorage.getItem("autosign_enabled") === "true"
    : false,
  setEnabled: (enabled) => {
    localStorage.setItem("autosign_enabled", String(enabled));
    set({ enabled });
  },
  syncFromSDK: (autoSign, chainId) => {
    // Sincroniza el estado real del SDK con nuestro store
    if (typeof window !== "undefined" && autoSign && chainId) {
      const sdkIsEnabled = !!autoSign.isEnabledByChain?.[chainId];
      set({ enabled: sdkIsEnabled });
      localStorage.setItem("autosign_enabled", String(sdkIsEnabled));
      console.log("[AutoSignStore] Sincronizado estado SDK:", chainId, sdkIsEnabled);
    }
  },
}));