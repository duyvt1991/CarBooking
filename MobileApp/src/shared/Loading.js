import { FaSpinner } from "react-icons/fa";

function Loading() {
  return (
    <div className="fixed w-full h-full inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-[3000]">
        <FaSpinner className="animate-spin text-4xl text-white" />
    </div>
  );
}

export default Loading;