"use client";
import dynamic from "next/dynamic";

const Parser = dynamic(() => import("./parser"), {
  ssr: false,
});

export const ParserLayout = () => {
  return <Parser />;
};
