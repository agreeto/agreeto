import { signIn } from "next-auth/react";
import Image from "next/image";
import agreetoLogo from "../../assets/icon512.png";

import { Button, GoogleLogo, MicrosoftLogo, Spinner } from "@agreeto/ui";
import { type GetServerSideProps, type NextPage } from "next";
import { trpc } from "../../utils/trpc";
import { Membership } from "@agreeto/api/types";
import { useRouter } from "next/router";
import { FaStripe } from "react-icons/fa";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const searchParams = new URLSearchParams(ctx.req.url?.split("?")[1]);
  const callbackUrl = searchParams.get("callbackUrl");

  // See if we're coming from an oauth provider
  const origin = ctx.req.headers.referer;
  const fromOAuth =
    origin?.includes("google") ||
    origin?.includes("live") ||
    origin?.includes("microsoft");

  // Redirect to the callbackUrl if we're coming from an OAuth provider
  if (fromOAuth && callbackUrl) {
    return { redirect: { destination: callbackUrl, permanent: false } };
  }
  return { props: {} };
};

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
          onClick={() => upgrade()}
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
    <div className="flex h-screen items-center justify-center text-gray-600">
      <div className="max-w-md space-y-4 rounded-xl px-16 py-12 text-center shadow-2xl">
        <h1 className="text-3xl font-semibold">Welcome to AgreeTo</h1>
        <div className="relative mx-auto h-24 w-24">
          <Image src={agreetoLogo} alt="AgreeTo" layout="fill" />
        </div>

        {isLoading ? (
          <div className="my-8 mx-auto h-12 w-12">
            <Spinner />
          </div>
        ) : !forbidden ? (
          <SignInContent />
        ) : (
          <UpgradeContent />
        )}

        {/* Description */}
        <div className="text-xs">
          By entering this website, I accept Privacy Policy and Terms and
          Conditions
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
