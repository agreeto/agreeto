import * as Dialog from "@radix-ui/react-dialog";
import React, { Dispatch, FC, SetStateAction } from "react";
import { useGetAccounts, useGetCurrentUser } from "services";
import googleIcon from "../../assets/google.svg";
import microsoftIcon from "../../assets/microsoft.svg";
import { API_URL } from "../../utils/constants";

const Account: FC<{
  container: any;
  onOpen: Dispatch<SetStateAction<boolean>>;
  isOpenDialog: boolean;
}> = ({ container, onOpen: setIsOpenDialog, isOpenDialog }) => {
  const { data: accounts } = useGetAccounts();

  return (
    <>
      <div>
        {accounts?.map((account) => (
          <div key={account.id}>{account.email}</div>
        ))}
      </div>
      <Dialog.Root
        open={isOpenDialog}
        onOpenChange={() => {
          setIsOpenDialog((prev) => !prev);
        }}
      >
        <Dialog.Trigger className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
          Add Account
        </Dialog.Trigger>
        <Dialog.Portal container={container}>
          <Dialog.Overlay className="flex flex-col items-center justify-center h-full bg-slate-50">
            <Dialog.Content className="flex flex-col items-center justify-center w-4/5 bg-white h-4/5">
              <AddAccount />
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default Account;

export const AddAccount = () => {
  const currentUserQuery = useGetCurrentUser();
  return (
    <div>
      <div className="pt-8 text-sm">
        <button
          className="h-12 button-outline w-72"
          disabled={currentUserQuery.status !== "success"}
          onClick={() =>
            window.open(
              `${API_URL}/api/auth/add-account?userId=${currentUserQuery.data?.id}&provider=GOOGLE&client=addin`,
              "_blank"
            )
          }
        >
          <div className="flex items-center justify-center">
            <img className="w-5 h-5 mr-2" src={googleIcon} />
            Sign in with Google
          </div>
        </button>
      </div>
      <div className="pt-8 text-sm">
        <button
          className="h-12 button-outline w-72"
          disabled={currentUserQuery.status !== "success"}
          onClick={() =>
            window.open(
              `${API_URL}/api/auth/add-account?userId=${currentUserQuery.data?.id}&provider=MICROSOFT&client=addin`,
              "_blank"
            )
          }
        >
          <div className="flex items-center justify-center">
            <img className="w-5 h-5 mr-2" src={microsoftIcon} />
            Sign in with Microsoft
          </div>
        </button>
      </div>
    </div>
  );
};
