import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../store/counter/counterSlice';
import authReducer from '../store/auth/authSlice';
import museReducer from '../store/muse/museSlice';
import tokensReducer from '../store/tokens/tokensSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    muse: museReducer,
    tokens: tokensReducer
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
