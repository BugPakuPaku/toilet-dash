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
        <span>
          <Link href={`/list`}>list</Link>
        </span>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' }}}>
        <PCMapComponent/>
      </Box>
    </MapProvider>
  );
}