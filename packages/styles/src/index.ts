import { cva, type VariantProps } from "cva";

export const buttonVariant = cva({
  base: "fui-button",
  variants: {
    variant: {
      primary: "",
      secondary: "fui-button--secondary",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export type ButtonVariant = VariantProps<typeof buttonVariant>["variant"];
