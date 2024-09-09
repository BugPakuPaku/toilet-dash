'use client'

import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, Polyline } from "@react-google-maps/api";
import { GeoPoint } from "firebase/firestore";
import { Toilet } from "@/types";
import ToiletImage from "@/components/ToiletImage";
import { ToiletDetails } from './ToiletDetails';
import Link from 'next/link';
import Image from 'next/image';
import { toLatLng } from "@/util";
import Tooltip from '@mui/material/Tooltip';
import { useSearchParams } from 'next/navigation';

export const defaultMapContainerStyle = {
  width: '100%',
  height: '100%',
};

export const defaultMapCenter = {
  lat: 35.655439,
  lng: 139.54368
}

export const defaultMapZoom = 18

export const defaultMapOptions = {
  zoomControl: true,
  tilt: 0,
  gestureHandling: 'greedy', // 一本指対応
  mapTypeId: 'roadmap',  //sateliteなら衛星写真
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  minZoom: 10
};

type MapComponentProps = {
  toilets: Toilet[],
  isIncludeDetail: boolean,
  selectedToilet?: Toilet,
  onToiletSelected?: ((selectedToilet: Toilet | undefined) => void)
};

//ページを作ってるやつ
export const MapComponent = ({ toilets, isIncludeDetail, selectedToilet, onToiletSelected }: MapComponentProps) => {
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng | undefined>(undefined);
  const [map, setMap] = useState<google.maps.Map | undefined>(undefined);
  const [nearestToilet, setNearestToilet] = useState<Toilet | undefined>(undefined);
  const [activeToilet, setActiveToilet] = useState<Toilet | undefined>(undefined);

  const getToiletById = useCallback((toiletId: string) => {
    return toilets.find((x) => x.id === toiletId);
  }, [toilets]);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (selectedToilet) {
      setActiveToilet(selectedToilet);
    } else {
      const toiletId = searchParams.get("toilet_id");
      const toilet = getToiletById(toiletId || '');
      if (toilet) {
        setActiveToilet(toilet);
      } else {
        setActiveToilet(undefined);
      }
    }
  }, [selectedToilet, searchParams, getToiletById]);

  const handleLocationError = () => {
    console.error("error: The Geolocation service failed.");
    console.error("error: Youre browser doesn't support geolocation");
  }

  const selectToilet = (toilet: Toilet | undefined) => {
    setActiveToilet(toilet);
    onToiletSelected && onToiletSelected(toilet);
  }

  const getCurrentPosition = (map: google.maps.Map) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = toLatLng(position);
          setCurrentPosition(pos);
          // console.log(pos);
        },
        () => {
          handleLocationError();
        }
      );
    } else {
      handleLocationError();
    }
  }

  const currentPositionMarker = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#115EC3',
    fillOpacity: 1,
    strokeColor: 'white',
    strokeWeight: 2,
    scale: 7
  };

  const CurrentMarker = () => {
    if (currentPosition) {
      return (
        <Marker
          position={currentPosition}
          icon={currentPositionMarker}
        />
      );
    } else {
      return null;
    }
  }

  const ToiletInfoWindow = () => {
    if (!activeToilet) return null;

    if (isIncludeDetail) {  //PCの場合
      return (
        <InfoWindow
          onCloseClick={() => selectToilet(undefined)}
          position={toLatLng(activeToilet.position)}
        >
          <ToiletDetails toilet={activeToilet} />
        </InfoWindow>
      )
    } else {  //スマホの場合
      return (
        <InfoWindow
          onCloseClick={() => selectToilet(undefined)}
          position={toLatLng(activeToilet.position)}
        >
          <div className='w-auto p-[5px]'>
            <span>
              <ToiletImage src={activeToilet?.picture || "/NoImage.svg"} className='relative w-auto aspect-square grid place-items-center' />
              <span className="block top-0">{activeToilet?.nickname}</span>
              <span className="block top-0">フロア:{activeToilet?.floor}階</span>
              <Link className='text-blue-600' href={`/detail/${activeToilet?.id || ''}`}>詳細はこちら</Link>
            </span>
          </div>
        </InfoWindow>
      )
    }
  }

  const calcDistance = (position1: (google.maps.LatLng | GeoPoint | undefined), position2: (google.maps.LatLng | GeoPoint | undefined)) => {
    if ((!position1) || (!position2)) {
      return 0.0;
    }
    if (position1 instanceof GeoPoint) {
      position1 = toLatLng(position1);
    }
    if (position2 instanceof GeoPoint) {
      position2 = toLatLng(position2);
    }

    let R = 3958.8; 
    let rLat1 = position1.lat() * (Math.PI / 180);
    let rLat2 = position2.lat() * (Math.PI / 180);
    let diffLat = rLat2 - rLat1;
    let diffLng = (position2.lng() - position1.lng()) * (Math.PI / 180);

    let d = 2 * R 
    * Math.asin(Math.sqrt(Math.sin(diffLat / 2) * Math.sin(diffLat / 2)
    + Math.cos(rLat1) * Math.cos(rLat2)
    * Math.sin(diffLng / 2) * Math.sin(diffLng / 2)));
    return d;
  }

  const queryNearestToilet = useCallback(() => {
    if (!currentPosition) {
      setNearestToilet(undefined);
      return;
    }

    let nearestDistance = Infinity;
    let tmpNearestToilet: (Toilet | undefined) = undefined;
    let distance = 0;
    toilets.map((x) => {
      distance = calcDistance(x.position, currentPosition);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        tmpNearestToilet = x;
      }
    }
    )
    // if (nearestPosition) {
    //   console.log(`nearestPosition.lat: ${nearestPosition.lat()}`);
    //   console.log(`nearestposition.lng: ${nearestPosition.lng()}`);
    // } else {
    //   console.log("nearestPosition is undefined.");
    // }
    setNearestToilet(tmpNearestToilet);
  }, [currentPosition, toilets]);

  useEffect(() => {
    queryNearestToilet();
  }, [queryNearestToilet]);

  const nearestMarkerIcon = {
    url: "/mapicon_pin_blue_80x80.webp",
    scaledSize: new google.maps.Size(40, 40)
  };

  type ToiletMarkerProps = { toilet: Toilet };
  const ToiletMarker = ({ toilet }: ToiletMarkerProps) => {
    if (toilet.id === nearestToilet?.id) {
      return (
        <Marker key={toilet.id}
          position={toLatLng(toilet.position)}
          icon={nearestMarkerIcon}
          onClick={() => selectToilet(toilet)}
        />
      );
    } else {
      return (
        <Marker key={toilet.id}
          position={toLatLng(toilet.position)}
          // label={markerLabeluec} 
          onClick={() => selectToilet(toilet)}
        />
      );
    }
  }

  const NearestToiletLine = () => {
    if (currentPosition && nearestToilet) {
      const coordinates = [
        currentPosition,
        toLatLng(nearestToilet.position)
      ];

      const options: google.maps.PolylineOptions = {
        path: coordinates,
        strokeColor: "#115EC3"
      };

      return (
        <Polyline
          options={options}
        />
      );
    } else {
      return null;
    }
  }

  const getToiletsExcludeSamePosition = () => {
    const result: Toilet[] = [];
    const positionSet = new Set<GeoPoint>();
    toilets.forEach((toilet) => {
      if (!positionSet.has(toilet.position)) {
        positionSet.add(toilet.position);
        result.push(toilet);
      }
    });
    return result;
  }

  function mapToiletsExcludeSamePosition<T>(callBackFn: (toilet: Toilet) => T): T[] {
    return getToiletsExcludeSamePosition().map<T>(callBackFn);
  }


  return (
    <GoogleMap
      mapContainerStyle={defaultMapContainerStyle}
      center={defaultMapCenter}
      zoom={defaultMapZoom}
      options={defaultMapOptions}
      onLoad={(e) => { setMap(e); }}
    >
      <CurrentMarker />  {/* 現在位置の表示 */}

      {nearestToilet && (<NearestToiletLine />)}

      {mapToiletsExcludeSamePosition((x) => (<ToiletMarker key={x.id} toilet={x} />))}

      {activeToilet && <ToiletInfoWindow key={activeToilet?.id} />}
      <span className="absolute w-[40px] h-[40px] z-[1] bottom-[110px] right-[0px] bg-white rounded-[2px] shadow-md p-[5px] m-[10px]">
        <Tooltip title="現在地を取得">
          <button onClick={() => {
              if (map) {
                getCurrentPosition(map);
              } else {
                console.error("map is undefined.");
              }
            }
          }>
            <Image
              alt="現在地を取得"
              width={30}
              height={30}
              src="/current-location.svg"
            />
          </button>
        </Tooltip>
      </span>
    </GoogleMap>
  )

};