import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LanguageCode } from '../../types/property';

export type AuthModalMode = 'login' | 'register' | 'forgot-password' | 'verify-email';

export interface PostAuthAction {
  type: 'save-property';
  propertyId: string;
}

export interface ActiveAuthModalState {
  isOpen: boolean;
  mode: AuthModalMode;
  contextMessage?: string;
  redirectPath?: string;
  postAuthAction?: PostAuthAction | null;
  trigger?: 'auto-5s' | 'user' | 'protected-route' | 'compatibility-route';
  emailForVerification?: string;
}

interface UiState {
  language: LanguageCode;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  savedPropertyIds: string[];
  comparedPropertyIds: string[];
  catalogViewMode: 'split' | 'list' | 'map';
  selectedMapPropertyId: string | null;
  activeAuthModal: ActiveAuthModalState;
  activeEnquiryModal: {
    isOpen: boolean;
    propertyId?: string;
  };
}

const getStoredLanguage = (): LanguageCode => {
  try {
    const stored = localStorage.getItem('gg_lang');
    if (stored === 'en' || stored === 'ta') return stored;
  } catch {}
  return 'en';
};

const getStoredSidebarCollapsed = (): boolean => {
  try {
    return localStorage.getItem('gg_sidebar_collapsed') === 'true';
  } catch {}
  return false;
};

const getStoredSavedIds = (): string[] => {
  try {
    const raw = localStorage.getItem('gg_saved_properties');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const getStoredComparedIds = (): string[] => {
  try {
    const raw = localStorage.getItem('gg_compared_properties');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const initialState: UiState = {
  language: getStoredLanguage(),
  sidebarCollapsed: getStoredSidebarCollapsed(),
  mobileMenuOpen: false,
  savedPropertyIds: getStoredSavedIds(),
  comparedPropertyIds: getStoredComparedIds(),
  catalogViewMode: 'split',
  selectedMapPropertyId: null,
  activeAuthModal: {
    isOpen: false,
    mode: 'login',
  },
  activeEnquiryModal: {
    isOpen: false,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.language = action.payload;
      try {
        localStorage.setItem('gg_lang', action.payload);
      } catch {}
    },
    toggleLanguage: (state) => {
      const next: LanguageCode = state.language === 'en' ? 'ta' : 'en';
      state.language = next;
      try {
        localStorage.setItem('gg_lang', next);
      } catch {}
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
      try {
        localStorage.setItem('gg_sidebar_collapsed', String(action.payload));
      } catch {}
    },
    toggleSidebar: (state) => {
      const next = !state.sidebarCollapsed;
      state.sidebarCollapsed = next;
      try {
        localStorage.setItem('gg_sidebar_collapsed', String(next));
      } catch {}
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleSaveProperty: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.savedPropertyIds.includes(id)) {
        state.savedPropertyIds = state.savedPropertyIds.filter((p) => p !== id);
      } else {
        state.savedPropertyIds.push(id);
      }
      try {
        localStorage.setItem('gg_saved_properties', JSON.stringify(state.savedPropertyIds));
      } catch {}
    },
    clearSavedProperties: (state) => {
      state.savedPropertyIds = [];
      try {
        localStorage.removeItem('gg_saved_properties');
      } catch {}
    },
    toggleCompareProperty: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.comparedPropertyIds.includes(id)) {
        state.comparedPropertyIds = state.comparedPropertyIds.filter((p) => p !== id);
      } else {
        if (state.comparedPropertyIds.length >= 4) {
          state.comparedPropertyIds.shift(); // keep max 4
        }
        state.comparedPropertyIds.push(id);
      }
      try {
        localStorage.setItem('gg_compared_properties', JSON.stringify(state.comparedPropertyIds));
      } catch {}
    },
    clearComparedProperties: (state) => {
      state.comparedPropertyIds = [];
      try {
        localStorage.removeItem('gg_compared_properties');
      } catch {}
    },
    openAuthModal: (
      state,
      action: PayloadAction<Partial<ActiveAuthModalState> | AuthModalMode | undefined>
    ) => {
      const payload = action.payload;
      if (typeof payload === 'string') {
        state.activeAuthModal = {
          isOpen: true,
          mode: payload,
          contextMessage: undefined,
          redirectPath: undefined,
          postAuthAction: null,
          trigger: 'user',
          emailForVerification: undefined,
        };
      } else if (payload && typeof payload === 'object') {
        state.activeAuthModal = {
          isOpen: true,
          mode: payload.mode || state.activeAuthModal.mode || 'login',
          contextMessage: payload.contextMessage,
          redirectPath: payload.redirectPath,
          postAuthAction: payload.postAuthAction !== undefined ? payload.postAuthAction : null,
          trigger: payload.trigger || 'user',
          emailForVerification: payload.emailForVerification || state.activeAuthModal.emailForVerification,
        };
      } else {
        state.activeAuthModal = {
          isOpen: true,
          mode: 'login',
          contextMessage: undefined,
          redirectPath: undefined,
          postAuthAction: null,
          trigger: 'user',
          emailForVerification: undefined,
        };
      }
    },
    setAuthModalMode: (state, action: PayloadAction<AuthModalMode>) => {
      state.activeAuthModal.mode = action.payload;
    },
    setAuthModalVerificationEmail: (state, action: PayloadAction<string>) => {
      state.activeAuthModal.emailForVerification = action.payload;
    },
    closeAuthModal: (state) => {
      state.activeAuthModal.isOpen = false;
      state.activeAuthModal.contextMessage = undefined;
      state.activeAuthModal.postAuthAction = null;
    },
    openEnquiryModal: (state, action: PayloadAction<string | undefined>) => {
      state.activeEnquiryModal = {
        isOpen: true,
        propertyId: action.payload,
      };
    },
    closeEnquiryModal: (state) => {
      state.activeEnquiryModal = {
        isOpen: false,
      };
    },
    setCatalogViewMode: (state, action: PayloadAction<'split' | 'list' | 'map'>) => {
      state.catalogViewMode = action.payload;
    },
    setSelectedMapPropertyId: (state, action: PayloadAction<string | null>) => {
      state.selectedMapPropertyId = action.payload;
    },
    resetClientStateOnLogout: (state) => {
      state.savedPropertyIds = [];
      state.comparedPropertyIds = [];
      state.activeAuthModal.isOpen = false;
      state.activeEnquiryModal.isOpen = false;
      try {
        localStorage.removeItem('gg_saved_properties');
        localStorage.removeItem('gg_compared_properties');
      } catch {}
    },
  },
});

export const {
  setLanguage,
  toggleLanguage,
  setSidebarCollapsed,
  toggleSidebar,
  setMobileMenuOpen,
  toggleSaveProperty,
  clearSavedProperties,
  toggleCompareProperty,
  clearComparedProperties,
  setCatalogViewMode,
  setSelectedMapPropertyId,
  openAuthModal,
  setAuthModalMode,
  setAuthModalVerificationEmail,
  closeAuthModal,
  openEnquiryModal,
  closeEnquiryModal,
  resetClientStateOnLogout,
} = uiSlice.actions;

export default uiSlice.reducer;

