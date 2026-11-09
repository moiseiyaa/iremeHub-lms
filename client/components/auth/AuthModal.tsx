'use client';

import { Dialog, DialogPanel, DialogBackdrop, DialogTitle } from '@headlessui/react';
import AuthForm from './AuthForm';

interface Props {isOpen:boolean;onClose:()=>void;initialMode?:'login'|'register'}
export default function AuthModal({isOpen,onClose,initialMode='login'}:Props){
  return <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
    <DialogBackdrop transition className="fixed inset-0 bg-[#0c281b]/70 backdrop-blur-sm duration-200 data-[closed]:opacity-0"/>
    <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
      <DialogPanel transition className="relative w-full max-w-lg rounded-[26px] bg-white p-7 sm:p-10 shadow-2xl duration-200 data-[closed]:scale-95 data-[closed]:opacity-0">
        <DialogTitle className="sr-only">Account access</DialogTitle>
        <button type="button" onClick={onClose} aria-label="Close account dialog" className="absolute right-5 top-5 w-9 h-9 rounded-full bg-[#f1f5ef] text-[#4b6d59] grid place-items-center text-lg">×</button>
        <AuthForm initialMode={initialMode} onSuccess={onClose}/>
      </DialogPanel>
    </div>
  </Dialog>;
}
