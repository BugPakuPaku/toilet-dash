'use client'

import MapProvider from "@/providers/map-provider";
import { PCMapComponent } from "@/components/PCMapComponent";
import { SPMapComponent } from "@/components/SPMapComponent";
import Box from '@mui/material/Box';
import Link from "next/link";
import Image from "next/image";
import { useAuthContext } from "./provider/AuthContext";

import Button from '@mui/material/Button';

export default function Page() {
  const { user, isLogin } = useAuthContext();

  return (
    <MapProvider>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <SPMapComponent />
        <span className="absolute z-[1] top-[0px] right-0 bg-white rounded-[2px] shadow-md m-[10px]">
          <Link href={`/list`}><Image className="p-[5px]" width={40} height={40} src="/menu.svg" alt="menu" /></Link>
        </span>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {
          isLogin ?
            /* TODO: ログインしているときのいい感じのやつ　トイレを追加　リクエスト一覧　ログアウト */
            <></>
            :
            /* ログインボタン */
            <Button variant="contained" color="primary" href="/manage/login">
              管理者ログイン
            </Button>
        }
        <PCMapComponent />
        <span className="absolute bottom-[2px] right-[10px]">
          <Link href='https://forms.gle/nU5dQ29FCpQay3UB6'>feedback</Link>
        </span>
        <span className="absolute bottom-[2px] right-[100px]">
          <Link href='https://github.com/BugPakuPaku/toilet-dash'>GitHub</Link>
        </span>
      </Box>
    </MapProvider>
  );
}