"use client";

import React, { createContext, ReactNode, useCallback, useState } from "react";

import { Button, ButtonProps } from "@/components/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DialogAction {
  label: string;
  onClick: () => void;
  buttonProps?: Omit<ButtonProps, "onClick">;
  isConfirmation?: boolean;
}

interface DialogOptions {
  title: string;
  description?: string | ReactNode;
  actions: DialogAction[];
}

interface DialogContextType {
  openDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
}

export const DialogContext = createContext<DialogContextType | undefined>(
  undefined
);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogOptions, setDialogOptions] = useState<DialogOptions | null>(
    null
  );

  const openDialog = useCallback((options: DialogOptions) => {
    setDialogOptions(options);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setDialogOptions(null);
  }, []);

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      {dialogOptions && (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
          <DialogContent className="sm:max-w-xl md:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{dialogOptions.title}</DialogTitle>
              {dialogOptions.description && (
                <DialogDescription asChild>
                  <div className="mt-1">{dialogOptions.description}</div>
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2">
              {[...dialogOptions.actions]
                .sort((a, b) => {
                  return (
                    (a.isConfirmation === true ? 0 : 1) -
                    (b.isConfirmation === true ? 0 : 1)
                  );
                })
                .map((action, index) => {
                  const buttonClassName = action.isConfirmation
                    ? "text-red-600 hover:bg-red-50"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white";

                  const buttonVariant = action.isConfirmation
                    ? "ghost"
                    : "primary";

                  return (
                    <Button
                      key={index}
                      onClick={() => {
                        action.onClick();
                        closeDialog();
                      }}
                      className={`text-wrap hyphens-auto ${buttonClassName}`}
                      variant={
                        action.buttonProps?.variant ||
                        (buttonVariant as
                          | "primary"
                          | "secondary"
                          | "light"
                          | "ghost"
                          | "destructive")
                      }
                      {...action.buttonProps}
                    >
                      {action.label}
                    </Button>
                  );
                })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DialogContext.Provider>
  );
};
