"use client";
import React from 'react';
import Link from "next/link";
import RequestForm from '@/components/RequestForm';

export default function Page() {
  return (
    <>
      <RequestForm/>
      <span>
        <Link href={`/`}>home</Link>
      </span>
    </>
  );
}