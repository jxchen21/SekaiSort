import Dropzone from '../components/Dropzone'
import Image from 'next/image'
export default function CleanTiers() {
    return (
    <>
    <Image src={'/images/clean_tiers.png'} alt="Guide" width={275} height={50} className="mb-5"/>
    <Dropzone script='clean-images' />
    </>);
}