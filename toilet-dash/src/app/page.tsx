'use client'

import MapProvider from "@/providers/map-provider";
import { MapComponent, PCMapComponent, SPMapComponent } from "@/components/MapComponent";
import Box from '@mui/material/Box'

export default function Page({pc, sp}: Props) {
  return (
    <MapProvider>
      <Box sx={{ display: { xs: 'block', md: 'none' }}}>
        <SPMapComponent/>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' }}}>
        <PCMapComponent/>
      </Box>
    </MapProvider>
  );
}