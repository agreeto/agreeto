import { Button, Spinner } from "@agreeto/ui";
import { Menu } from "@headlessui/react";
import { RadixColor } from "@prisma/client";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { FC } from "react";
import React, { useState } from "react";
import { AiOutlineMore } from "react-icons/ai";
import { HiCheckCircle, HiOutlineTrash, HiTrash } from "react-icons/hi";
import { RiMore2Line } from "react-icons/more";
import OutsideClickHandler from "react-outside-click-handler";
// import type { IAccount } from "services/types";
import tailwindConfig from "tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { trpcApi } from "~features/trpc/api/hooks";
import type { RouterOutputs } from "@agreeto/api";
import type { Maybe } from "@trpc/server";
import * as AlertDialog from '@radix-ui/react-alert-dialog';





const AccountCard: FC<{
  account: any;
  //   account: IAccount;
}> = ({ account }) => {
  const initials = account.email.substring(0, 2).toLocaleUpperCase();
  const accountColor = account.color.color;
  const darkColor = account.color.darkColor;
  const optionsDropdownId = `options-dropdown-${account.id}`;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  //   const { data: colors } = useGetAccountColors({ staleTime: 60 * 60 * 1000 });
  // style the events
  //   const fullConfig = resolveConfig({
  //     ...tailwindConfig,
  //     content: ["./src/**/*.{html,js,ts,tsx}"],
  //   });

  // FIXME: make typesafe
  const colors: RadixColor[] = Object.keys(RadixColor);
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);

  //   const eventColor = fullConfig.theme?.colors[account?.eventColor];
  //   const { mutateAsync: updateAccount } = useUpdateAccount();
  //   const { mutateAsync: updatePrimaryAccount } = useUpdatePrimaryAccount();
  //   const { mutateAsync: removeAccount } = useRemoveAccount();

  //   const handleUpdateColor = async (colorId: string) => {
  //     if (colorId === account.color.id) return;

  //     setIsDropdownOpen(false);
  //     setUpdating(true);

  //     try {
  //       await updateAccount({ accountId: account.id, body: { colorId } });
  //       await Promise.all([
  //         queryClient.invalidateQueries([QUERY_KEY.GET_ACCOUNTS]),
  //         queryClient.invalidateQueries([QUERY_KEY.GET_EVENTS]),
  //       ]);
  //     } catch (error) {
  //       console.error(error);
  //     }

  //     setUpdating(false);
  //   };

  //   const handleDelete = async () => {
  //     setIsDropdownOpen(false);
  //     setShowDeleteModal(false);
  //     setUpdating(true);

  //     try {
  //       await removeAccount(account.id);
  //       await Promise.all([
  //         queryClient.invalidateQueries([QUERY_KEY.GET_ACCOUNTS]),
  //         queryClient.invalidateQueries([QUERY_KEY.GET_EVENTS]),
  //       ]);
  //     } catch (error) {
  //       console.error(error);
  //     }

  //     setUpdating(false);
  //   };

  //   const handlePrimaryAccountUpdate = async () => {
  //     setIsDropdownOpen(false);
  //     setUpdating(true);

  //     try {
  //       await updatePrimaryAccount({ body: { newAccountId: account.id } });
  //       await Promise.all([
  //         queryClient.invalidateQueries([QUERY_KEY.GET_ACCOUNTS]),
  //         queryClient.invalidateQueries([QUERY_KEY.GET_EVENTS]),
  //       ]);
  //     } catch (error) {
  //       console.error(error);
  //     }

  //     setUpdating(false);
  //   };

  //   const optionsDropdown = (
  //     <OutsideClickHandler
  //       onOutsideClick={(e: any) => {
  //         // This check is put here to prevent unexpexted closes in the extension
  //         if (e.path?.find((p: any) => p.id === optionsDropdownId)) {
  //           return;
  //         }
  //         setIsDropdownOpen(false);
  //       }}
  //     >
  //       <Menu
  //         as="div"
  //         className="relative inline-block text-left"
  //         id={optionsDropdownId}
  //       >
  //         <div>
  //           <Menu.Button
  //             className="flex items-center justify-center w-8 h-8 cursor-pointer hover:bg-gray-100 hover:rounded-full"
  //             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
  //           >
  //             <AiOutlineMore className="w-5 h-5" />
  //           </Menu.Button>
  //         </div>
  //         {isDropdownOpen && (
  //           <Menu.Items
  //             className="absolute right-0 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg w-52 ring-1 ring-black ring-opacity-5 focus:outline-none"
  //             static
  //           >
  //             <Menu.Item>
  //               <button
  //                 className="py-3 w-full px-4 border-b border-[#E3E5E8] font-medium flex space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:bg-gray-100"
  //                 disabled={!!account.isPrimary}
  //                 onClick={handlePrimaryAccountUpdate}
  //               >
  //                 <div>
  //                   <HiCheckCircle className="w-4 h-4" />
  //                 </div>
  //                 <div>Set as organizer</div>
  //               </button>
  //             </Menu.Item>

  //             <Menu.Item>
  //               <button
  //                 className={`py-3 w-full px-4 text-[#D90026] font-medium flex space-x-2 items-center ${
  //                   account.isPrimary
  //                     ? "cursor-not-allowed opacity-50"
  //                     : "hover:bg-gray-100"
  //                 }`}
  //                 disabled={!!account.isPrimary}
  //                 onClick={() => setShowDeleteModal(true)}
  //               >
  //                 <div>
  //                   <HiOutlineTrash className="w-4 h-4 fill-red-9" />
  //                 </div>
  //                 <div>Remove account</div>
  //               </button>
  //             </Menu.Item>
  //           </Menu.Items>
  //         )}
  //       </Menu>
  //     </OutsideClickHandler>
  //   );

  return (
    <Tooltip.Provider>
      <div className="flex justify-between py-6 pr-6 space-x-4 border rounded-lg h-30 border-mauve-6 pl-9">
        {/* Info */}
        <div className="flex items-center justify-between w-full space-x-4">
          {/* Avatar */}
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{
              backgroundColor: accountColor,
              color: darkColor,
            }}
          >
            {initials}
          </div>
          {/* Email & Colors */}
          <div className="flex-grow">
            <div>{account.email}</div>
            <div className="flex pt-4 space-x-3">
              {colors?.map((color, ix) => {
                // const isSelected = account.color.id === id;

                return (
                  <div
                    key={ix}
                    className="relative w-8 h-8 border rounded cursor-pointer"
                    // onClick={() => handleUpdateColor(id)}
                    style={{
                      backgroundColor: color,
                      //   borderColor: isSelected ? darkColor : color,
                    }}
                  >
                    {/* {isSelected && (
                      <div className="absolute flex bottom-1 right-1">
                        <span className="checkmark">
                          <div
                            className="checkmark_circle"
                            style={{ backgroundColor: darkColor }}
                          ></div>
                          <div
                            className="checkmark_stem"
                            style={{ backgroundColor: color }}
                          ></div>
                          <div
                            className="checkmark_kick"
                            style={{ backgroundColor: color }}
                          ></div>
                        </span>
                      </div>
                    )} */}
                  </div>
                );
              })}
              {updating && <Spinner />}
            </div>
          </div>
        {/* Actions */}
        <DropdownMenuDemo account={account} container={container}/>
        </div>
        {/* <div>
          <div className="flex items-center space-x-5">
            {account.isPrimary && (
              <Tooltip.Root delayDuration={300}>
                <Tooltip.Trigger>
                  <div className="text-white bg-[#002F76] text-xs px-2 py-1 rounded cursor-help">
                    Organizer
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content align="end" side="bottom" sideOffset={10}>
                  <div
                    className="px-5 py-6 bg-white rounded-lg shadow-2xl"
                    style={{ width: "350px" }}
                  >
                    <div className="font-semibold">Organizer Account</div>
                    <div className="pt-2">
                      The selected account will be the organizer for all events
                      created.
                    </div>
                  </div>
                </Tooltip.Content>
              </Tooltip.Root>
            )}
            {optionsDropdown}
          </div>
        </div> */}
      </div>
        <div ref={setContainer} className="relative z-10"></div>
      {/* <Modal
        open={showDeleteModal}
        title="Are you sure you want to remove this calendar from AgreeTo?"
        primaryButton={{
          text: "Remove",
          onClick: handleDelete,
          type: "danger",
        }}
        cancelButton={{
          text: "Cancel",
          onClick: () => setShowDeleteModal(false),
        }}
      /> */}
    </Tooltip.Provider>
  );
};

