'use client';
import dynamic from 'next/dynamic';
const BillingFlowIsland = dynamic(() => import('./RCMBillingFlow'), { ssr: false });
export default BillingFlowIsland;
