// State Reducer
// http://localhost:3000/isolated/exercise/05.js

import React from 'react';
import {Switch} from '../switch';

const callAll = (...fns: (Function | undefined)[]) => (...args: any[]) =>
  fns.forEach(fn => fn?.(...args));

type ToggleState = {on: boolean};
type ToggleAction =
  | {type: 'toggle'}
  | {type: 'reset'; initialState: ToggleState};

function toggleReducer(state: ToggleState, action: ToggleAction): ToggleState {
  switch (action.type) {
    case 'toggle': {
      return {on: !state.on};
    }
    case 'reset': {
      return action.initialState;
    }
    default: {
      throw new Error(`Unsupported action: ${action}`);
    }
  }
}

// 🐨 add a new option called `reducer` that defaults to `toggleReducer`
type UseToggleArgs = {
  initialOn?: boolean;
  reducer?: typeof toggleReducer;
};

function useToggle({
  initialOn = false,
  reducer = toggleReducer,
}: UseToggleArgs) {
  const {current: initialState} = React.useRef({on: initialOn});
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const {on} = state;

  const toggle = () => dispatch({type: 'toggle'});
  const reset = () => dispatch({type: 'reset', initialState});

  function getTogglerProps({onClick, ...props}: any) {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props,
    };
  }

  function getResetterProps({onClick, ...props}: any) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    };
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  };
}

function App() {
  const [timesClicked, setTimesClicked] = React.useState(0);
  const clickedTooMuch = timesClicked >= 4;

  function toggleStateReducer(state: ToggleState, action: ToggleAction) {
    if (action.type === 'toggle' && clickedTooMuch) {
      return {on: state.on};
    }
    return toggleReducer(state, action);
  }

  const {on, getTogglerProps, getResetterProps} = useToggle({
    reducer: toggleStateReducer,
  });

  return (
    <div>
      <Switch
        {...getTogglerProps({
          // disabled: clickedTooMuch,
          on: on,
          onClick: () => setTimesClicked(count => count + 1),
        })}
      />
      {clickedTooMuch ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : timesClicked > 0 ? (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      ) : null}
      <button {...getResetterProps({onClick: () => setTimesClicked(0)})}>
        Reset
      </button>
    </div>
  );
}

export default App;

/*
eslint
  no-unused-vars: "off",
*/
