import { Component, type ReactNode } from 'react'

export class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <div className="scene-message" role="alert">
      <p>The 3D scene could not start. Check WebGL support and reload to retry.</p>
      <button onClick={() => window.location.reload()}>Reload scene</button>
    </div>
    return this.props.children
  }
}
