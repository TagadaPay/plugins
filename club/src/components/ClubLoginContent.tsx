import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PluginConfig } from "@/types/plugin-config";
import { useLogin, usePluginConfig } from "@tagadapay/plugin-sdk/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

enum LoginStep {
  INITIAL = "initial",
  EMAIL = "email",
  CODE = "code",
}

interface ClubLoginContentProps {
  isAuthenticated: boolean;
}

function ClubLoginContent({ isAuthenticated }: ClubLoginContentProps) {
  const navigate = useNavigate();
  const { config } = usePluginConfig<PluginConfig>();
  const [isAnimating, setIsAnimating] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { isLoading: isLoginLoading, requestCode, verifyCode } = useLogin();

  const [loginStep, setLoginStep] = useState<LoginStep>(LoginStep.INITIAL);

  const onEnterClub = () => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error when submitting
    verifyCode(email, code)
      .then((res) => {
        if (!res?.success) {
          setError("Invalid verification code. Please try again.");
          return;
        }
        onEnterClub();
      })
      .catch(() => {
        setError("Failed to verify code. Please try again.");
      });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error when submitting
    requestCode(email)
      .then((res) => {
        if (!res?.success) {
          setError(
            "Failed to send verification code. Please check your email and try again."
          );
          return;
        }
        setLoginStep(LoginStep.CODE);
      })
      .catch(() => {
        setError("Failed to send verification code. Please try again.");
      });
  };

  const handleEnterClub = () => {
    if (!isAuthenticated) {
      setLoginStep(LoginStep.EMAIL);
      setError(null); // Reset error when starting login process
      return;
    }
    onEnterClub();
  };

  const texts = config.texts;
  const enterTexts = texts.enter;

  return (
    <>
      <div className="absolute inset-0 z-10 flex h-full w-full flex-col items-center justify-center overflow-hidden">
        {/* Mobile: Top Gate */}
        <motion.div
          initial={{ y: "-50%" }}
          animate={{ y: isAnimating ? "-100%" : "-50%" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-x-0 top-0 h-1/2 dark:bg-white/90 md:hidden bg-[var(--primary-color)] opacity-95"
        />

        {/* Mobile: Bottom Gate */}
        <motion.div
          initial={{ y: "50%" }}
          animate={{ y: isAnimating ? "100%" : "50%" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-x-0 bottom-0 h-1/2 dark:bg-white/90 md:hidden bg-[var(--primary-color)] opacity-95"
        />

        {/* Desktop: Left Gate */}
        <motion.div
          initial={{ x: "-50%" }}
          animate={{ x: isAnimating ? "-100%" : "-50%" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-y-0 left-0 hidden w-1/2 dark:bg-white/90 md:block bg-[var(--primary-color)] opacity-95"
        />

        {/* Desktop: Right Gate */}
        <motion.div
          initial={{ x: "50%" }}
          animate={{ x: isAnimating ? "100%" : "50%" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-y-0 right-0 hidden w-1/2 dark:bg-white/90 md:block bg-[var(--primary-color)] opacity-95"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isAnimating ? 0 : 1,
            y: isAnimating ? -20 : 0,
          }}
          transition={{ duration: 0.8 }}
          className="relative z-20 space-y-4 px-4 text-center"
        >
          <div className="relative">
            {/* Powered By Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isAnimating ? 0 : 1,
                y: isAnimating ? -20 : 0,
              }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute -top-4 right-0 z-30"
            >
              <div className="rounded-full px-3 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm bg-[var(--secondary-color)]">
                {enterTexts.poweredBy}
                Powered By
              </div>
            </motion.div>
            <h1 className="text-5xl font-bold drop-shadow-sm sm:text-6xl md:text-8xl text-[var(--primary-color)]">
              {enterTexts.title}
            </h1>
          </div>
          <p className="text-lg font-medium sm:text-xl md:text-2xl text-[var(--primary-color)]">
            {enterTexts.subtitle}
          </p>

          <AnimatePresence mode="wait">
            {loginStep === LoginStep.EMAIL ? (
              <motion.div
                key="email-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="mx-auto mt-12 w-full max-w-sm"
              >
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <Input
                    type="email"
                    placeholder={enterTexts.loginEmailPlaceholder}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null); // Reset error when typing
                    }}
                    className="border-2 bg-white text-center border-[var(--primary-color)]"
                  />
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        key="email-error"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-md border border-red-200 bg-red-50 p-2"
                      >
                        <p className="text-center text-sm font-medium text-red-600">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button
                    type="submit"
                    className="w-full border-2 transition-all duration-300 bg-[var(--primary-color)] hover:bg-[var(--primary-color)] border-[var(--primary-color)] text-white"
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading
                      ? enterTexts.sendingCode
                      : enterTexts.sendCode}
                  </Button>
                </form>
              </motion.div>
            ) : loginStep === LoginStep.CODE ? (
              <motion.div
                key="code-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="mx-auto mt-12 w-full max-w-sm"
              >
                <form onSubmit={handleCodeSubmit} className="space-y-3">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder={enterTexts.loginCodePlaceholder}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError(null); // Reset error when typing
                    }}
                    className="h-14 border-2 bg-white text-center font-mono text-2xl border-[var(--primary-color)] tracking-[0.5em] pl-2"
                  />
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        key="code-error"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-md border border-red-200 bg-red-50 p-2"
                      >
                        <p className="text-center text-sm font-medium text-red-600">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button
                    type="submit"
                    className="w-full border-2 transition-all duration-300 bg-[var(--primary-color)] hover:bg-[var(--primary-color)] border-[var(--primary-color)] text-white"
                    disabled={code.length !== 4 || isLoginLoading}
                  >
                    {isLoginLoading
                      ? enterTexts.verifyingCode
                      : enterTexts.verifyCode}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="enter-button"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="mt-12 flex justify-center"
              >
                <Button
                  variant="default"
                  className="border-2 px-6 py-2.5 text-base font-semibold transition-all duration-300 hover:bg-opacity-90 hover:bg-[var(--primary-color)] sm:px-8 sm:py-3 sm:text-lg bg-[var(--primary-color)] border-[var(--primary-color)] text-white"
                  onClick={handleEnterClub}
                  disabled={isAnimating || isLoginLoading}
                >
                  {enterTexts.enterButton}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}

export default ClubLoginContent;
