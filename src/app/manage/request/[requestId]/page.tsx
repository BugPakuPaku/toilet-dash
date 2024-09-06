"use client";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { getDoc, doc, query, where, collection, getDocs, updateDoc, addDoc, deleteDoc  } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Request } from "@/types";
import ToiletImage from "@/components/ToiletImage";
import { floorNumberToString, floorStringToNumber } from "@/components/Floor";

export default function Page({ params }: { params: { requestId: string } }) {
  const { requestId } = params;
  const [request, setRequest] = useState<Request>();
  const [censoredFlag, setCensoredFlag] = useState(request?.censored_flag || 0);
  const [isLoading, setIsLoading] = useState(false);

  const FLAG_WESTERN = 1 << 0;
  const FLAG_WASHLET = 1 << 1;
  const FLAG_HANDRAIL = 1 << 2;
  const FLAG_OSTOMATE = 1 << 3;
  
  const isWestern = () => ((request?.flag || 0) & FLAG_WESTERN) != 0;
  const isWashlet = () => ((request?.flag || 0) & FLAG_WASHLET) != 0;
  const isHandRail = () => ((request?.flag || 0) & FLAG_HANDRAIL) != 0;
  const isOstomate = () => ((request?.flag || 0) & FLAG_OSTOMATE) != 0;

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

  const getRequest = async () => {
    try {
      const snapShot = await getDoc(doc(firestore, "requests", requestId));
      setRequest({
          id: requestId,
          ...snapShot.data(),
      } as Request);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (requestId) {
      getRequest();
      setCensoredFlag(request?.censored_flag || 0);
    }    
  }, [requestId]);

  useEffect(() => {
    setCensoredFlag(request?.censored_flag || 0);
  }, [request?.censored_flag]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateDoc(doc(firestore, "requests", (request?.id || "")), {
        censored_flag: censoredFlag  //なかったら新たに作る、あったら更新
      });

      if (censoredFlag == 1) {  //approveされたら
        await addDoc(collection(firestore, "toilets"), {
          beauty: request?.beauty,
          description: request?.description,
          flag: request?.flag,
          floor: request?.floor,
          nickname: request?.nickname,
          picture: request?.picture,
          position: request?.position
        });
      }

      if (censoredFlag == 1 || censoredFlag == 2) {
        if (request?.id) {
          await deleteDoc(doc(firestore, "requests", request?.id));
        }
      }
      
      setIsLoading(false);
      window.alert("保存しました");
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleCensoredFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCensoredFlag(parseInt(e.target.value));
  };

  const getFlagCensorshipStatus = () => {
    if (! request?.censored_flag ) {
      return (
        <span>未検閲</span>
      )
    } else {  //request.censored_flagが存在したら検閲済み
      return (
        <span>検閲済み</span>
      )
    }
  };

  return (
    <>
      <h2>{request?.nickname} {floorNumberToString(request?.floor || 1)}</h2>
      <ToiletImage
        src={request?.picture || "/NoImage.svg"}
        className='relative w-[400px] aspect-square grid place-items-center'
        />
      <span className="ml-2 block sticky  top-0">きれいさ:{request?.beauty}</span>
      <span className="ml-2 block sticky  top-0">説明:{request?.description}</span>
      {displayWestern()}
      {displayWashlet()}
      {displayHandrail()}
      {displayOstomate()}
      <span>検閲状況: {getFlagCensorshipStatus()}</span>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <label htmlFor="approve">承認</label>
        <input
          id="approve"
          type="radio"
          value={1}
          checked={censoredFlag == 1}
          onChange={handleCensoredFlagChange}
          className="border border-gray-300"
        />
        <label htmlFor="denay">拒否</label>
        <input
          id="denay"
          type="radio"
          value={2}
          checked={censoredFlag == 2}
          onChange={handleCensoredFlagChange}
          className="border border-gray-300"
        />

        <button type="submit" disabled={isLoading}>
          {(isLoading ? "送信中..." : "送信")}
        </button>
      </form>
      <p>
        <Link href="./">一覧に戻る</Link>
      </p>
    </>
  );
}