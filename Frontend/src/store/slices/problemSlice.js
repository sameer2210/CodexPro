import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../utils/axiosClient';

export const fetchSolvedProblems = createAsyncThunk(
  'problem/fetchSolvedProblems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/problem/solvedProblem');
      return response.data?.solvedProblems || response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch solved problems');
    }
  }
);

const problemSlice = createSlice({
  name: 'problem',
  initialState: {
    solvedProblems: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSolvedProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSolvedProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.solvedProblems = action.payload;
      })
      .addCase(fetchSolvedProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default problemSlice.reducer;
