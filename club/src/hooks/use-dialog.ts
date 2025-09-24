import { ButtonProps } from "@/components/Button";
import { DialogContext } from "@/context/DialogProvider";
import { ReactNode, useContext } from "react";

interface DialogAction {
  label: string;
  onClick: () => unknown;
  buttonProps?: Omit<ButtonProps, "onClick">;
  isConfirmation?: boolean;
}

interface DialogOptions {
  title: string;
  description?: string | ReactNode;
  actions: DialogAction[];
}

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return {
    openDialog: (options: DialogOptions) => context.openDialog(options),
    closeDialog: context.closeDialog,
  };
};
