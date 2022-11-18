import { Spinner } from "@agreeto/ui";
import { Menu } from "@headlessui/react";
import { RadixColor } from "@prisma/client";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { FC } from "react";
import React, { useState } from "react";
import { AiOutlineMore } from "react-icons/ai";
import { HiCheckCircle, HiOutlineTrash } from "react-icons/hi";
import { RiMore2Line } from "react-icons/more";
import OutsideClickHandler from "react-outside-click-handler";
// import type { IAccount } from "services/types";
import tailwindConfig from "tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

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
      <div className="h-30 border border-[#F0F1F2] rounded-lg pl-9 pr-6 py-6 flex space-x-4 justify-between">
        {/* Info */}
        <div className="flex items-center space-x-7">
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
          <div>
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
        </div>
        {/* Actions */}
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

export default AccountCard;
