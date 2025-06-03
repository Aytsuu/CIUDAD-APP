import * as React from "react";
import { cn } from "@/lib/utils";

const TextareaTab = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const target = e.target as HTMLTextAreaElement;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        
        // Insert tab character at cursor position
        target.value = target.value.substring(0, start) + '\t' + target.value.substring(end);
        
        // Move cursor position after the tab
        target.selectionStart = target.selectionEnd = start + 1;
        
        // Trigger onChange if it exists
        if (props.onChange) {   
          const event = {
            target,
            currentTarget: target,
          } as React.ChangeEvent<HTMLTextAreaElement>;
          props.onChange(event);
        }
      }
      
      // Call original onKeyDown if provided
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);
TextareaTab.displayName = "TextareaTab";

export { TextareaTab };





// import * as React from "react";
// import { cn } from "@/lib/utils";

// const TextareaTab = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
//   ({ className, onKeyDown, ...props }, ref) => {
//     const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//       const target = e.target as HTMLTextAreaElement;
//       const start = target.selectionStart;
//       const end = target.selectionEnd;
//       const value = target.value;

//       // Handle Tab for indentation
//       if (e.key === 'Tab') {
//         e.preventDefault();
//         target.value = value.substring(0, start) + '\t' + value.substring(end);
//         target.selectionStart = target.selectionEnd = start + 1;
//         props.onChange?.({ target } as React.ChangeEvent<HTMLTextAreaElement>);
//       }
      
//       // Handle Ctrl+B for bold (Windows) or Cmd+B (Mac)
//       if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
//         e.preventDefault();
//         const selectedText = value.substring(start, end);
//         const beforeText = value.substring(0, start);
//         const afterText = value.substring(end);
        
//         if (selectedText) {
//           // Wrap selected text with **
//           target.value = `${beforeText}**${selectedText}**${afterText}`;
//           target.selectionStart = start + 2;
//           target.selectionEnd = end + 2;
//         } else {
//           // Insert ** at cursor position if no text selected
//           target.value = `${beforeText}****${afterText}`;
//           target.selectionStart = target.selectionEnd = start + 2;
//         }
//         props.onChange?.({ target } as React.ChangeEvent<HTMLTextAreaElement>);
//       }

//       onKeyDown?.(e);
//     };

//     return (
//       <textarea
//         className={cn(
//           "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono",
//           className
//         )}
//         ref={ref}
//         onKeyDown={handleKeyDown}
//         {...props}
//       />
//     );
//   }
// );
// TextareaTab.displayName = "TextareaTab";

// export { TextareaTab };