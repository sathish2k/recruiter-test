"use client";

import { useCallback, useState } from "react";

export interface UseModalResult<T = unknown> {
  isOpen: boolean;
  /** Payload passed to `open(data)` — e.g. the row being edited. */
  data: T | undefined;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
}

export function useModal<T = unknown>(initialOpen = false): UseModalResult<T> {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState<T | undefined>(undefined);

  const open = useCallback((payload?: T) => {
    setData(payload);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return { isOpen, data, open, close, toggle };
}
