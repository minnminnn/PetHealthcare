import type { ComponentProps } from "react";
import { Toaster as SonnerToaster } from "sonner";

type ToasterProps = ComponentProps<typeof SonnerToaster>;

export function Toaster(props: ToasterProps) {
  return <SonnerToaster {...props} />;
}