type Account = RouterOutputs["account"]["me"][number];
// why does this break the app?
const DropdownMenuDemo = ({account, container}:{account: Account, container: HTMLDivElement}) => {
    const utils = trpcApi.useContext();

    const { mutate: changePrimary } = trpcApi.account.changePrimary.useMutation({
        onSuccess() {
          utils.account.primary.invalidate();
        },
      });
  return (
    <DropdownMenu.Root >
      {/* <DropdownMenu.Trigger > */}
      <DropdownMenu.Trigger asChild> 
        <button className="flex items-center justify-center w-8 h-8 ml-auto cursor-pointer hover:bg-gray-100 hover:rounded-md" aria-label="Customise options">
           <AiOutlineMore className="w-6 h-6"/>
        </button>
        </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="absolute right-0 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg w-52 ring-1 ring-black ring-opacity-5 focus:outline-none" sideOffset={5} side="left" align="start">
          <DropdownMenu.Item asChild> 
                <button className="flex items-center w-full px-4 py-3 space-x-2 font-medium border-b border-mauve-6 disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:bg-gray-100"
                // disabled={!!account?.isPrimary}
                onClick={() => changePrimary({ id: account?.id })}
                >
                  <HiCheckCircle className="w-4 h-4" />
                <div>Set as organizer</div>
                </button>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
          <AlertDialog.Root>
        <AlertDialog.Trigger asChild>
        <div className={`py-3 w-full px-4 text-[#D90026] font-medium flex space-x-2 items-center ${
                  account?.isPrimary
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-gray-100"
                }`}
                // disabled={!!account.isPrimary}
                onClick={() => <></>}
                >
                  <HiTrash className="w-4 h-4" />
                <div>Remove account</div>
                </div>
        </AlertDialog.Trigger>
        <AlertDialog.Portal container={container}>
          <AlertDialog.Overlay className="fixed inset-0 transition-opacity bg-opacity-75 bg-mauveA-2"/>
          <AlertDialog.Content 
           className="fixed -translate-x-1/2 -translate-y-1/2 bg-white shadow-sm top-1/2 left-1/2 shadow-transparent l-1/2 "
          
          >
            <div className="sm:flex sm:items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="w-6 h-6 text-red-600"
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
                      Are you sure you want to remove this account?
                    </h3>
                    {/* <div className="mt-2">
                      <p className="text-sm text-gray-500">{description}</p>
                    </div> */}
                  </div>
                </div>
            <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
              <AlertDialog.Cancel asChild>
                <Button variant="glass">Cancel</Button>
              </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
                <Button variant="error" >Yes, delete account</Button>
            </AlertDialog.Action>
        </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

            
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};



const DialogDemo = () => (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button className="Button violet" size="large">
          Edit profile
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="DialogOverlay" />
        <AlertDialog.Content className="DialogContent">
          <AlertDialog.Title className="DialogTitle">Edit profile</AlertDialog.Title>
          <AlertDialog.Description className="DialogDescription">
            Make changes to your profile here. Click save when you're done.
          </AlertDialog.Description>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="name">
              Name
            </label>
            <input className="Input" id="name" defaultValue="Pedro Duarte" />
          </fieldset>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="username">
              Username
            </label>
            <input className="Input" id="username" defaultValue="@peduarte" />
          </fieldset>
          <div style={{ display: 'flex', marginTop: 25, justifyContent: 'flex-end' }}>
            <AlertDialog.Close asChild>
              <button className="Button green">Save changes</button>
            </AlertDialog.Close>
          </div>
          <AlertDialog.Close asChild>
            <button className="IconButton" aria-label="Close">
              <Cross2Icon />
            </button>
          </AlertDialog.Close>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
  

export default AccountCard;
