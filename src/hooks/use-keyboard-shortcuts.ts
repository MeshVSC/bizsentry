"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if not typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      // Ctrl/Cmd + N: New item
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        router.push('/inventory/add');
      }

      // Escape: Go back
      if (event.key === 'Escape') {
        event.preventDefault();
        router.back();
      }

      // Ctrl/Cmd + K: Focus search (if search exists)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // H: Go to home/dashboard
      if (event.key === 'h') {
        event.preventDefault();
        router.push('/dashboard');
      }

      // I: Go to inventory
      if (event.key === 'i') {
        event.preventDefault();
        router.push('/inventory');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}