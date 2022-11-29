import { type NextPage } from "next";
import { Card } from "../../components/card";

const Cancel: NextPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card title="Payment Cancelled" disclaimer="You can close this window.">
        <div>
          <p className="text-xl font-semibold text-green-600">
            Whoops, looks like you cancelled your payment.
          </p>
          <p className="text-lg text-gray-600">
            If it was unintentional, please try again via the extension.
          </p>
        </div>
      </Card>
    </div>
  );
};
export default Cancel;
