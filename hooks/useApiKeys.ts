export function useApiKeys() {
  return {
    keys: [],
    addKey: async () => null,
    deleteKey: async () => true,
    isLoading: false,
    error: null,
  }
}
