import Dropzone from "../components/Dropzone"

export default function OrderTiers() {
  return (
    <>
    <div className="flex flex-col justify-center items-center px-10 py-10">
      <Dropzone script='sort-images' />
    </div>
    </>
  );
}
