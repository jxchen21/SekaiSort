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
        { href: '/clean-tiers', label: 'Clean Tiers' },
        { href: '/sort-tiers', label: 'Sort Tiers' },
        { href: '/about', label: 'About'}
    ]
    function toggleShow() {
      setShow(!show);
    }
    return(
    <div className="static flex px-5 py-5 bg-white shadow-xl/10 items-center min-h-fit">
    <Image src="/images/sekai.sort.png" alt="Logo" width={200} height={50} className="md:w-[150] md:h-[30] w-[125] h-[25]"/>
    <div className="absolute bg-white right-0 md:top-auto top-[65] md:pt-1">
      <ul className={`flex md:flex-row flex-col items-center justify-center transition-all duration-300 overflow-hidden ${show ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} md:block md:max-h-none md:opacity-100`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'px-5 w-[100%] md:border-t-0 border-t-1 text-mid-blue md:mr-[1vw] text-xl text-center' : ' px-5 w-[100%] md:border-t-0 border-t-1 text-center text-lg md:mr-[1vw] hover:text-mid-blue transition-all duration-300 ease-in-out'}
          >
            {link.label}
          </Link>
        ))}
      </ul>
    </div>
    <Image onClick = {toggleShow} src={`/images/${show ? 'close' : 'menu'}.png`} alt="menu" width={25} height={25} className="md:hidden absolute right-5 cursor-pointer" />
    </div>);
}