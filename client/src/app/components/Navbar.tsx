'use client'
import React, {useState} from 'react'
import { usePathname } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
    const pathname = usePathname();
    const navLinks = [
        { href: '/order-tiers', label: 'Order Tiers' },
        { href: '/clean-tiers', label: 'Clean Tiers' },
        { href: '/about', label: 'About'}
    ]
    return(
    <div className="static flex px-5 py-5 bg-white shadow-xl/10 items-center">
    <Image src="/images/sekai.sort.png" alt="Logo" width={200} height={50}/>
    <div className="absolute right-0">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={pathname === link.href ? 'text-mid-blue mr-10' : 'mr-10'}
        >
          {link.label}
        </Link>
      ))}
    </div>
    </div>);
}