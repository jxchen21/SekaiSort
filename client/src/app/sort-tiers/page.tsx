import Dropzone from "../components/Dropzone"
import Image from 'next/image'
export default function OrderTiers() {
  return (
    <>
    <Image src={'/images/sort_tiers.png'} alt="Guide" width={250} height={50} className="mb-5 h-[15%]"/>
    <Dropzone script='sort-tiers' />
    </>
  );
}
