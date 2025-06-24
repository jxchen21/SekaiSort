'use client'
import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import ListImage from './ListImage'
import DownloadButton from './DownloadButton'
import { extractRankFromImage, extractUsernameFromImage } from '../utils/ocr'

interface props {
  script: string;
}


export default function Dropzone(props: props) {
  //const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_BASE_URL = "https://sekai-sort-server.up.railway.app"
  interface Rank {
    filename: string;
    tier: number;
    user: string;
    image_url: string;
  }
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [type, setType] = useState("mara");
  const [loading, setLoading] = useState(false);

  function removeFile(id : number) {
    console.log(id);
    setFiles((files) => files.slice(0,id).concat(files.slice(id+1)));
  }
  function clearFiles() {
    setFiles([])
  }
  function clearAll() {
    clearFiles()
    setRanks([])
  }
  function checked() {
    if(type==="mara"){
      setType("cc");
    } else {
      setType("mara");
    }
  }
  const handleUpload = async () => {

    if (files.length === 0) {
      alert("Please select a file to upload!");
      return;
    }
    setLoading(true);
    console.log(loading);
    const formData = new FormData();
    const filesData = [];

    for (const file of files) {
      if (props.script === "sort-tiers"){
        const rank = await extractRankFromImage(file);
        const user = await extractUsernameFromImage(file, type);
        const fileData = {
          filename: file.name,
          rank: rank,
          user: user,
        }
        filesData.push(fileData);
        console.log(rank, user);
      }

      formData.append('images', file);
      console.log(`Uploaded ${file.name}`)
    }

    const jsonString = JSON.stringify(filesData);
    formData.append('data', jsonString);

    clearFiles();

    try {
      const res = await fetch(`${API_BASE_URL}/api/${props.script}`, {
        method: 'POST',
        body: formData
      });
      const results = await res.json();
      console.log('All results:', results);
      setRanks(results);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    clearAll();
    setFiles(acceptedFiles);
  }, []);
  const accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    disabled: loading
  });

  return (
    <>
    <div className="flex flex-col items-center justify-center">
      <div className='flex rounded-4xl bg-white w-[50vw] h-[20vh] items-center justify-center hover:bg-blue-100 cursor-pointer  transition-all duration-300 ease-in-out' {...getRootProps()}>
        <input name="images" {...getInputProps()} />
          {
            loading?
              <p className='text-center text-xl'>Loading...</p>
            :
            (isDragActive ?
              <p className='text-center text-xl'>Drop the files here ...</p> :
              <p className='text-center text-xl'>Drop or click to select files</p>)
          }
      </div>
      {
          props.script === "sort-tiers" && (
            <div className="flex flex-row mt-[2vh]">
              <input type="checkbox" onChange={checked} className="mr-5" />
              <p className="font-semibold">Cheerful Carnival?</p>
            </div>
          )
      }
      <div className="flex flex-row justify-center items-center mb-[2vh] mt-[1vh]">
        <button onClick={handleUpload} className="text-lg font-semibold bg-blue-300 rounded-2xl px-4 py-2 mr-10 hover:bg-blue-200 cursor-pointer transition-all duration-300 ease-in-out">Upload</button>
        <button onClick={clearAll} className="text-lg font-semibold bg-blue-300 rounded-2xl px-4 py-2 hover:bg-blue-200 cursor-pointer transition-all duration-300 ease-in-out">Clear All</button>
      </div>
      {
          (ranks.length > 0) && (
            <DownloadButton />
          )
      }
    </div>
    <div className={`${ files.length == 0 && ranks.length == 0 ? 'hidden' : ''} flex flex-col items-center bg-white rounded-4xl w-[50vw] p-5 mt-[2vh] mb-[2vh]`}>
      {
        files.length > 0 && (
        <div className="flex flex-col justify-center items-center">
          <p className="mb-5">Selected files:</p>
          <ul>
            {files.map((file, index) => (
              <ListImage key={index} text={file.name} handler={() => removeFile(index)} />
            ))}
          </ul>
        </div>
      )}
      {
        (ranks.length > 0) && ranks.map((item, index) => (
        <img key={index}
          src={`${API_BASE_URL}${item.image_url}`}
          alt={item.filename}
          className="my-1"
        />
      ))}
    </div>
    </>
  )
}