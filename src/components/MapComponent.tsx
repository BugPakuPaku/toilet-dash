'use client'

import React, { useEffect, useState, FormEvent, useReducer } from 'react';
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { collection, getDocs, query, getDoc, doc, addDoc, Timestamp, where } from "firebase/firestore";
import { firestore } from "@/firebase";
import { GeoPoint } from "firebase/firestore";
import { Review, Toilet } from "@/types";
import ToiletImage from "@/components/ToiletImage";
import Link from 'next/link';
import Image from 'next/image';
import { FLAG_WASHLET, FLAG_OSTOMATE, FLAG_HANDRAIL, FLAG_WESTERN, toLatLng } from "@/utils/util";

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

export type ToiletDetailsProps = { toilet: Toilet };

export const ToiletDetails = ({toilet} : ToiletDetailsProps) => {

  const [isLoading, setIsLoading] = useState(false);
  const [beauty, setBeauty] = useState(2);
  const [text, setText] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    let testUid = "";
    try {
      const doc = await addDoc(collection(firestore, "reviews"), {
        beauty: beauty,
        date: Timestamp.now(),
        text: text,
        toilet_id: toilet.id,
        uid: testUid
      });
      setIsLoading(false);
      window.alert("レビューを送信しました");
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const fetchReviews = async (toiletId: string) => {
    try {
      const q = query(collection(firestore, "reviews"), where('toilet_id', '==', toiletId));
      const querySnapshot = await getDocs(q);
      const reviews = querySnapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() })
      ) as Review[];
      setReviews(reviews);
    } catch (error) {
      console.log(error);
    }
  };

  const getBeuatyAverage = () => {
    let sum = 0;
    let count = reviews.length;
    reviews.map((x) => {
      sum += x.beauty || 0;
    });
    // console.log("sum" + sum);
    // console.log("count" + count);
    let customerAverage = sum / count;
    let allAverage = 0.0;
    if (count != 0) {
      allAverage = ((toilet.beauty || 0) * 7 + customerAverage * 3) / 10;
    } else {
      allAverage = toilet.beauty || 0;
    }
    return allAverage;
  }
  
  const isWestern = () => ((toilet.flag || 0) & FLAG_WESTERN) != 0;
  const isWashlet = () => ((toilet.flag || 0) & FLAG_WASHLET) != 0;
  const isHandRail = () => ((toilet.flag || 0) & FLAG_HANDRAIL) != 0;
  const isOstomate = () => ((toilet.flag || 0) & FLAG_OSTOMATE) != 0;

  const displayWestern = () => {
    if (isWestern()) {
      return (
        <span className="ml-2 block sticky  top-0">洋式</span>
      )
    } else {
      return (
        <span className="ml-2 block sticky  top-0">和式</span>
      )
    }
  }

  const displayWashlet = () => {
    if (isWashlet()) {
      return (
        <span className="ml-2 block sticky  top-0">ウォシュレットあり</span>
      )
    } else {
      return (
        <span className="ml-2 block sticky  top-0">ウォシュレットなし</span>
      )
    }
  }

  const displayHandrail = () => {
    if (isHandRail()) {
      return (
        <span className="ml-2 block sticky  top-0">手すりあり</span>
      )
    } else {
      return (
        <span className="ml-2 block sticky  top-0">手すりなし</span>
      )
    }
  }

  const displayOstomate = () => {
    if (isOstomate()) {
      return (
        <span className="ml-2 block sticky  top-0">オストメイトあり</span>
      )
    } else {
      return (
        <span className="ml-2 block sticky  top-0">オストメイトなし</span>
      )
    }
  }

  useEffect(() => {  
    fetchReviews(toilet.id);
  }, [toilet]);

  return (
    <div>
      <span>
        <ToiletImage src={toilet.picture || "/NoImage.svg"} />
        <span className="ml-2 block sticky  top-0">{toilet.nickname}</span>
        <span className="ml-2 block sticky  top-0">フロア:{toilet.floor}階</span>
        <span className="ml-2 block sticky  top-0">きれいさ:{getBeuatyAverage()} (公式調査: {toilet.beauty})</span>
        <span className="ml-2 block sticky  top-0">説明:{toilet.description}</span>
        {displayWestern()}
        {displayWashlet()}
        {displayHandrail()}
        {displayOstomate()}
        <span className="ml-2 block sticky  top-0">レビュー</span>
        <ul>
          {reviews.map((x) => (
            <li key={x.id}>
              <span>きれいさ: {x.beauty}</span><br />
              <span>レビュー: {x.text || ""}</span>
            </li>
          ))}
        </ul>
        <details>
          <summary>レビューを書く</summary>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <label htmlFor="beauty">きれいさ {beauty}</label>
            <input
              id="beauty"
              type="range"
              step="1"
              min="0"
              max="5"
              value={Math.round(beauty)}
              onChange={(e) => setBeauty(e.target.valueAsNumber)}
              className="border border-gray-300"
              required
            />

            <label htmlFor='review'>口コミ</label>
            <textarea
              id='review'
              value={text}
              onChange={(e) => setText(e.target.value)}
              className='border border-gray-300'
              required
            />

            <button type="submit" disabled={isLoading}>
              {(isLoading ? "保存中..." : "レビューを投稿")}
            </button>
          </form>
        </details>
      </span>
    </div>
  )
}

type MapComponentProps = { toilets: Toilet[], isIncludeDetail: boolean };

