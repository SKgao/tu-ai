import { useCallback, useState } from 'react';

function resolveInitialState(initialState) {
  return typeof initialState === 'function' ? initialState() : initialState;
}

export function useObjectState(initialState) {
  const [state, setState] = useState(() => resolveInitialState(initialState));

  const update = useCallback((key, value) => {
    setState((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const patch = useCallback((partialState) => {
    setState((current) => ({
      ...current,
      ...partialState,
    }));
  }, []);

  const replace = useCallback((nextState) => {
    setState(nextState);
  }, []);

  const reset = useCallback(() => {
    setState(resolveInitialState(initialState));
  }, [initialState]);

  return {
    state,
    setState,
    update,
    patch,
    replace,
    reset,
  };
}
