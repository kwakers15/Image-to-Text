import React, { useState, useEffect } from 'react'
import { STATUS } from './constants/status'
import axios from 'axios'
import fileDownload from 'js-file-download'

function App() {
  const [picture, setPicture] = useState(null)
  const [conversationNames, setConversationNames] = useState([])
  const [conversationName, setConversationName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [darkMode, setDarkMode] = useState(false);
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const setNames = async () => {
      setConversationNames((await axios.get("http://localhost:5000/convos/names")).data.conversationNames)
    }
    setNames()
  }, [])
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (conversationNames.includes(conversationName)) {
      setStatus(STATUS.DUPLICATE)
      return
    }
    if (conversationName.length === 0 || senderName.length === 0 || receiverName === 0 || !picture) {
      setStatus(STATUS.EMPTY)
      return
    }
    const formData = new FormData()
    formData.append("file", picture.pictureAsFile);

    formData.append('conversationName', conversationName)
    formData.append('senderName', senderName)
    formData.append('receiverName', receiverName)
    formData.append('darkMode', darkMode)

    setConversationNames((await axios.post("http://localhost:5000/convos/upload", formData)).data.conversationNames)
    setStatus(STATUS.SUCCESS)
  }

  const renderedStatus = () => {
    // create dismissible status bar here
    switch (status) {
      case STATUS.SUCCESS:
        return 'Success!'
      case STATUS.DUPLICATE:
        return 'This conversation name already exists!'
      case STATUS.EMPTY:
        return 'One or more fields are empty!'
      default:
        return null
    }
  }

  const uploadPicture = (e) => {
    if (picture) {
      URL.revokeObjectURL(picture.picturePreview)
    }
    if (e.target.files.length) {
      setPicture({
        /* contains the preview, if you want to show the picture to the user
             you can access it with this.state.currentPicture
         */
        picturePreview: URL.createObjectURL(e.target.files[0]),
        /* this contains the file we want to send */
        pictureAsFile: e.target.files[0],
      })
    } else {
      setPicture(null)
    }
  }

  const handleFileDownload = async () => {
    const response = await axios.get('http://localhost:5000/convos/excel', {
      responseType: 'blob'
    })
    fileDownload(response.data, 'conversations.xlsx')
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Upload conversation image
          <input type="file" name="file" accept="image/*" onChange={uploadPicture} />
        </label>
        {picture ? <img src={picture.picturePreview} alt='preview' width="100px" /> : null}
        <label>
          Conversation name
          <input value={conversationName} onChange={(e) => setConversationName(e.target.value)} />
        </label>
        <label>
          Text sender name
          <input value={senderName} onChange={(e) => setSenderName(e.target.value)} />
        </label>
        <label>
          Text receiver name
          <input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
        </label>
        <label>
          Dark mode
          <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
        </label>
        <button type='submit'>
          Submit
        </button>
      </form>
      {conversationNames}
      {renderedStatus()}
      <button onClick={handleFileDownload}>Download</button>
    </div>
  );
}

export default App;
