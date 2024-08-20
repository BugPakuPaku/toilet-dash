'use client'

import { SPListComponent } from "@/components/SPListComponent";
import Link from "next/link";

export default function Page() {
  return (
    <div className="absolute h-screen z-0">
      <div className="flex flex-col h-full">
        <SPListComponent />
      </div>
      <div className='fixed z-10 top-0 right-0 bg-white rounded-[2px] shadow-md m-[10px]'>
        <Link href={`/`}><img className="w-[40px] p-[5px]" src="/home.svg"/></Link>
      </div>
      <div className='fixed z-10 top-[50px] right-0 bg-white rounded-[2px] shadow-md m-[10px]'>
        <Link href={`/request`}><img className="w-[40px] p-[5px]" src="/plus.svg"/></Link>
      </div>
    </div>
  );
}