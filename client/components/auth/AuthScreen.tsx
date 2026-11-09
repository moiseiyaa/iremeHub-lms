import AuthForm from '../../components/auth/AuthForm';
import BrandMark from '../../components/ui/BrandMark';

export default function AuthScreen({mode}:{mode:'login'|'register'}) {
  return <div className="bg-[#f5f7f2] min-h-[calc(100vh-76px)]">
    <div className="ih-container grid lg:grid-cols-2 gap-10 xl:gap-20 items-center py-12 lg:py-20">
      <div className="w-full max-w-[490px] mx-auto lg:mx-0 ih-card p-7 sm:p-11">
        <AuthForm initialMode={mode}/>
      </div>
      <div className="hidden lg:flex flex-col justify-between bg-[#133d2f] text-white rounded-[30px] min-h-[590px] p-12 relative overflow-hidden">
        <div className="relative z-10"><BrandMark inverse/><span className="block text-[#aacbb6] text-xs font-semibold uppercase tracking-[.16em] mt-20">Your learning space</span><h2 className="mt-5 text-5xl font-bold tracking-[-.06em] leading-[1.1]">Good things grow when knowledge is shared.</h2><p className="mt-6 text-[#bfd5c5] leading-8 max-w-md">A more connected way to teach, learn and keep moving forward.</p></div>
        <div className="relative z-10 rounded-2xl bg-white/10 border border-white/15 p-6"><p className="text-sm text-[#e3efe5] leading-7">Made for every step of your learning journey.</p><div className="flex gap-2 mt-4"><span className="px-3 py-1.5 rounded-full bg-[#d8f59d] text-[#174734] text-xs font-bold">Learn</span><span className="px-3 py-1.5 rounded-full bg-white/15 text-xs">Teach</span><span className="px-3 py-1.5 rounded-full bg-white/15 text-xs">Grow</span></div></div>
        <div aria-hidden="true" className="absolute h-[380px] w-[380px] rounded-full border-[72px] border-[#2d6d51] right-[-170px] top-[160px] opacity-80" />
      </div>
    </div>
  </div>;
}
