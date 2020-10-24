// Control Props
// http://localhost:3000/isolated/exercise/06.js

import React, {FC} from 'react';
import {Switch} from '../switch';
import warning from 'warning';

const callAll = (...fns: (Function | undefined)[]) => (...args: any[]) =>
  fns.forEach(fn => fn?.(...args));

function useControlledSwitchWarning(
  controlPropValue: any,
  controlPropName: string,
  componentName: string,
) {
  const isControlled = controlPropValue != null;
  const {current: wasControlled} = React.useRef(isControlled);

  React.useEffect(() => {
    warning(
      !(isControlled && !wasControlled),
      `\`${componentName}\` is changing from uncontrolled to be controlled. Components should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled \`${componentName}\` for the lifetime of the component. Check the \`${controlPropName}\` prop.`,
    );
    warning(
      !(!isControlled && wasControlled),
      `\`${componentName}\` is changing from controlled to be uncontrolled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled \`${componentName}\` for the lifetime of the component. Check the \`${controlPropName}\` prop.`,
    );
  }, [componentName, controlPropName, isControlled, wasControlled]);
}

function useOnChangeReadOnlyWarning(
  controlPropValue: any,
  controlPropName: string,
  componentName: string,
  hasOnChange: boolean,
  readOnly: boolean,
  readOnlyProp: string,
  initialValueProp: string,
  onChangeProp: string,
) {
  const isControlled = controlPropValue != null;
  React.useEffect(() => {
    warning(
      !(!hasOnChange && isControlled && !readOnly),
      `A \`${controlPropName}\` prop was provided to \`${componentName}\` without an \`${onChangeProp}\` handler. This will result in a read-only \`${controlPropName}\` value. If you want it to be mutable, use \`${initialValueProp}\`. Otherwise, set either \`${onChangeProp}\` or \`${readOnlyProp}\`.`,
    );
  }, [
    componentName,
    controlPropName,
    isControlled,
    hasOnChange,
    readOnly,
    onChangeProp,
    initialValueProp,
    readOnlyProp,
  ]);
}

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

type UseToggleOnChange = (state: ToggleState, action: ToggleAction) => void;

type UseToggleArgs = {
  initialOn?: boolean;
  reducer?: typeof toggleReducer;
  onChange?: UseToggleOnChange;
  on?: boolean;
  readOnly?: boolean;
};

function useToggle({
  initialOn = false,
  reducer = toggleReducer,
  onChange,
  on: controlledOn,
  readOnly = false,
}: UseToggleArgs) {
  const {current: initialState} = React.useRef({on: initialOn});
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const onIsControlled = typeof controlledOn !== 'undefined';
  const on = onIsControlled ? controlledOn! : state.on;

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useControlledSwitchWarning(controlledOn, 'on', 'useToggle');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useOnChangeReadOnlyWarning(
      controlledOn,
      'on',
      'useToggle',
      Boolean(onChange),
      readOnly,
      'readOnly',
      'initialOn',
      'onChange',
    );
  }

  const dispatchWithOnChange = (action: ToggleAction) => {
    // 如果是 controlled component, 不要做額外的 dispatch, 會造成不必要的 rerender
    if (!onIsControlled) dispatch(action);
    if (onChange) {
      // 根據 currentState (可能是 useReducer 來的, 可能是 user 傳來的) + action, 計算出 "建議" 的 state 給 user
      onChange(reducer({...state, on}, action), action);
    }
  };

  // make these call `dispatchWithOnChange` instead
  const toggle = () => dispatchWithOnChange({type: 'toggle'});
  const reset = () => dispatchWithOnChange({type: 'reset', initialState});

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

type ToggleProps = {
  on?: boolean;
  onChange?: UseToggleOnChange;
  readOnly?: boolean;
};

const Toggle: FC<ToggleProps> = ({on: controlledOn, onChange, readOnly}) => {
  const {on, getTogglerProps} = useToggle({
    on: controlledOn,
    onChange,
    readOnly,
  });
  const props = getTogglerProps({on});
  return <Switch {...props} />;
};

function App() {
  const [bothOn, setBothOn] = React.useState(false);
  const [timesClicked, setTimesClicked] = React.useState(0);
  const clickedTooMuch = timesClicked > 4;

  const handleToggleChange: UseToggleOnChange = (state, action) => {
    if (action.type === 'toggle' && clickedTooMuch) {
      return;
    }
    setBothOn(state.on);
    setTimesClicked(c => c + 1);
  };

  function handleResetClick() {
    setBothOn(false);
    setTimesClicked(0);
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={bothOn} onChange={handleToggleChange} />
      </div>
      {clickedTooMuch ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}
      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
          onChange={(...args) =>
            console.info('Uncontrolled Toggle onChange', ...args)
          }
        />
      </div>
    </div>
  );
}

export default App;
// we're adding the Toggle export for tests
export {Toggle};

/*
eslint
  no-unused-vars: "off",
*/
