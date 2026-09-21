import Image from "next/image";
import ColumnActions from "@/app/(pages)/settings/steps/ManageUsers/ColumnActions";
import type { IActions } from "@/app/(pages)/settings/steps/ManageUsers/types";
import type { IUser } from "@/app/api/auth/get-self-user/types";
import type { IGridColDef } from "@/components/Table";

export function getColumns({ onAction }: IActions) {
  const columns: IGridColDef<IUser>[] = [
    {
      field: "displayName",
      header: "NAME",
    },
    {
      field: "email",
      header: "EMAIL",
    },
    {
      field: "photoURL",
      header: "AVATAR",
      render(value) {
        return (
          <>
            {value ? (
              <Image
                src={value as string}
                alt="avatar"
                width={28}
                height={28}
                style={{ borderRadius: "50%" }}
              />
            ) : (
              <p>N/A</p>
            )}
          </>
        );
      },
    },
    {
      field: "uid",
      header: "ACTIONS",
      render: (value) => <ColumnActions id={value as string} onAction={onAction} />,
    },
  ];

  return columns;
}
