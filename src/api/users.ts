import { cloudio } from "./cloudio";

export async function insertUser(user: {
  id: string;
  name: string;
  email: string;
  password: string;
}) {
  const body = {
    ExpUsersAlias: {
      ds: "ExpUsers",
      data: [
        {
          _rs: "I",
          ...user,
        },
      ],
    },
  };

  const res = await cloudio.post("", body); // POST https://dev.cloudio.io/v1/api
  return res;
}