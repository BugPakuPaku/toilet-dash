'use client'

import MapProvider from "@/providers/map-provider";
import { MapComponent, PCMapComponent, SPMapComponent, SPListComponent } from "@/components/MapComponent";
import Box from '@mui/material/Box'
import Link from "next/link"

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