//ページを作ってるやつ
const MapComponent = ({ toilets, isIncludeDetail }: MapComponentProps) => {
  const [selectedCenter, setSelectedCenter] = useState<google.maps.LatLng | undefined>(undefined);
  const [selectedToilet, setSelectedDetail] = useState<Toilet | undefined>(undefined);
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng | undefined>(undefined);
  const [map, setMap] = useState<google.maps.Map | undefined>(undefined);
  const [nearestToiletId, setNearestToiletId] = useState<string | undefined>(undefined);

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
          <div>
            <span>
              <ToiletImage src={selectedToilet?.picture || "/NoImage.svg"} />
              <span className="ml-2 block sticky  top-0">{selectedToilet?.nickname}</span>
              <span className="ml-2 block sticky  top-0">フロア:{selectedToilet?.floor}階</span>
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
      setNearestToiletId(undefined);
      return;
    }

    let nearestDistance = Infinity;
    let tmpNearestToiletId: (string | undefined) = undefined;
    let distance = 0;
    toilets.map((x) => {
        distance = calcDistance(x.position, currentPosition);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          tmpNearestToiletId = x.id;
        }
      }
    )
    // if (nearestPosition) {
    //   console.log(`nearestPosition.lat: ${nearestPosition.lat()}`);
    //   console.log(`nearestposition.lng: ${nearestPosition.lng()}`);
    // } else {
    //   console.log("nearestPosition is undefined.");
    // }
    setNearestToiletId(tmpNearestToiletId);
  }

  useEffect(() => {  
    queryNearestToilet();
  }, [currentPosition]);

  const nearestMarkerIcon = {
    url:"/mapicon_pin_blue.png",
    scaledSize: new google.maps.Size(40, 40)
  };

  type ToiletMarkerProps = { toilet: Toilet };
  const ToiletMarker = ({ toilet }: ToiletMarkerProps) => {
    if (toilet.id === nearestToiletId) {
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

  return (
    <GoogleMap
      mapContainerStyle={defaultMapContainerStyle}
      center={defaultMapCenter}
      zoom={defaultMapZoom}
      options={defaultMapOptions}
      onLoad={(e) => {setMap(e);}}
    >
      <CurrentMarker />  {/* 現在位置の表示 */}

      {toilets.map((x) => (<ToiletMarker key={x.id} toilet={x} />))}

      {selectedCenter && (<ToiletInfoWindow />)}
      <span className="absolute z-[1] top-[72%] right-[%] right-0 bg-white rounded-[2px] shadow-md m-[10px]">
        <button>
          <Image className="w-[40px]"
            alt="現在地を取得"
            width={24}
            height={24}
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

const PCMapComponent = () => {
  const [toilets, setToilets] = useState<Toilet[]>([]);

  const getToilets = async () => {
    try {
      const q = query(collection(firestore, "toilets"));
      const snapShot = await getDocs(q);
      const data = snapShot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        position: doc.data().position,
      })) as Toilet[];
      setToilets(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {  //初回レンダリング時のみ
    getToilets();
  }, []);

  return (
    <div className="absolute w-full h-full">
      <div className="flex flex-nowrap justify-center items-center gap-3 bg-sky-300 h-full">
        <div className="w-[70%] h-[90%] ml-auto mt-[4%] mr-[2%]">
          <MapComponent toilets={toilets} isIncludeDetail={true} />
        </div>
        <div className="w-[30%] h-[90%] ml-auto mt-[4%] mr-[2%]">
          <ul className="space-y-4 h-full overflow-y-scroll overflow-x-hidden">
          {toilets.map((x) => (
            <li key={x.id} id={x.id} className="p-4 border-2 border-sky-300 rounded-lg shadow bg-white">
            <ToiletImage src={x.picture || "/NoImage.svg"} />
            <span className="ml-2 block sticky  top-0">{x.nickname}</span>
            <span className="ml-2 block sticky  top-0">フロア:{x.floor}階</span>
            <span className="ml-2 block sticky  top-0">きれいさ:{x.beauty}</span>
            <span className="ml-2 block sticky  top-0">説明:{x.description}</span>
            </li>
          ))}
          <Link href={`/request`}>トイレ追加リクエスト</Link> {/* 要移動 */}
          </ul>
        </div>
      </div>
    </div>
  )
};

const SPMapComponent = () => {

  const [toilets, setToilets] = useState<Toilet[]>([]);

  const getToilets = async () => {
    try {
      const q = query(collection(firestore, "toilets"));
      const snapShot = await getDocs(q);
      const data = snapShot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        position: doc.data().position,
      })) as Toilet[];
      setToilets(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {  //初回レンダリング時のみ
    getToilets();
  }, []);

  return (
      <div className="absolute w-full h-full z-0">
        <MapComponent toilets={toilets} isIncludeDetail={false} />
      </div>
  )
};

const SPListComponent = () => {
  const [toilets, setToilets] = useState<Toilet[]>([]);

  const getToilets = async () => {
    try {
      const q = query(collection(firestore, "toilets"));
      const snapShot = await getDocs(q);
      const data = snapShot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        position: doc.data().position,
      })) as Toilet[];
      setToilets(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {  //初回レンダリング時のみ
    getToilets();
  }, []);

  return (
    <div className="w-[100%] h-[100%] ml-auto mt-[4%] mr-[2%]">
      <ul className="space-y-4 overflow-x-hidden">
        {toilets.map((x) => (
          <li key={x.id} id={x.id} className="p-4 border-2 border-sky-300 rounded-lg shadow bg-white">
            <ToiletImage src={x.picture || "/NoImage.svg"} />
            <span className="ml-2 block sticky  top-0">{x.nickname}</span>
            <span className="ml-2 block sticky  top-0">フロア:{x.floor}階</span>
            <span className="ml-2 block sticky  top-0">きれいさ:{x.beauty}</span>
            <span className="ml-2 block sticky  top-0">説明:{x.description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
};

export { MapComponent };
export { PCMapComponent };
export { SPMapComponent };
export { SPListComponent };