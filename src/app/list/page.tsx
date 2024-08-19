'use client'

import { SPListComponent } from "@/components/SPListComponent";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <SPListComponent />
      <span>
        <Link href={`/`}>home</Link>
      </span>
    </>
  );
}