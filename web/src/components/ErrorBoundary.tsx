import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

/** Last line of defence: a render crash shows a recoverable screen instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const chunkFailed = /Loading chunk|dynamically imported module|Failed to fetch/i.test(this.state.error.message);
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <img src="/brand-mark.png" alt="" className="mb-2 size-10" />
        <p className="text-lg font-bold text-ink">{chunkFailed ? "A new version is available" : "Something went wrong"}</p>
        <p className="max-w-sm text-sm text-ink-muted">
          {chunkFailed ? "Reload to get the latest version of Horilux." : "The page hit an unexpected error. Reloading usually fixes it; if it keeps happening, let the team know."}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 h-9 rounded bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Reload
        </button>
      </div>
    );
  }
}
