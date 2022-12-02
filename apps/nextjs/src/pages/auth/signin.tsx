import { signIn } from "next-auth/react";
import { Button, GoogleLogo, MicrosoftLogo, Spinner } from "@agreeto/ui";
import { type GetServerSideProps, type NextPage } from "next";
import { trpc } from "../../utils/trpc";
import { Membership } from "@agreeto/api/types";
import { useRouter } from "next/router";
import { FaStripe } from "react-icons/fa";
import { Card } from "../../components/card";
import { appRouter, createContext } from "@agreeto/api";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  console.log("{getServerSideProps]");
  const searchParams = new URLSearchParams(ctx.req.url?.split("?")[1]);
  const callbackUrl = searchParams.get("callbackUrl");

  // See if we're coming from an oauth provider
  const origin = ctx.req.headers.referer;
  const fromOAuth =
    origin?.includes("google") ||
    origin?.includes("live") ||
    origin?.includes("microsoft") ||
    origin?.includes("stripe");

  console.log("callbackUrl", callbackUrl);
  console.log("fromOAuth", fromOAuth);
  // This means we have completed the sign in flow
  if (fromOAuth && callbackUrl) {
    console.log("we have completed the sign in flow");
    // @ts-expect-error - Not sure how to type this to accept GetServerSidePropsContext across packages - but they are compatible
    const trpcCtx = await createContext(ctx);
    const caller = appRouter.createCaller(trpcCtx);

    // Check if user signed in for the first time,
    // if so, redirect to starting a trial
    console.log("FREE? ", trpcCtx?.user?.membership === "FREE");
    console.log("hasTrialed? ", !trpcCtx?.user?.hasTrialed);
    console.log("not from stripe? ", !origin?.includes("stripe"));
    if (
      trpcCtx?.user?.membership === "FREE" &&
      !trpcCtx?.user?.hasTrialed &&
      !origin?.includes("stripe")
    ) {
      console.log("i'd like to start a trial and want to redirect to stripe");
      console.log("request stripe now...");
      const { checkoutUrl } = await caller.stripe.checkout.create({
        plan: "PRO",
        period: "monthly",
        // come back here after checkout is complete to finish the sign in flow
        success_url: `https://${ctx.req.headers.host}/${ctx.req.url}`,
      });
      console.log("checkoutUrl", checkoutUrl);
      return { redirect: { destination: checkoutUrl, permanent: false } };
    }

    // Else, redirect to the callbackUrl
    return { redirect: { destination: callbackUrl, permanent: false } };
  }

  // Here we are coming straight from the app, and should
  // continue the sign in flow
  return { props: {} };
};

/**
 * This protects the page if the user manually inputs the URL
 * in the browser, even though they're on the FREE plan.
 */
const UpgradeContent = () => {
  const router = useRouter();
  const { mutate: upgrade } = trpc.stripe.checkout.create.useMutation({
    onSuccess({ checkoutUrl }) {
      router.push(checkoutUrl);
    },
  });

  return (
    <>
      <div className="text-sm">
        Free users are limited to 1 linked account. To add more, please upgrade
        to AgreeTo Pro.
      </div>
      <div className="py-8 space-y-2 text-sm">
        <Button
          className="flex items-center justify-center h-12 gap-2 w-72"
          variant="glass"
          onClick={() => upgrade({ plan: Membership.PRO, period: "monthly" })}
        >
          <FaStripe className="h-8 w-8 text-[#6259FA]" />
          <span className="text-gray-900 text-bold">Go Pro</span>
        </Button>
      </div>
    </>
  );
};

const SignInContent = () => {
  return (
    <>
      <div className="text-sm">
        With AgreeTo you can share your availability with others in three clicks
      </div>
      <div className="py-8 space-y-2 text-sm">
        {/* Google login button */}
        <Button
          className="flex items-center justify-center h-12 gap-2 w-72"
          variant="glass"
          onClick={() => signIn("google")}
        >
          <GoogleLogo className="w-6 h-6" />
          <span>Sign in with Google</span>
        </Button>

        {/* Outlook login button */}
        <Button
          variant="glass"
          className="flex items-center justify-center h-12 gap-2 w-72"
          onClick={() => signIn("azure-ad")}
        >
          <MicrosoftLogo className="w-6 h-6" />
          <span>Sign in with Microsoft</span>
        </Button>
      </div>
    </>
  );
};

const SignInPage: NextPage = () => {
  const { data: user, isLoading } = trpc.user.myAccounts.useQuery(undefined, {
    retry: false,
  });
  const forbidden =
    !isLoading &&
    user?.membership === Membership.FREE &&
    user?.accounts.length >= 1;

  return (
    <div className="flex items-center justify-center h-screen">
      <Card disclaimer="By entering this website, I accept Privacy Policy and Terms and Conditions">
        <div className="flex flex-col items-center justify-center w-full h-56">
          {isLoading ? (
            <div className="w-12 h-12">
              <Spinner />
            </div>
          ) : !forbidden ? (
            <SignInContent />
          ) : (
            <UpgradeContent />
          )}
        </div>
      </Card>
    </div>
  );
};

export default SignInPage;
