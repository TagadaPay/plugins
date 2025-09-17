export function BenefitsBar() {
  const benefits = [
    "VOGUE",
    "FORBES",
    "BUZZFEED",
    "GLAMOUR",
    "HARPER'S BAZAAR",
    "ELLE",
    "COSMOPOLITAN",
    "MARIE CLAIRE",
    "ALLURE",
    "REFINERY29",
  ]

  const repeatedBenefits = [...benefits, ...benefits, ...benefits]

  return (
    <div className="w-full bg-gray-800 py-3 overflow-hidden whitespace-nowrap my-4">
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
          <span key={index} className="text-lg font-semibold mx-6 uppercase tracking-wide text-primary-color">
            {benefit}
          </span>
        ))}
      </div>
    </div>
  )
}
