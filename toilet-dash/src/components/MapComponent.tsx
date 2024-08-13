'use client'

import React, { useEffect, useState, FormEvent, useReducer } from 'react';
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { collection, getDocs, query, getDoc, doc, addDoc, Timestamp, where } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Review, Toilet } from "@/types";
import ToiletImage from "@/components/ToiletImage";
import { setRequestMeta } from 'next/dist/server/request-meta';


export const defaultMapContainerStyle = {
  width: '100%',
  height: '94vh',
  borderRadius: '15px 0px 0px 15px',
};

export const defaultMapCenter = {
  lat: 35.655439,
  lng: 139.54368
}

export const defaultMapZoom = 18

export const defaultMapOptions = {
  zoomControl: true,
  tilt: 0,
  gestureHandling: 'auto',
  mapTypeId: 'roadmap',  //sateliteなら衛星写真
};

type Props = { toilets: Toilet[] };

//ページを作ってるやつ
const MapComponent = ( {toilets} : Props ) => {
  // const [toilets, setToilets] = useState<Toilet[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<Toilet | null>(null);
  const [text, setText] = useState("");
  const [beauty, setBeauty] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [toilet_Id, setToilet_Id] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    let test_uid = "";
    try {
      const doc = await addDoc(collection(firestore, "reviews"), {
        beauty: beauty,
        date: Timestamp.now(),
        text: text,
        toilet_id: selectedDetail?.id,
        uid: test_uid
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
    console.log("sum" + sum);
    console.log("count" + count);
    let customer_average = sum / count;
    let all_average = 0.0;
    if (count != 0) {
      all_average = ((selectedDetail?.beauty || 0)*7 + customer_average*3) / 10;
    } else {
      all_average = selectedDetail?.beauty || 0;
    }
    return all_average;
  }

  useEffect(() => {  //selectedDetail更新時  //よくわからん
    if (selectedDetail?.id) {
      fetchReviews(selectedDetail?.id);
    }
  }, [selectedDetail?.id]);

  return (
    <GoogleMap
      mapContainerStyle={defaultMapContainerStyle}
      center={defaultMapCenter}
      zoom={defaultMapZoom}
      options={defaultMapOptions}
    >
      {toilets.map((x) => (
        <Marker key={x.id}
          position={{ lat: x.position.latitude, lng: x.position.longitude }}
          // label={markerLabeluec} 
          onClick={() => { setSelectedCenter({ lat: x.position.latitude, lng: x.position.longitude }); setSelectedDetail(x); }}
        />
      ))}

      {selectedCenter && (
        <InfoWindow
          onCloseClick={() => { setSelectedCenter(null); setSelectedDetail(null); }}
          position={selectedCenter}
        >
          <div>
            <li>
              <ToiletImage src={selectedDetail?.picture || "/NoImage.svg"} />
              <span className="ml-2 block sticky  top-0">{selectedDetail?.nickname}</span>
              <span className="ml-2 block sticky  top-0">フロア:{selectedDetail?.floor}階</span>
              <span className="ml-2 block sticky  top-0">きれいさ:{getBeuatyAverage()} (公式調査: {selectedDetail?.beauty})</span>
              <span className="ml-2 block sticky  top-0">説明:{selectedDetail?.description}</span>
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
            </li>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
};

const PCMapComponent = () =>{
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
    //   const getToilet = async () => {
    //   try {
    //     const snapShot = await getDoc(doc(firestore, "books", toiletId));
    //       setToiletDetail({
    //         id: toiletId,
    //         ...snapShot.data(),
    //       } as Toilet);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };
    // if (toiletId) getToilet();
  }, []);

  return (
    <div className="flex justify-center items-center gap-3 bg-sky-300">
      <div className="w-[70%] h-full">
        <MapComponent toilets={toilets}/>
      </div>
      <div className="w-[30%] h-screen ml-auto mt-[4%] mr-[2%]">
        <ul className="space-y-4 h-[90%] overflow-y-scroll overflow-x-hidden">
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
    //   const getToilet = async () => {
    //   try {
    //     const snapShot = await getDoc(doc(firestore, "books", toiletId));
    //       setToiletDetail({
    //         id: toiletId,
    //         ...snapShot.data(),
    //       } as Toilet);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };
    // if (toiletId) getToilet();
  }, []);

  return (
    <div className="flex justify-center items-center gap-3 bg-sky-300">
      <div className="w-full h-full">
        <MapComponent toilets={toilets}/>
      </div>
    </div>
  )
};

export { MapComponent };
export { PCMapComponent };
export { SPMapComponent };