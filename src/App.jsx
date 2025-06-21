import { useCallback, useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { TOTP } from "totp-generator";
import "./App.css";

function App() {
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [progress, setProgress] = useState({
    timeout: 0,
    degree: 0,
  });

  const timeoutRef = useRef(null);

  // Function to generate token
  const generateToken = useCallback(
    (newSecret) => {
      try {
        const totpToken = TOTP.generate(newSecret);
        setToken(totpToken);
        const currentTime = new Date().getTime();
        let timeRemaining = Math.floor(totpToken.expires - currentTime);
        setProgress({
          timeout: timeRemaining,
          degree: 360,
        });
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setInterval(() => {
          setProgress((prev) => {
            const timeout = Math.max(0, prev.timeout - 100);
            if (timeout == 0) {
              generateToken(secret);
            }
            const degree = (360 / 30000) * timeout;
            return { timeout, degree };
          });
        }, 100);
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    },
    [secret]
  );

  useEffect(() => {
    if (secret !== "") {
      localStorage.setItem("secret", secret);
    } else {
      const storedSecret = localStorage.getItem("secret");
      if (storedSecret) {
        setSecret(storedSecret);
        generateToken(storedSecret);
      }
    }
    return () => {};
  }, [secret, generateToken]);

  const resetTotp = () => {
    clearTimeout(timeoutRef.current);
    setProgress({
      timeout: 0,
      degree: 0,
    });
    setToken({});
  };

  const handleOnSubmit = () => {
    resetTotp();
    if (secret !== "") {
      generateToken(secret);
    }
  };

  return (
    <>
      <div className="container">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center width-[350px] rounded-4xl border-2 border-violet-300 p-4 bg-white z-0">
            <h1 className="text-xl text-violet-600 font-bold py-3 mb-3 uppercase">
              TOTP Generator
            </h1>
            <div className="px-3">
              <label htmlFor="secret" className="text-zinc-500">
                Enter Secret Key:
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="secret"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter your secret key"
                  className="p-2 pr-15 border border-violet-200 rounded-md text-center text-zinc-600 w-[300px]"
                />
                <button
                  className="bg-violet-100 text-violet-500 border border-violet-300 hover:bg-violet-200 hover:text-violet-600 rounded-md px-3 py-1 my-1 top-0 right-0 absolute mr-1"
                  onClick={handleOnSubmit}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-right"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 12l14 0" />
                    <path d="M13 18l6 -6" />
                    <path d="M13 6l6 6" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex justify-center mt-6 mb-3">
              <div
                className="flex flex-col items-center justify-center gradient-border bg-white"
                style={{
                  "--border-conic-degree": `${progress.degree.toFixed(2)}deg`,
                }}
              >
                <div className="text-4xl text-violet-600 font-bold tracking-widest">
                  {token.otp ?? "------"}
                </div>
                {progress.timeout >= 0 && (
                  <div className="text-sm text-zinc-500">
                    Expires in {Math.floor(progress.timeout / 1000)} seconds
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={true}
      />
    </>
  );
}

export default App;
