'use client'
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
    const [show, setShow] = useState(false)
    const pathname = usePathname();
    const navLinks = [
        { href: '/home', label: 'Home' },
        { href: '/guide', label: 'Usage Guide'},
        { href: '/sort-tiers', label: 'Sort Tiers' },
        { href: '/clean-tiers', label: 'Clean Tiers' },
        { href: '/about', label: 'About'}
    ]
    function toggleShow() {
      setShow(!show);
    }
    return(
    <div className="static flex px-5 py-5 bg-white shadow-xl/10 items-center h-[8%]">
    <Image src="/images/sekai.sort.png" alt="Logo" width={200} height={50} className="md:w-[200] md:h-[40] w-[125] h-[25]"/>
    <div className="absolute bg-white right-0 md:top-5 top-[8%] md:pt-1">
      <ul className={`flex md:flex-row flex-col items-center justify-center ${show ? 'block' : 'hidden'} md:block`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'px-5 w-[100%] md:border-t-0 border-t-1 font-semibold text-mid-blue md:mr-[4vw] text-xl text-center' : ' px-5 w-[100%] md:border-t-0 border-t-1 text-center text-lg md:mr-[4vw] hover:text-mid-blue transition-all duration-300 ease-in-out'}
          >
            {link.label}
          </Link>
        ))}
      </ul>
    </div>
    <Image onClick = {toggleShow} src={`/images/${show ? 'close' : 'menu'}.png`} alt="menu" width={25} height={25} className="md:hidden absolute right-5 cursor-pointer" />
    </div>);
}