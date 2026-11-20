import confetti from 'canvas-confetti';

export function triggerCelebration() {
  if (typeof window === 'undefined') return;

  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#5D7CF5', '#A7E6CC', '#FFD8B1', '#FF6B6B']
    });
  } catch (err) {
    // Non-critical visual celebration
  }
}

