import { useDispatch, useSelector, useStore } from 'react-redux';
import { AppDispatch, RootState, AppStore } from '@/lib/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <TSelected>(selector: (state: RootState) => TSelected) =>
  useSelector(selector);
export const useAppStore = () => useStore<AppStore>();
