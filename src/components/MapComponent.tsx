'use client'

import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, Polyline } from "@react-google-maps/api";
import { GeoPoint } from "firebase/firestore";
import { Toilet } from "@/types";
import ToiletImage from "@/components/ToiletImage";
import { ToiletDetails } from './ToiletDetails';
import Link from 'next/link';
import Image from 'next/image';
import { toLatLng } from "@/utils/util";

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
};

type MapComponentProps = { toilets: Toilet[], isIncludeDetail: boolean };

//ページを作ってるやつ
export const MapComponent = ({ toilets, isIncludeDetail }: MapComponentProps) => {
  const [selectedCenter, setSelectedCenter] = useState<google.maps.LatLng | undefined>(undefined);
  const [selectedToilet, setSelectedDetail] = useState<Toilet | undefined>(undefined);
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng | undefined>(undefined);
  const [map, setMap] = useState<google.maps.Map | undefined>(undefined);
  const [nearestToilet, setNearestToilet] = useState<Toilet | undefined>(undefined);

  const handleLocationError = () => {
    console.log("error: The Geolocation service failed.");
    console.log("error: Youre browser doesn't support geolocation");
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
      return <></>;
    }
  }

  const ToiletInfoWindow = () => {
    if (! selectedToilet) return <></>;

    if (isIncludeDetail) {  //PCの場合
      return (
        <InfoWindow
          onCloseClick={() => { setSelectedCenter(undefined); setSelectedDetail(undefined); }}
          position={selectedCenter}
        >
          <ToiletDetails toilet={selectedToilet} />
        </InfoWindow>
      )
    } else {  //スマホの場合
      return (
        <InfoWindow
          onCloseClick={() => { setSelectedCenter(undefined); setSelectedDetail(undefined); }}
          position={selectedCenter}
        >
          <div className='w-auto p-[5px]'>
            <span>
              <ToiletImage src={selectedToilet?.picture || "/NoImage.svg"} className='relative w-auto aspect-square grid place-items-center' />
              <span className="block top-0">{selectedToilet?.nickname}</span>
              <span className="block top-0">フロア:{selectedToilet?.floor}階</span>
              <Link href={`/detail/${selectedToilet?.id || ''}`}>詳細はこちら</Link>
            </span>
          </div>
        </InfoWindow>
      )
    }
  }

  const calcDistance = (position1: (google.maps.LatLng | GeoPoint | undefined), position2: (google.maps.LatLng | GeoPoint | undefined)) => {
    if ((! position1) || (! position2)) {
      return 0.0;
    }
    if (position1 instanceof GeoPoint) {
      position1 = toLatLng(position1);
    }
    if (position2 instanceof GeoPoint) {
      position2 = toLatLng(position2);
    }
    
    const x = position1.lng() - position2.lng();
    const y = position1.lat() - position2.lat();
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  }

  const queryNearestToilet = () => {
    if (! currentPosition) {
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
  }

  useEffect(() => {  
    queryNearestToilet();
  }, [currentPosition]);

  const nearestMarkerIcon = {
    url:"/mapicon_pin_blue_80x80.webp",
    scaledSize: new google.maps.Size(40, 40)
  };

  type ToiletMarkerProps = { toilet: Toilet };
  const ToiletMarker = ({ toilet }: ToiletMarkerProps) => {
    if (toilet.id === nearestToilet?.id) {
      return (
        <Marker key={toilet.id}
          position={toLatLng(toilet.position)}
          icon={nearestMarkerIcon}
          onClick={() => { setSelectedCenter(toLatLng(toilet.position)); setSelectedDetail(toilet); }}
        />
      );
    } else {
      return (
        <Marker key={toilet.id}
          position={toLatLng(toilet.position)}
          // label={markerLabeluec} 
          onClick={() => { setSelectedCenter(toLatLng(toilet.position)); setSelectedDetail(toilet); }}
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
      return <></>;
    }
  }

  return (
    <GoogleMap
      mapContainerStyle={defaultMapContainerStyle}
      center={defaultMapCenter}
      zoom={defaultMapZoom}
      options={defaultMapOptions}
      onLoad={(e) => {setMap(e);}}
    >
      <CurrentMarker />  {/* 現在位置の表示 */}

      {nearestToilet && (<NearestToiletLine />)}

      {toilets.map((x) => (<ToiletMarker key={x.id} toilet={x} />))}

      {selectedCenter && (<ToiletInfoWindow />)}
      <span className="absolute w-[40px] h-[40px] z-[1] bottom-[175px] right-[0px] bg-white rounded-[2px] shadow-md p-[5px] m-[10px]">
        <button>
          <Image
            alt="現在地を取得"
            width={30}
            height={30}
            src="/current-location.svg" 
            onClick={(e) => {    
                if (map) {
                  getCurrentPosition(map);
                } else {
                  console.log("map is undefined.");
                }
              }
            }
          />
        </button>
      </span>
    </GoogleMap>
  )

};