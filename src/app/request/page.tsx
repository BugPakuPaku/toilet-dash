"use client";
import React from 'react';
import Link from "next/link";
import RequestForm from '@/components/RequestForm';
import Box from '@mui/material/Box'

export default function Page() {
  return (
    <>
      <RequestForm/>
      <Box sx={{ display: { xs: 'block', md: 'none' }}}>
        <span>
          <div className='fixed z-10 top-0 right-0 bg-white rounded-[2px] shadow-md m-[10px]'>
            <Link href={`/`}><img className="w-[70px] p-[5px]" src="/home.svg"/></Link>
          </div>
        </span>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' }}}>
        <span>
          <div className='fixed z-10 top-0 right-0 bg-white rounded-[2px] shadow-md m-[10px]'>
            <Link href={`/`}><img className="w-[150px] p-[5px]" src="/home.svg"/></Link>
          </div>
        </span>
      </Box>
    </>
  );
}