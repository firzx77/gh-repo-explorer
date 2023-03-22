import Icon from "./Icon";

const Init = () => {
  return (
    <div>
      <div className="text-gray-100 text-center relative">
        <Icon />
        <div className="text-gray-700 absolute top-0 left-0 w-full h-full flex items-center content-center flex-col justify-center flex-wrap">
          <div className="text-base">Enter github username and hit enter.</div>
        </div>
      </div>
    </div>
  );
};

export default Init;
