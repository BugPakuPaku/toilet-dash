"use client";

import React, {ReactNode} from "react";
import {Libraries, useJsApiLoader} from '@react-google-maps/api';

const libraries = ['places', 'drawing', 'geometry'];

export default function MapProvider({children}: { children: ReactNode}) {
  const {isLoaded: scriptLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: process.env.GOOGLE_MAP_API as string,
    libraries: libraries as Libraries,
  });

  if(loadError) return <p>Encounted error while loading google maps</p>

  if(!scriptLoaded) return <p>Map Script is loading ...</p>

  return children;
}