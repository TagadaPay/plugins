import React from "react"

export function PressBar() {
  const mediaOutlets = ["USA TODAY", "POPSUGAR", "Beauty", "NBC NEWS"]

  return (
    <div className="w-full bg-amber-200 py-3 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <React.Fragment key={i}>
              {mediaOutlets.map((outlet, index) => (
                <span key={index} className="text-gray-800 text-sm md:text-base font-semibold mx-6">
                  {outlet}
                </span>
              ))}
            </React.Fragment>
          ))}
      </div>
    </div>
  )
}
