// store.ts or redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import UIReducer from '@/lib/features/UISlice';
import UserReducer from '@/lib/features/UserSlice';
export const makeStore = () => {
  return configureStore({
    reducer: {
      ui: UIReducer,
      user:UserReducer

    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];