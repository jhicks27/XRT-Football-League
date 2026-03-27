"use client";

import { XRTLogoSVG } from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <XRTLogoSVG size={32} />
            <div>
              <p className="font-black text-white text-sm">
                <span className="text-primary-500">X</span>R<span className="text-primary-500">T</span>
              </p>
              <p className="text-[8px] text-gray-500 uppercase tracking-wider">Rough Touch Football League</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} XRT Rough Touch Football League. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
