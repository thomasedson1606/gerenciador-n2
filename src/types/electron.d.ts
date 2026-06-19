interface ElectronAPI {
  selectRarFile: () => Promise<string | null>;
  selectFolder: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
