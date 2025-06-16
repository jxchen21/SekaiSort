'use client'
import Image from 'next/image'
import {useState} from 'react'
export default function Guide() {
    const cleandesc = `☆ Crops to size + rounds edges to make your screenshot look pretty \n
                       ☆ Upload screenshots cropped like shown - make sure ENTIRE pink border is visible \n
                       ☆ Clean multiple files at once and get the output as a zip!`
    const sortdesc = `☆ Sorts tiers in rank order \n
                      ☆ Select event type to ensure correct processing \n
                      ☆ Download output as renamed files or screenshot output and use directly \n
                      ☆ Make sure to clean tiers before sorting!`
    const [image, setImage] = useState('cleaning_demo');
    const [desc, setDesc] = useState(cleandesc);
    const [isLoading, setIsLoading] = useState(false)
    function setClean() {
        if (image === 'sorting_demo') {
            setIsLoading(true)
            setTimeout(() => {
                setImage('cleaning_demo')
                setDesc(cleandesc);
                setIsLoading(false)
            }, 250)
        }
    }
    function setSort() {
        if (image === 'cleaning_demo') {
            setIsLoading(true)
            setTimeout(() => {
                setImage('sorting_demo');
                setDesc(sortdesc);
                setIsLoading(false)
            }, 250)
        }
    }

    return (<>
        <Image src={'/images/usageguide.png'} alt="Guide" width={300} height={50} className="mb-5 h-[15%]"/>
        <p className="bg-white w-[75%] rounded-2xl px-10 py-5 mt-[2vh] text-mid-blue text-lg md:text-xl text-center mb-[1vh]">
            sekai.sort has two utilities available: image cleaning and sorting! See below for demonstrations and usage tips.
        </p>
        <div className="flex md:flex-row flex-col mb-10 md:h-[50vh] w-[75%] items-center justify-center">
            <Image src={`/images/${image}.png`} alt="Demo" width={800} height={100} className={`mb-[1vh] md:mb-[0] rounded-2xl w-[100%] md:h-[100%] md:mr-[5%] transition-opacity duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`} />
            <div className="relative w-[100%] bg-white md:w-[35%] h-[20vh] md:h-[100%] rounded-2xl px-10 py-5">
                <p className="whitespace-pre-line overflow-y-auto overflow-x-hidden whitespace-normal break-words max-h-[75%] max-w-[100%] text-mid-blue text-lg md:text-xl">
                {
                    desc
                }
                </p>
                <div className="absolute bottom-[5%] left-[50%] transform -translate-x-1/2 flex items-center justify-center">
                    <button onClick={setClean} className="font-semibold bg-blue-300 rounded-2xl px-4 py-2 mr-[5%] hover:bg-blue-200 cursor-pointer transition-all duration-300 ease-in-out">Cleaning</button>
                    <button onClick={setSort} className="font-semibold bg-blue-300 rounded-2xl px-4 py-2 hover:bg-blue-200 cursor-pointer transition-all duration-300 ease-in-out">Sorting</button>
                </div>
            </div>
        </div>

    </>);
}