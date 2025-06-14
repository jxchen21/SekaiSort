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
  const API_BASE_URL = "https://sekai-sort-server.up.railway.app";
  interface Rank {
    filename: string;
    tier: number;
    user: string;
    image_url: string;
  }
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [type, setType] = useState("mara");

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

    const formData = new FormData();
    const filesData = [];

    for (const file of files) {
      const rank = await extractRankFromImage(file);
      const user = await extractUsernameFromImage(file, type);
      formData.append('images', file);
      const fileData = {
        filename: file.name,
        rank: rank,
        user: user,
        image_url: `/static/uploads/${file.name}`
      }
      filesData.push(fileData);
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
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    setFiles(acceptedFiles);
  }, []);
  const accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept
  });

  return (
    <>
    <div {...getRootProps()}>
      <input name="images" {...getInputProps()} />
        {
          isDragActive ?
            <p className='bg-blue-200 my-10'>Drop the files here ...</p> :
            <p className='bg-blue-200 my-10'>Drop or click to select files</p>
        }
    </div>
    <div className="flex flex-row justify-center items-center mb-5">
      <button onClick={handleUpload} className="bg-blue-300 px-4 py-2 mr-10">Upload</button>
      <button onClick={clearAll} className="bg-blue-300 px-4 py-2">Clear All</button>

    </div>
    {
        props.script === "sort-images" && (
          <div className="flex flex-row">
            <input type="checkbox" onChange={checked} className="mr-5" />
            <p>Cheerful Carnival?</p>
          </div>
        )
    }
    {
        (props.script === "clean-images" && ranks.length > 0) && (
          <DownloadButton />
        )
    }
    <div>
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
      {ranks.map((item, index) => (
        <img key={index}
          src={`${API_BASE_URL}${item.image_url}`}
          alt={item.filename}
          className="max-w-md my-5"
        />
    ))}
    </div>
    </>
  )
}