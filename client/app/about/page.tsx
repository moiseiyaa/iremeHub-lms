import Link from 'next/link';
import { ArrowUpRightIcon, BookOpenIcon, AcademicCapIcon, BuildingOffice2Icon, ShieldCheckIcon, SparklesIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const pillars=[
{icon:BookOpenIcon,title:'Better learning journeys',copy:'Put learning materials, lessons and milestones where people can find them.'},
{icon:AcademicCapIcon,title:'Clearer teaching workflows',copy:'Give educators room to focus on teaching, feedback and outcomes.'},
{icon:BuildingOffice2Icon,title:'Organized institutions',copy:'Help teams administer digital learning programs from one thoughtful workspace.'},
];
const principles=[
{icon:ShieldCheckIcon,title:'Trust by design',copy:'Privacy, secure authorization and accountability inform the product roadmap.'},
{icon:ChartBarIcon,title:'Progress that is visible',copy:'Learning should make it easy to understand what comes next.'},
{icon:SparklesIcon,title:'Simplicity that scales',copy:'A familiar, accessible experience on mobile and desktop.'},
];
export default function AboutPage(){
return <div className="bg-[#f5f7f2]">
  <section className="ih-section !pt-20 lg:!pt-28"><div className="ih-container grid lg:grid-cols-[1.2fr_.8fr] gap-12 items-center">
    <div><span className="ih-eyebrow">Our perspective</span><h1 className="ih-display mt-7">Learning should feel <span className="text-[#4a986e]">possible.</span></h1><p className="ih-lead mt-7">iremehub+ is an evolving digital learning platform built around a simple idea: the right tools should help people teach, learn and grow—not get in their way.</p><div className="flex flex-wrap gap-3 mt-9"><Link href="/courses" className="ih-btn ih-btn-primary">Explore courses <ArrowUpRightIcon className="h-5 w-5"/></Link><Link href="/contact" className="ih-btn ih-btn-neutral">Start a conversation</Link></div></div>
    <div className="bg-[#153c30] rounded-[30px] p-8 sm:p-10 min-h-[380px] flex flex-col justify-between text-white relative overflow-hidden">
      <span className="text-xs font-semibold tracking-[.18em] uppercase text-[#b0cfc0]">Our north star</span>
      <div className="absolute -right-16 top-4 h-60 w-60 border-[45px] border-[#387458]/60 rounded-full" aria-hidden="true"/>
      <div className="relative"><span className="block text-[#d8f59d] font-black tracking-[-.07em] text-7xl">+</span><p className="text-3xl sm:text-4xl font-bold tracking-[-.06em] leading-tight max-w-sm mt-8">More clarity. More connection. More possibilities.</p></div>
      <span className="relative text-sm text-[#aecdb8]">A renewed vision for digital learning.</span>
    </div></div></section>
  <section className="ih-section bg-white"><div className="ih-container"><span className="ih-eyebrow">Who we're designing for</span><h2 className="ih-heading mt-5 max-w-3xl">A connected experience across the learning community.</h2><div className="grid md:grid-cols-3 gap-5 mt-12">{pillars.map(item=><article key={item.title} className="ih-card p-8"><div className="w-13 h-13 rounded-2xl bg-[#e6f2e7] p-3 inline-flex"><item.icon className="w-7 h-7 text-[#236f4e]"/></div><h3 className="mt-8 text-xl font-bold tracking-tight">{item.title}</h3><p className="text-sm leading-7 text-[#718278] mt-3">{item.copy}</p></article>)}</div></div></section>
  <section className="ih-section"><div className="ih-container grid gap-12 lg:grid-cols-2 items-start"><div><span className="ih-eyebrow">Design principles</span><h2 className="ih-heading mt-5">Thoughtful by default.</h2><p className="ih-lead mt-6">We are rebuilding the platform with accessibility, secure learning journeys, and dependable workflows as core engineering priorities.</p><span className="inline-flex rounded-full bg-[#e2ecde] text-[#376448] text-xs font-bold px-4 py-2 mt-7">Platform renovation in progress</span></div><div className="space-y-4">{principles.map(item=><div key={item.title} className="ih-card p-6 flex items-start gap-5"><item.icon className="w-7 h-7 shrink-0 text-[#327c58]"/><div><h3 className="font-bold text-lg">{item.title}</h3><p className="mt-2 text-sm text-[#6c8273] leading-7">{item.copy}</p></div></div>)}</div></div></section>
  <section className="py-16 bg-[#113d30] text-white"><div className="ih-container flex flex-wrap justify-between gap-6 items-center"><div><h2 className="text-3xl font-bold tracking-tight">Discover what comes next.</h2><p className="text-[#b8d0bf] mt-3">Explore courses or reach out about institutional learning.</p></div><Link href="/contact" className="ih-btn ih-btn-lime">Get in touch <ArrowUpRightIcon className="w-5 h-5"/></Link></div></section>
</div>;
}
