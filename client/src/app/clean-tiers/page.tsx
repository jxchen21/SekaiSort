import Dropzone from '../components/Dropzone'
export default function CleanTiers() {
    return (
    <>
    <div className="flex flex-col justify-center items-center px-10 py-10">
        <Dropzone script='clean-images' />
    </div>
    </>);
}