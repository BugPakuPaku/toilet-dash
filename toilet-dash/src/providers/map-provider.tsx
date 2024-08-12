"use client";

import React, {ReactNode} from "react";
import {Libraries, useJsApiLoader} from '@react-google-maps/api';

const libraries = ['places', 'drawing', 'geometry'];

export default function MapProvider({children}: { children: ReactNode}) {
  const {isLoaded: scriptLoaded, loadError} = useJsApiLoader({
<<<<<<< HEAD
    // googleMapsApiKey: process.env.GOOGLE_MAP_API as string,
    googleMapsApiKey: "AIzaSyB9vrf-EEhzykteTdQU6CNLxJTs084L4Yo",
=======
    googleMapsApiKey: process.env.GOOGLE_MAP_API_KEY as string,
>>>>>>> 31335ad70f1408ff68d3c20f0dfeab41e490f4ff
    libraries: libraries as Libraries,
  });

  if(loadError) return <p>Encounted error while loading google maps</p>

  if(!scriptLoaded) return <p>Map Script is loading ...</p>

  return children;
}