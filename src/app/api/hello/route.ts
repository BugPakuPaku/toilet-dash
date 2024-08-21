import { VercelResponse } from "@vercel/node";

export default function ( res: VercelResponse ) {
  res.send(`Hello!`);
}

export const runtime = 'nodejs';
