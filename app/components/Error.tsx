import IconError from "./IconError";

interface ErrorProps {
  error: string;
}

const Error = ({ error }: ErrorProps) => {
  return (
    <div>
      <div className="text-gray-100 text-center relative">
        <IconError />
        <div className="text-gray-700 absolute top-0 left-0 w-full h-full flex items-center content-center flex-col justify-center flex-wrap">
          <div className="text-base text-red-400">Something went wrong.</div>
          <div className="text-xs">Error message: {error}</div>
        </div>
      </div>
    </div>
  );
};

export default Error;
