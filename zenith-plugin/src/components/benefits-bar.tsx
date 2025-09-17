import { useTagataConfig } from "../hooks/use-tagada-context";

export function BenefitsBar() {

  const { config } = useTagataConfig();
  const benefits = config?.content?.text?.en?.benefitsBar;

  const repeatedBenefits = [...(benefits || []), ...(benefits || []), ...(benefits || [])]

  return (
    <div className="w-full bg-gray-100 py-3 overflow-hidden whitespace-nowrap my-4 rounded-xl">
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%); /* Scroll half of the duplicated content */
          }
        }
        .animate-scroll {
          animation: scroll-left 30s linear infinite; /* Adjust duration as needed */
        }
      `}</style>
      <div className="inline-block animate-scroll">
        {repeatedBenefits.map((benefit, index) => (
          <span key={index} className="text-lg font-semibold mx-6 uppercase tracking-wide text-primary-dark">
            {benefit}
          </span>
        ))}
      </div>
    </div>
  )
}
