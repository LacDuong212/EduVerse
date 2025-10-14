import elementImg from "@/assets/images/02.svg";

export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <div className="hidden lg:flex flex-col justify-center items-center w-full lg:w-1/2 bg-blue-50 p-10 text-center">
        <h2 className="text-4xl font-bold text-gray-800">
          Welcome to our largest community
        </h2>
        <p className="text-gray-600 mt-2">Let’s learn something new today!</p>
        <img src={elementImg} alt="element" className="mt-10 w-180" />
      </div>

      <div className="flex justify-center items-center w-full lg:w-1/2 p-6 lg:p-12">
        <div className="w-full max-w-4/6">
          {children}
        </div>
      </div>
    </main>
  );
}
