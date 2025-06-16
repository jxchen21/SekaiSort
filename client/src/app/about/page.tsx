import Image from 'next/image'
export default function About() {
    return (<>
    <Image src={'/images/about_title.png'} alt="about" width={150} height={50} className="mb-5 h-[15%]"/>
    <p className="bg-white w-[75%] rounded-2xl px-10 py-5 mt-5 text-mid-blue text-xl text-center mb-5">
        {`Made with 💖 by Arctic for R11A (And the rest of the PJSK Community!)`}
        <br />
        {`Built with NextJS, Tailwind, Flask, and Tesseract.`}
        <br />
        {`Thanks to #1 unit tester 130anula, UI/UX helpers tella and citrusduck, and the R11A on top team for beta testing!`}
    </p>
    </>);
}