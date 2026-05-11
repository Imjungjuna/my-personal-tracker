import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-xl bg-paw-brown-light/30",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
