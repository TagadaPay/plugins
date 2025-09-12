'use client';

import { CheckCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const firstNames = [
  'Sarah',
  'Emily',
  'Jessica',
  'Laura',
  'Olivia',
  'Sophia',
  'Ava',
  'Mia',
  'Isabella',
  'Charlotte',
  'Amelia',
  'Harper',
  'Evelyn',
  'Abigail',
  'Elizabeth',
  'Sofia',
  'Madison',
  'Avery',
  'Ella',
  'Scarlett',
  'Grace',
  'Chloe',
  'Victoria',
  'Riley',
  'Aria',
  'Lily',
  'Aubrey',
  'Zoey',
  'Penelope',
  'Lillian',
];
const colors = ['Black', 'Beige', 'Light Blue', 'Pink'];
const packages = ['1 Pair', '2 Pairs', '3 Pairs'];

function getRandomTimeAgo(): string {
  const minSeconds = 5;
  const maxSeconds = 22 * 60 + 7; // 22 minutes and 7 seconds
  const randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;

  if (randomSeconds < 60) {
    return `${randomSeconds} seconds ago`;
  } else {
    const minutes = Math.floor(randomSeconds / 60);
    return `${minutes} minutes ago`;
  }
}

function generatePurchaseMessage() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastNameInitial = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const color = colors[Math.floor(Math.random() * colors.length)];
  const packageType = packages[Math.floor(Math.random() * packages.length)];
  const timeAgo = getRandomTimeAgo();

  return `${firstName} ${lastNameInitial}. just bought ${packageType} ${color} Leggings ${timeAgo}`;
}

export function RecentPurchasePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showNextPopup = useCallback(() => {
    setMessage(generatePurchaseMessage());
    setIsVisible(true);

    // Hide after 4 seconds
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      // Wait for a random interval (5-15 seconds) before showing next
      const nextDelay = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
      timeoutRef.current = setTimeout(showNextPopup, nextDelay);
    }, 4000); // Show for 4 seconds
  }, []);

  useEffect(() => {
    showNextPopup(); // Start the first popup

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showNextPopup]);

  return (
    <div
      className={`fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-white p-3 shadow-lg transition-all duration-500 ease-in-out md:hidden ${isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
    >
      {/* @ts-ignore */}
      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
      <span className="whitespace-nowrap text-sm text-gray-800">{message}</span>
    </div>
  );
}
