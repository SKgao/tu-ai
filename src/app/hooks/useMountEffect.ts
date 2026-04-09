import { useEffect, useRef } from 'react';

export type MountEffect = () => void | Promise<unknown>;

export function useMountEffect(effect: MountEffect): void {
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useEffect(() => {
    void effectRef.current?.();
  }, []);
}
