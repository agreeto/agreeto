import type { FC, ReactNode } from "react";

type Props = {
  title: string;
  content: ReactNode;
};

const PageWrapper: FC<Props> = ({ title, content }) => {
  return (
    <div className="flex justify-center">
      <div className="py-12 color-gray-600" style={{ width: "600px" }}>
        <div className="font-bold text-2xl mb-8">{title}</div>
        {content}
      </div>
    </div>
  );
};

export default PageWrapper;
