// Barrel entry for the UI component library build (tsup -> dist/).
// This file is the public surface of the @study-buddy/ui package consumed by
// design tooling (e.g. /design-sync). It does NOT affect the Next.js app build:
// app code keeps importing from "@/components/ui/<name>" directly.

export * from "./alert";
export * from "./avatar";
export * from "./badge";
export * from "./button";
export * from "./card";
export * from "./checkbox";
export * from "./dialog";
export * from "./dropdown-menu";
export * from "./input-group";
export * from "./input";
export * from "./label";
export * from "./pagination";
export * from "./popover";
export * from "./select";
export * from "./separator";
export * from "./sheet";
export * from "./table";
export * from "./textarea";
