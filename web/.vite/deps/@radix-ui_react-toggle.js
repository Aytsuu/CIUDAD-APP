"use client";
import {
  useControllableState
} from "./chunk-KFUQVIY7.js";
import {
  composeEventHandlers
} from "./chunk-VPNAYSIV.js";
import {
  Primitive
} from "./chunk-2RZL5GHS.js";
import "./chunk-4DAUHSLC.js";
import {
  require_jsx_runtime
} from "./chunk-JKTQC6Y7.js";
import "./chunk-ZE2EBKIV.js";
import {
  require_react
} from "./chunk-UVNPGZG7.js";
import {
  __toESM
} from "./chunk-OL46QLBJ.js";

// node_modules/@radix-ui/react-toggle/dist/index.mjs
var React = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var NAME = "Toggle";
var Toggle = React.forwardRef((props, forwardedRef) => {
  const { pressed: pressedProp, defaultPressed = false, onPressedChange, ...buttonProps } = props;
  const [pressed = false, setPressed] = useControllableState({
    prop: pressedProp,
    onChange: onPressedChange,
    defaultProp: defaultPressed
  });
  return (0, import_jsx_runtime.jsx)(
    Primitive.button,
    {
      type: "button",
      "aria-pressed": pressed,
      "data-state": pressed ? "on" : "off",
      "data-disabled": props.disabled ? "" : void 0,
      ...buttonProps,
      ref: forwardedRef,
      onClick: composeEventHandlers(props.onClick, () => {
        if (!props.disabled) {
          setPressed(!pressed);
        }
      })
    }
  );
});
Toggle.displayName = NAME;
var Root = Toggle;
export {
  Root,
  Toggle
};
//# sourceMappingURL=@radix-ui_react-toggle.js.map
