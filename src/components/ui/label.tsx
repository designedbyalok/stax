import * as React from "react";

import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    data-slot="label"
    className={cn(
      "text-[11px] font-medium text-muted-foreground tracking-wide block",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
