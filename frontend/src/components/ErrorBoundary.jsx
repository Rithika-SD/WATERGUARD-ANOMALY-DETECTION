import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

/**
 * TECHNICAL DOCUMENTATION: REACT ERROR BOUNDARY
 * 
 * Why Error Boundary is Required:
 * --------------------------------
 * In React 16+, JavaScript errors inside component rendering, lifecycle methods, or
 * constructor hooks unmount the entire component tree, causing a blank white screen.
 * Error Boundaries are class-based React components that catch rendering errors anywhere
 * in their child component tree, log the error, and display a fallback UI instead of crashing.
 * 
 * Component Lifecycle Hooks:
 * --------------------------
 * 1. getDerivedStateFromError(error):
 *    - Static lifecycle hook invoked during the "render" phase when a child component throws an error.
 *    - Updates component state (hasError: true) synchronously to trigger render of fallback UI.
 * 
 * 2. componentDidCatch(error, errorInfo):
 *    - Lifecycle hook invoked during the "commit" phase after an error has been caught.
 *    - Used to log error stacks, component traces, and telemetry without blocking UI render.
 * 
 * Fallback UI Purpose:
 * --------------------
 * Shows a safe, user-friendly error card with recovery controls (Try Again / Go to Dashboard),
 * preserving application navigation (sidebar & topbar) and preventing blank-screen crashes.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  /**
   * Invoked when a descendant component throws an error during rendering.
   * Updates state so the next render shows the fallback UI.
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error: error
    }
  }

  /**
   * Invoked after an error has been caught. Logs details for debugging.
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    // Log error details safely to browser developer console
    console.error(' [ErrorBoundary] Uncaught UI Component Error:', error)
    console.error(' [ErrorBoundary] Component Stack Trace:', errorInfo?.componentStack)
  }

  /**
   * Resets error state allowing the user to attempt re-rendering the section.
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Safe fallback UI shown when an exception occurs in child components
      return (
        <div className="p-6 my-4 bg-white border border-rose-200 rounded-2xl shadow-sm space-y-4 max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">
                Component Rendering Issue Caught
              </h2>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                An unexpected interface rendering exception occurred in this view. The Error Boundary
                caught the error safely to prevent the application from crashing.
              </p>
            </div>
          </div>

          {/* Safe Technical Summary */}
          {this.state.error && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 overflow-x-auto">
              <span className="font-bold text-rose-700">Error: </span>
              {this.state.error.toString()}
            </div>
          )}

          {/* Action Recovery Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border border-slate-200"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>Return to Dashboard</span>
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
