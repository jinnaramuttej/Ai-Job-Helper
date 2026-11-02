import type { DataState, MockData, Screen } from '../mock';

export interface NavParams { jobId?: string; query?: string }

/** Every screen is presentational: data + UI state in, callbacks out. */
export interface ScreenProps {
  data: MockData;
  state: DataState;
  onNavigate: (s: Screen, p?: NavParams) => void;
  onToast: (msg: string) => void;
  onRetry: () => void;
}
