import { type NextPage } from "next";
import { Card } from "../../components/card.jsx";

const Success: NextPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card title="Payment Successful" disclaimer="You can close this window.">
        <div>
          <p className="text-xl font-semibold text-green-600">
            Thank you for your purchase!
          </p>
          <p className="text-lg text-gray-600">
            You can open your extension now and access your premium features.
          </p>
        </div>
      </Card>
    </div>
  );
};
export default Success;
