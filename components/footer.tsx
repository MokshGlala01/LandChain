import Link from "next/link";
import { IconLink, IconHexagon } from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-50 dark:bg-[#020504] lc-border border-t py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-element bg-brand-light dark:bg-brand-dark/30 flex items-center justify-center text-brand dark:text-brand-mid">
              <IconLink className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-slate-800 dark:text-slate-100">
              LandChain
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm font-body leading-relaxed">
            Securing real estate registries, mutation approvals, and encumbrance certifications with decentralized cryptographic provenance.
          </p>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-[#8247E5]/10 dark:bg-[#8247E5]/20 text-[#8247E5] dark:text-[#a074f0] font-heading font-bold text-xs">
            <IconHexagon className="w-4 h-4 fill-[#8247E5]/20" />
            Built on Polygon
          </div>
        </div>

        {/* Navigation column */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">
            Platform
          </h4>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 font-body">
            <li>
              <Link href="/search" className="hover:text-brand dark:hover:text-brand-mid transition-colors">
                Public Search
              </Link>
            </li>
            <li>
              <Link href="/verify/PARCEL-4902-881" className="hover:text-brand dark:hover:text-brand-mid transition-colors">
                QR Verification
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-brand dark:hover:text-brand-mid transition-colors">
                Citizen KYC Sign In
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal/Info column */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">
            Resources
          </h4>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 font-body">
            <li>
              <Link href="#" className="hover:text-brand dark:hover:text-brand-mid transition-colors">
                Developer API
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-brand dark:hover:text-brand-mid transition-colors">
                Government Portal
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-brand dark:hover:text-brand-mid transition-colors">
                Smart Contract Audit
              </Link>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-body">
        <span>© {new Date().getFullYear()} LandChain. All government records are securely locked on-chain.</span>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</Link>
          <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Terms of Registry</Link>
        </div>
      </div>
    </footer>
  );
}
