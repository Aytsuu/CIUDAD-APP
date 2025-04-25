import React from "react";

type ForwardRefWrapperProps = React.HTMLProps<HTMLDivElement>;

const ForwardRefWrapper = React.forwardRef<HTMLDivElement, ForwardRefWrapperProps>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);

ForwardRefWrapper.displayName = "ForwardRefWrapper";

export default ForwardRefWrapper;
