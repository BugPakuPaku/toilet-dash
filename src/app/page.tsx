'use client'

import MapProvider from "@/providers/map-provider";
import { PCMapComponent } from "@/components/PCMapComponent";
import { SPMapComponent } from "@/components/SPMapComponent";
import Box from '@mui/material/Box';
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <MapProvider>
      <Box sx={{ display: { xs: 'block', md: 'none' }}}>
        <SPMapComponent/>
        <span className="absolute z-[1] top-[50px] right-0 bg-white rounded-[2px] shadow-md m-[10px]">
          <Link href={`/list`}><Image className="p-[5px]" width={40} height={40} src="/menu.svg" alt="menu"/></Link>
        </span>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' }}}>
        <PCMapComponent/>
      </Box>
    </MapProvider>
  );
}