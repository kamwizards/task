import confetti from 'canvas-confetti';

export function fireSuccessConfetti(event?: React.MouseEvent) {
  try {
    let x = 0.5;
    let y = 0.5;

    if (event && event.clientX && event.clientY) {
      x = event.clientX / window.innerWidth;
      y = event.clientY / window.innerHeight;
    }

    // Two rapid celebratory bursts
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { x, y },
      colors: ['#6366f1', '#a855f7', '#34d399', '#38bdf8', '#f59e0b'],
      disableForReducedMotion: true,
      zIndex: 9999,
    });
  } catch {
    // Graceful fallback
  }
}
