import { ReactNode } from "react";

interface MainContainerProps {
  firstChild: ReactNode;
  secondChild: ReactNode;
}

function MainContainer({ firstChild, secondChild }: MainContainerProps) {
  return (
    <div className="grid divide-[var(--checkout-border-color)] flex-grow self-stretch max-lg:mx-auto max-lg:max-w-[580px] lg:grid-cols-[minmax(min-content,calc(50%+calc(calc(58rem-48rem)/2)))_1fr] lg:divide-x [&>div>div]:p-[21px] lg:[&>div>div]:p-[38px]">
      <div className="space-y-8 max-lg:mx-auto lg:ml-auto">{firstChild}</div>
      <div className="space-y-6 lg:bg-[var(--checkout-panel-bg)]">{secondChild}</div>
    </div>
  );
}

export default MainContainer;
