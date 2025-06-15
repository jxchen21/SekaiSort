import React from 'react'
interface props {
    handler: () => void,
    text: string
}
export default function ListImage(props : props) {
    return(
        <>
            <li className="flex flex-row items-center">
                <button id="xMark" onClick={props.handler} className="mr-5 hover:text-mid-blue">&#x2715;</button>
                <p>{props.text}</p>
            </li>
        </>
    )
}