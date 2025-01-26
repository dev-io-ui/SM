import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modules: Array<{
    title: string;
    description: string;
    content: string;
    videoUrl: string;
    duration: number;
    order: number;
    quiz: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
    }>;
  }>;
  enrollmentCount: number;
  rating: number;
  reviews: Array<{
    user: {
      _id: string;
      name: string;
    };
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
}

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  enrolledCourses: Course[];
  isLoading: boolean;
  error: string | null;
  filters: {
    difficulty: string;
    search: string;
    sort: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  enrolledCourses: [],
  isLoading: false,
  error: null,
  filters: {
    difficulty: '',
    search: '',
    sort: '-createdAt',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

export const getCourses = createAsyncThunk(
  'courses/getCourses',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const { filters, pagination } = state.courses;
      const response = await axios.get('/api/courses', {
        params: {
          difficulty: filters.difficulty,
          search: filters.search,
          sort: filters.sort,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

export const getCourse = createAsyncThunk(
  'courses/getCourse',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/courses/${courseId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course');
    }
  }
);

export const enrollCourse = createAsyncThunk(
  'courses/enrollCourse',
  async (courseId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${state.auth.user.token}`,
        },
      };
      const response = await axios.post(`/api/courses/${courseId}/enroll`, {}, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to enroll in course');
    }
  }
);

export const addCourseReview = createAsyncThunk(
  'courses/addReview',
  async (
    { courseId, review }: { courseId: string; review: { rating: number; comment: string } },
    { getState, rejectWithValue }
  ) => {
    try {
      const state: any = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${state.auth.user.token}`,
        },
      };
      const response = await axios.post(`/api/courses/${courseId}/reviews`, review, config);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add review');
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset page when filters change
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    resetCourseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
      })
      .addCase(getCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(enrollCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(enrollCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentCourse) {
          state.currentCourse.enrollmentCount += 1;
          state.enrolledCourses.push(state.currentCourse);
        }
      })
      .addCase(enrollCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addCourseReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCourseReview.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentCourse) {
          state.currentCourse.reviews.push(action.payload);
          // Update course rating
          const totalRating = state.currentCourse.reviews.reduce((acc, review) => acc + review.rating, 0);
          state.currentCourse.rating = totalRating / state.currentCourse.reviews.length;
        }
      })
      .addCase(addCourseReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, setPage, resetCourseError } = courseSlice.actions;
export default courseSlice.reducer;
