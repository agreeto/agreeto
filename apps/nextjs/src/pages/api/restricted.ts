import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerSession } from "@agreeto/auth";

const restricted = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession({ req, res });

  if (session) {
    res.send({
      content:
        "This is protected content. You can access this content because you are signed in.",
    });
  } else {
    res.send({
      error: "You must be sign in to view the protected content on this page.",
    });
  }
};

export default restricted;
