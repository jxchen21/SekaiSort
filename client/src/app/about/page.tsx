import Image from 'next/image'
export default function About() {
    return (<>
    <Image src={'/images/about.png'} alt="about" width={150} height={50} className="mb-5"/>
    <p className="bg-white w-[75%] rounded-2xl px-10 py-5 mt-5 text-mid-blue font-semibold text-xl text-center mb-5">
        {`Made with 💖 by Arctic for RIIA (And the rest of the PJSK Community!)`}
        <br />
        {`Built with NextJS, Tailwind, Flask, and Tesseract.`}
        <br />
        {`Saki best character btw :D`}
    </p>
    </>);
}