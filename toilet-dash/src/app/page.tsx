'use client'

import MapProvider from "@/providers/map-provider";
import { MapComponent, PCMapComponent, SPMapComponent } from "@/components/MapComponent";
import Box from '@mui/material/Box'
import Link from "next/link"

export default function Page() {
  return (
    <MapProvider>
      <Box sx={{ display: { xs: 'block', md: 'none' }}}>
        <SPMapComponent/>
        <span className="absolute z-[1] top-[5%] right-0 bg-white rounded-[2px] shadow-md m-[10px]">
          <Link href={`/list`}><img className="w-[40px]" src="/menu.svg"></img></Link>
        </span>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' }}}>
        <PCMapComponent/>
      </Box>
    </MapProvider>
  );
}