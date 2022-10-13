import { NextResponse } from "next/server";
import type { NextRequest, NextMiddleware } from "next/server";

export const middleware: NextMiddleware = (request) => {
  // setting CORS headers to allow our clients
  console.log("FROM MIDDLEWARE: The request origin -> ");
  console.dir(request.headers, { depth: 10 });
  const response = NextResponse.next();
  response.headers.set(
    "Access-Control-Allow-Origin",
    `https://${process.env.NEXT_PUBLIC_EXTENSION_ID}.chromiumapp.org`
    // getAccessControlAllowOrigin()
    // getAccessControlAllowOrigin(request)
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,DELETE,PUT,UPDATE"
  );
  return response;
};

const getAllowedOrigins = () => {
  if (!process.env.VERCEL_URL)
    throw new Error("CORS: unable to get allowed origins without vercel url");

  return [
    `https://${process.env.NEXT_PUBLIC_EXTENSION_ID}.chromiumapp.org`,
    process.env.VERCEL_URL,
  ];
};

const getAccessControlAllowOrigin = () => {
  if (process.env.NODE_ENV === "development") {
    // we allow anything in dev
    return `https://${process.env.NEXT_PUBLIC_EXTENSION_ID}.chromiumapp.org`;
    // return "*";
  } else if (process.env.NODE_ENV === "production") {
    // explicitly allow ext (allowing env.VERCEL_URL not necessary as same origin is always allowed)
    return `https://${process.env.NEXT_PUBLIC_EXTENSION_ID}.chromiumapp.org`;
  } else {
    throw new Error(
      "Could not determine Access-Control-Allow-Origin from NODE_ENV var"
    );
  }
};

// const getAccessControlAllowOrigin = (req: NextRequest) => {
//   if (process.env.NODE_ENV === "development") {
//     // we allow anything in dev
//     return "*";
//   } else if (process.env.NODE_ENV === "production") {
//     // we allow only ALLOWED_ORIGINS in prod, checking:
//     const host = req.headers.get("host");
//     if (!host) throw new Error(`CORS: Unspecified origin`);
//     const ALLOWED_ORIGINS = getAllowedOrigins();
//     if (!Boolean(ALLOWED_ORIGINS.indexOf(host))) {
//       throw new Error(`CORS: Host not supported: ${host}`);
//     }
//     // ✅ OK
//     return host;
// } else {
//   throw new Error(
//     "Could not determine Access-Control-Allow-Origin from NODE_ENV var"
//   );
// }
// };
