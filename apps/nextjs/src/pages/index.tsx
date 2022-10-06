import type {
  GetServerSidePropsContext,
  NextPage,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import type { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "@acme/api";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { useSession } from "next-auth/react";

const PostCard: React.FC<{
  post: inferProcedureOutput<AppRouter["post"]["all"]>[number];
}> = ({ post }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-800">{post.title}</h2>
      <p className="text-gray-600">{post.content}</p>
    </div>
  );
};

const Home: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ session: sessionSSR }) => {
  const postQuery = trpc.post.all.useQuery();
  const session = useSession();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container flex flex-col items-center justify-center min-h-screen p-4 mx-auto">
        {/* AUTHENTICATION STATUS */}
        {session.data?.user ? (
          <>
            <h4 className="text-xl">Signed in as {session.data.user.email}</h4>
            <p>You can log out via the extension</p>
          </>
        ) : (
          <h4>You&apos;re not signed in. Please use the extension to do so!</h4>
        )}
        {/* /AUTHENTICATION STATUS */}
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
          Create <span className="text-purple-300">T3</span> App
        </h1>
        <div className="flex items-center justify-center w-full pt-6 text-2xl text-blue-500">
          {postQuery.data ? (
            <div className="flex flex-col gap-4">
              {postQuery.data?.map((p) => {
                return <PostCard key={p.id} post={p} />;
              })}
            </div>
          ) : (
            <p>Loading..</p>
          )}
        </div>
      </main>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  console.log("--gSSP--");
  console.dir(session);
  console.log("--gSSP--");

  return {
    props: {
      session,
    },
  };
}

export default Home;
