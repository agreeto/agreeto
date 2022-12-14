import clsx from "clsx";
import React from "react";

type Props = {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  customBody?: React.ReactNode;
  onOutsideClick?: () => void;
  closeIconButton?: {
    onClick?: () => void;
  };
  primaryButton?: {
    className?: string;
    text: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: "primary" | "danger";
  };
  cancelButton?: {
    text: string;
    disabled?: boolean;
    onClick?: () => void;
  };
};

export const Modal: React.FC<Props> = ({
  open,
  title,
  description,
  customBody,
  onOutsideClick,
  closeIconButton,
  primaryButton,
  cancelButton,
}) => {
  return !open ? null : (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.currentTarget.id === "agreeto-modal") {
          onOutsideClick?.();
        }
      }}
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div
          id="agreeto-modal"
          className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {/* Close icon */}
              {closeIconButton && (
                <div className="flex justify-end">
                  <div
                    className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#D90026] text-xs font-semibold text-white"
                    onClick={closeIconButton.onClick}
                  >
                    X
                  </div>
                </div>
              )}

              {/* Body */}
              {customBody || (
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg font-medium leading-6 text-gray-900"
                      id="modal-title"
                    >
                      {title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {Boolean(primaryButton || cancelButton) && (
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                {primaryButton && (
                  // TODO: use button from ui lib
                  <button
                    onClick={primaryButton.onClick}
                    disabled={primaryButton.disabled}
                    className={clsx(
                      "mt-3 ml-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",
                      {
                        "bg-red-600 hover:bg-red-500":
                          primaryButton.type === "danger",
                        "bg-primary hover:bg-primary/80":
                          primaryButton.type === "primary",
                      },
                      primaryButton.className,
                    )}
                  >
                    {primaryButton.text}
                  </button>
                )}
                {cancelButton && (
                  <button
                    onClick={cancelButton.onClick}
                    disabled={cancelButton.disabled}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {cancelButton.text}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
