// Initial Filter State
const initialFilterState = {
  filters: {
    fields: [],
    programType: 'all',
    startDate: null,
    endDate: null,
  },
};

// Mutations
const mutations = {
  UPDATE_FILTER(state, { key, value }) {
    if (state.filters[key] !== undefined) {
      state.filters[key] = value;
    }
  },
  RESET_FILTERS(state) {
    state.filters = { ...initialFilterState.filters };
  },
};

// Actions
const actions = {
  updateFilter({ commit }, payload) {
    commit('UPDATE_FILTER', payload);
    // Trigger re-render or data fetch here if needed via Event Bus (already in Store proxy)
  },
};

export const filterModule = {
  state: initialFilterState,
  mutations,
  actions,
};
