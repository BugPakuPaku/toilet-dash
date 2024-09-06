import { useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";

import { addDoc, doc, collection, updateDoc, GeoPoint } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { firestore, storage } from "@/firebase";
import { Toilet } from "@/types";

import ToiletImage from "./ToiletImage";
import { floorNumberToString, floorStringToNumber } from "./Floor";

type Props = { toilet?: Toilet };

export default function ToiletForm({ toilet: toilet }: Props) {
  const DEFAULT_POSITION = new GeoPoint(35.65807613409312, 139.5435764020845);
  const FLAG_WESTERN = 1 << 0;
  const FLAG_WASHLET = 1 << 1;
  const FLAG_HANDRAIL = 1 << 2;
  const FLAG_OSTOMATE = 1 << 3;

  const { push } = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setNickName] = useState("");
  const [picture, setPicture] = useState<File>();
  const [pictureUrl, setPicuteUrl] = useState("");
  const [beauty, setBeauty] = useState(0.0);
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState<GeoPoint>(DEFAULT_POSITION);
  const [floor, setFloor] = useState(1);
  const [flag, setFlag] = useState(0);

  const setPositionLatitude = (latitude: number) => {
    let newPosition = new GeoPoint(latitude, position.longitude)
    setPosition(newPosition);
  }

  const setPositionLongitude = (longitude: number) => {
    let newPosition = new GeoPoint(position.latitude, longitude)
    setPosition(newPosition);
  }

  const isWashlet = () => (flag & FLAG_WASHLET) != 0;

  const setWashlet = (isWashlet: boolean) => {
    setFlag(isWashlet ? (flag | FLAG_WASHLET) : (flag & ~FLAG_WASHLET))
  }

  const isWestern = () => (flag & FLAG_WESTERN) != 0;

  const setWestern = (isWestern: boolean) => {
    setFlag(isWestern ? (flag | FLAG_WESTERN) : (flag & ~FLAG_WESTERN))
  }

  const isHandRail = () => (flag & FLAG_HANDRAIL) != 0;

  const setHandRail = (isHandRail: boolean) => {
    setFlag(isHandRail ? (flag | FLAG_HANDRAIL) : (flag & ~FLAG_HANDRAIL))
  }

  const isOstomate = () => (flag & FLAG_OSTOMATE) != 0;

  const setOstomate = (isOstomate: boolean) => {
    setFlag(isOstomate ? (flag | FLAG_OSTOMATE) : (flag & ~FLAG_OSTOMATE))
  }

  const isNew = !toilet;

  useEffect(() => {
    if (toilet) {
      setBeauty(toilet.beauty || 0.0);
      setDescription(toilet.description || "");
      setFlag(toilet.flag || 0);
      setFloor(toilet.floor || 1);
      setNickName(toilet.nickname || "");
      setPicuteUrl(toilet.picture || "");
      setPosition(toilet.position);
    }
  }, [toilet]);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const imageFile = e.target.files ? e.target.files[0] : null;
    if (imageFile) {
      setPicture(imageFile);
      setPicuteUrl(URL.createObjectURL(imageFile));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    let uploadImageUrl = "";
    let toiletId = toilet?.id;
    try {
      if (picture) {
        const imagePath = `images/${Date.now()}`;
        await uploadBytes(ref(storage, imagePath), picture);
        uploadImageUrl = await getDownloadURL(ref(storage, imagePath));
      }
      if (isNew) {
        const doc = await addDoc(collection(firestore, "toilets"), {
          beauty: beauty,
          description: description,
          flag: flag,
          floor: floor,
          nickname: nickname,
          picture: uploadImageUrl,
          position: position
        });
        toiletId = doc.id;
      } else {
        await updateDoc(doc(firestore, "toilets", toilet.id), {
          beauty: beauty,
          description: description,
          flag: flag,
          floor: floor,
          nickname: nickname,
          picture: pictureUrl || uploadImageUrl,
          position: position
        });
      }
      setIsLoading(false);
      window.alert("保存しました");
      push(`/manage/toilet/${toiletId}`);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleLocationError = () => {
    console.error("error: The Geolocation service failed.");
    console.error("error: Youre browser doesn't support geolocation");
  }

  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const pos = new GeoPoint(position.coords.latitude, position.coords.longitude);

          // console.log(pos);

          setPosition(pos);
        },
        () => {
          handleLocationError();
        }
      );
    } else {
      handleLocationError();
    }
  }

  return (
    <>
      <div className="flex justify-center">
        <input
          type="text"
          className="text-center"
          value={nickname}
          onChange={(e) => setNickName(e.target.value)}
        />
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">

        <div className="bg-gray-300">
          <label htmlFor="image" className="text-center items-aligin: center">画像</label>
          <ToiletImage
            className='relative w-auto aspect-square grid place-items-center'
            src={pictureUrl || "/NoImage.svg"}
          />
          <br></br>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
          />
        </div>

        <label htmlFor="nickname">名前</label>
        <input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickName(e.target.value)}
          className="border border-gray-300"
          required
        />

        <label htmlFor="floor">トイレの階</label>
        <select
          id="floor"
          value={floorNumberToString(floor)}
          onChange={(e) => setFloor(floorStringToNumber(e.target.value))}
          className="border border-gray-300"
          required
        >
          <option value="1階">1階</option>
          <option value="2階">2階</option>
          <option value="3階">3階</option>
          <option value="4階">4階</option>
          <option value="5階">5階</option>
        </select>

        <label>トイレの座標</label>
        <button
          type="button"
          onClick={getCurrentPosition}
        >
          現在地を取得
        </button>
        <label htmlFor="position-latitude">緯度</label>
        <input
          id="position-latitude"
          type="number"
          value={position.latitude}
          onChange={(e) => setPositionLatitude(e.target.valueAsNumber)}
          className="border border-gray-300"
          required
        />

        <label htmlFor="position-longtitude">経度</label>
        <input
          id="position-longtitude"
          type="number"
          value={position.longitude}
          onChange={(e) => setPositionLongitude(e.target.valueAsNumber)}
          className="border border-gray-300"
          required
        />

        <label htmlFor="beauty">きれいさ {beauty}</label>
        <input
          id="beauty"
          type="range"
          step="0.1"
          min="0.0"
          max="5.0"
          value={beauty}
          onChange={(e) => setBeauty(e.target.valueAsNumber)}
          className="border border-gray-300"
          required
        />

        <label htmlFor="description">詳細</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 w-[30%] h-40"
          required
        />


        <label htmlFor="washlet">ウォシュレット対応</label>
        <input
          id="washlet"
          type="checkbox"
          checked={isWashlet()}
          onChange={(e) => setWashlet(e.target.checked)}
          className="border border-gray-300"
        />

        <label htmlFor="western">洋式</label>
        <input
          id="western"
          type="checkbox"
          checked={isWestern()}
          onChange={(e) => setWestern(e.target.checked)}
          className="border border-gray-300"
        />

        <label htmlFor="handrail">手すり付き</label>
        <input
          id="handrail"
          type="checkbox"
          checked={isHandRail()}
          onChange={(e) => setHandRail(e.target.checked)}
          className="border border-gray-300"
        />

        <label htmlFor="ostomate">オストメイト対応</label>
        <input
          id="ostomate"
          type="checkbox"
          checked={isOstomate()}
          onChange={(e) => setOstomate(e.target.checked)}
          className="border border-gray-300"
        />

        <button type="submit" disabled={isLoading}>
          {isNew && (isLoading ? "登録中..." : "登録")}
          {!isNew && (isLoading ? "保存中..." : "変更を保存")}
        </button>
      </form>
    </>
  );
}
