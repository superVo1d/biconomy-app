import { Suspense } from "react";
import dynamic from "next/dynamic";

const Index = () => {
  const SocialLoginDynamic = dynamic(
      () => import("../components/Auth").then((res) => res.default),
      {
          ssr: false
      }
  );

  return (
      <>
          <Suspense fallback={<div>Loading...</div>}>
              <SocialLoginDynamic />
          </Suspense>
      </>
  )
}

export default Index;
