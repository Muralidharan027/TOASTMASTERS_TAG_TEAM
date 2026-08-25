export function triggerHaptic(type: 'tap' | 'signal' | 'warning' | 'success'): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'tap':
        navigator.vibrate(25);
        break;
      case 'signal':
        navigator.vibrate([60, 40, 60]);
        break;
      case 'warning':
        navigator.vibrate([100, 50, 100, 50, 150]);
        break;
      case 'success':
        navigator.vibrate([50, 30, 80]);
        break;
    }
  } catch {
    // Vibration failed or blocked by policy
  }
}
