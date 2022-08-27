import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../store/counter/counterSlice';
import authReducer from '../store/auth/authSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
