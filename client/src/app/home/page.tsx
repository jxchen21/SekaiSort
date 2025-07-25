import Image from 'next/image'
export default function Home() {
    return (<>
        <Image src="/images/welcome.png" alt="Welcome" width={500} height={50} className="mb-5 h-[15%]"/>
        <Image src="/images/banner.png" alt="Banner" width={3000} height={100} className="w-full h-[50vh] object-cover" />
        <p className="bg-white w-[75%] rounded-2xl px-10 py-5 mt-5 text-mid-blue text-xl">
            {`Hey! Welcome to sekai.sort. I made this tool to help Project Sekai players show off
            their tiers without all the hassle of cropping, removing backgrounds, and formatting
            screenshots. Why? Definitely not because I'm unemployed haha... Anyways, hopefully you find this
            useful, and check out the Usage Guide for info on how to get started! Enjoy :D - Arctic`}
        </p>
    </>);
}