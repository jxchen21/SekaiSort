'use client'
import Image from 'next/image'
import {useState} from 'react'
export default function Guide() {
    const cleandesc = `The clean tool automatically crops to size and rounds the edges of your tier screenshot so it looks nice and clean! For
                optimal usage, make sure to crop so that the entire pink border around your tier is visible, and ideally don't capture
                any part of the tiers above or below you. The tool supports uploading several images at once, and you can download all of
                the processed images together in a zip file!`
    const sortdesc = `The sorting tool automatically sorts tier screenshots based on rank by scanning the left side of the screenshot. The tool
                includes an option for distinguishing between marathon and cc events due to the names being slightly shifted by team icons (although
                this doesn't actually matter much), but it won't affect the ordering of the tiers at all. For optimal use, first process your images
                through the cleaning tool, and then use the sorter to get them in the correct order!`
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
        <Image src={'/images/usageguide.png'} alt="Guide" width={300} height={50} className="mb-5"/>
        <p className="bg-white w-[75%] rounded-2xl px-10 py-5 mt-5 text-mid-blue font-semibold text-xl text-center mb-5">
            sekai.sort has two utilities available: image cleaning and sorting! See below for demonstrations and usage tips.
        </p>
        <div className="flex h-[50vh] w-[75%] items-center justify-center">
            <Image src={`/images/${image}.png`} alt="Demo" width={800} height={100} className={`rounded-2xl  w-[60%] h-[90%] mr-[5%] transition-opacity duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`} />
            <p className="overflow-auto bg-white w-[35%] h-[90%] rounded-2xl px-10 py-5 mt-5 text-mid-blue font-semibold text-xl mb-5 ">
            {
                desc
            }
            </p>
        </div>
        <div className="static w-[75%] bg-white">
            <div className="flex items-center justify-center absolute right-[20%]">
                <button onClick={setClean} className="font-semibold bg-blue-300 rounded-2xl px-4 py-2 mr-10 hover:bg-blue-200 cursor-pointer transition-all duration-300 ease-in-out">Cleaning</button>
                <button onClick={setSort} className="font-semibold bg-blue-300 rounded-2xl px-4 py-2 hover:bg-blue-200 cursor-pointer transition-all duration-300 ease-in-out">Sorting</button>
            </div>
        </div>
    </>);
}