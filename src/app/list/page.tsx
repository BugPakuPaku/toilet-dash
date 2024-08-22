'use client'

import { SPListComponent } from "@/components/SPListComponent";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <div className="absolute h-screen z-0">
      <div className="flex flex-col h-full">
        <SPListComponent />
      </div>
      <div className='fixed z-10 top-0 right-0 bg-white rounded-[2px] shadow-md m-[10px]'>
        <Link href={`/`}><Image className="p-[5px]" width={40} height={40} src="/home.svg" alt="home"/></Link>
      </div>
      <div className='fixed z-10 top-[50px] right-0 bg-white rounded-[2px] shadow-md m-[10px]'>
        <Link href={`/request`}><Image className="p-[5px]" width={40} height={40} src="/plus.svg" alt="request"/></Link>
      </div>
    </div>
  );
}