import { useState } from 'react';

function resolveInitialState(initialState) {
  return typeof initialState === 'function' ? initialState() : initialState;
}

export function useObjectState(initialState) {
  const [state, setState] = useState(() => resolveInitialState(initialState));

  function update(key, value) {
    setState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function patch(partialState) {
    setState((current) => ({
      ...current,
      ...partialState,
    }));
  }

  function replace(nextState) {
    setState(nextState);
  }

  function reset() {
    setState(resolveInitialState(initialState));
  }

  return {
    state,
    setState,
    update,
    patch,
    replace,
    reset,
  };
}
