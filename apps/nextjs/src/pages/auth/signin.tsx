import { signIn } from "next-auth/react";
import { Button, GoogleLogo, MicrosoftLogo, Spinner } from "@agreeto/ui";
import { type GetServerSideProps, type NextPage } from "next";
import { trpc } from "../../utils/trpc";
import { Membership } from "@agreeto/api/types";
import { useRouter } from "next/router";
import { FaStripe } from "react-icons/fa";
import { Card } from "../../components/card";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const searchParams = new URLSearchParams(ctx.req.url?.split("?")[1]);
  const callbackUrl = searchParams.get("callbackUrl");

  // See if we're coming from an oauth provider
  const origin = ctx.req.headers.referer;
  const fromOAuth =
    origin?.includes("google") ||
    origin?.includes("live") ||
    origin?.includes("microsoft");

  if (fromOAuth && callbackUrl) {
    // This means we have completed the sign in flow, redirect to app
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
      <div className="space-y-2 py-8 text-sm">
        <Button
          className="flex h-12 w-72 items-center justify-center gap-2"
          variant="glass"
          onClick={() => upgrade({ plan: Membership.PRO, period: "monthly" })}
        >
          <FaStripe className="h-8 w-8 text-[#6259FA]" />
          <span className="text-bold text-gray-900">Go Pro</span>
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
      <div className="space-y-2 py-8 text-sm">
        {/* Google login button */}
        <Button
          className="flex h-12 w-72 items-center justify-center gap-2"
          variant="glass"
          onClick={() => signIn("google")}
        >
          <GoogleLogo className="h-6 w-6" />
          <span>Sign in with Google</span>
        </Button>

        {/* Outlook login button */}
        <Button
          variant="glass"
          className="flex h-12 w-72 items-center justify-center gap-2"
          onClick={() => signIn("azure-ad")}
        >
          <MicrosoftLogo className="h-6 w-6" />
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
    <div className="flex h-screen items-center justify-center">
      <Card disclaimer="By entering this website, I accept Privacy Policy and Terms and Conditions">
        <div className="flex h-56 w-full flex-col items-center justify-center">
          {isLoading ? (
            <div className="h-12 w-12">
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
