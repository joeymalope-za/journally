"use client"
import Image from 'next/image'
import styles from './page.module.css'
import { useEffect, useState, Fragment } from 'react'
import { OpenAIApi, Configuration } from 'openai'
//import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { v4 as uuid } from "uuid";
import { Listbox, Combobox, Transition } from '@headlessui/react'
import { gradient } from "./components/Gradient";
import { AnimatePresence, motion } from "framer-motion";

const people = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
  { id: 3, name: 'Devon Webb' },
  { id: 4, name: 'Tom Cook' },
  { id: 5, name: 'Tanya Fox' },
  { id: 6, name: 'Hellen Schmidt' },
]


//create model for the response
interface Response {
  transcriptId: string;
}

// const ffmpeg = createFFmpeg({
//   // corePath: `http://localhost:3000/ffmpeg/dist/ffmpeg-core.js`,
//   // I've included a default import above (and files in the public directory), but you can also use a CDN like this:
//   corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
//   log: true,
// });

const configuration = new Configuration({
  organization: "org-BpdJjNRC40leioOZo9UJ8TFa",
  apiKey: "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",
});

  interface Voice {
    value: string;
    name: string;
    language: string;
    voiceType: string;
    languageCode: string;
    gender: string;
    service: string;
    sample: string;
  }

export default function Home() {
  useEffect(() => {
    gradient.initGradient("#gradient-canvas");
  }, []);

  const [transcriptionId, setTranscriptionId] = useState('');
  const [promptValue, setPromptValue] = useState('Hey Monique you have a lovely fake name.');
  const [inProgress, setInProgress] = useState(true);
  const [audioLink, setAudioLink] = useState('');
 
  const [voices, setVoices] = useState<Array<Voice>>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(voices[0]);
  const { Configuration, OpenAIApi } = require("openai");

  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [completed, setCompleted] = useState(false);
  const [transcript, setTranscript] = useState("");

  // const configuration = new Configuration({
  //   apiKey: process.env.OPENAI_API_KEY,
  //   organization: process.env.OPENAI_ORG,
  // });
  const configuration = new Configuration({
    organization: "org-BpdJjNRC40leioOZo9UJ8TFa",
    apiKey: "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",
  });

  const openai = new OpenAIApi(configuration);
  const [selected, setSelected] = useState(people[0])
  const [query, setQuery] = useState('')
  const filteredPeople =
  query === ''
    ? people
    : people.filter((person) =>
        person.name
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(query.toLowerCase().replace(/\s+/g, ''))
      )


  useEffect(() => {
    //sendTranscriptionRequest();
    if(voices.length == 0){
      fetch("https://play.ht/api/v1/getVoices", {
        method: "GET",
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          AUTHORIZATION: 'c9a9fb6cad0e438fadf5dc400929fca5',
          'X-USER-ID': 'Rjl53mVFqbhUNcFMU67Lw1pFG5p1',
          'Acess-Control-Allow-Origin': 'no-cors'
        },
      }).then(async (response) => {
          console.log("4. Voices",response.json().then((data) =>{
            setVoices(data.voices);
            console.log('voices',data);
          }));
      });
    }
    
  }, [voices,selectedVoice])

 const sendTranscriptionRequest = async () => {
      clearSetupConfig();
      console.log('click',promptValue);
      try {
        await requestPrompt();
      } catch (error) {
        console.error(error);
      }
      console.log('3. promptValue', promptValue);

  }

  const fetchConversion = async (value: string = promptValue) => {
    console.log('3.2. fetchCoversion',promptValue);
    fetch("https://play.ht/api/v1/convert", {
      method: "POST",
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        AUTHORIZATION: 'c9a9fb6cad0e438fadf5dc400929fca5',
        'X-USER-ID': 'Rjl53mVFqbhUNcFMU67Lw1pFG5p1',
        'Acess-Control-Allow-Origin': 'no-cors'
      },
      //en-ZA-LukeNeural
      //en-US-JennyNeural
      body: JSON.stringify({content: [value], voice: 'en-ZA-LukeNeural', title: (value) })
    }).then(async (response) => {
        console.log("4.",response.json().then((data) => setTranscriptionId(data.transcriptionId)));
    });
  }

  const clearSetupConfig = () => {
    setTranscriptionId('');
    setInProgress(true);
    setAudioLink('');
  }


  const getAudio = (url: string | undefined) => {
    console.log('PromptValue == ', promptValue);
    console.log('audioUrl', audioLink);
    console.log('transcriptionId', transcriptionId);
    return new Audio(url);
  }

  const playAudio = (url: string | undefined) => {
    console.log('playAudio');
    console.log('playAudio(): audioUrl', audioLink);

    try {
      (getAudio(url)).play();
    } catch(err) {
      console.error('error:' + err);
    }
  }

  async function checkStatus() {
    try {
      const res = await fetch(getArticleStatusUrl(),{
        method: 'GET',
        headers: {
          accept: 'application/json',
          AUTHORIZATION: 'c9a9fb6cad0e438fadf5dc400929fca5',
          'X-USER-ID': 'Rjl53mVFqbhUNcFMU67Lw1pFG5p1',
          'Acess-Control-Allow-Origin': 'no-cors'
        }
      });
      const json = await res.json();
      console.log(json);
  
      const { audioUrl, converted } = json;
  
      if(converted){
        // console.log('converted', converted);
        // console.log('audioUrl', audioUrl);
        // console.log('audioUrl', json.audioUrl);
        setAudioLink(json.audioUrl);
        playAudio(audioUrl);
        setInProgress(!converted);
      } else {
        // Wait for 1 second (or some other interval) and then try again
        setTimeout(async ()=> await checkStatus(), 1000);
      }
    } catch(err) {
      console.error('error:' + err);
    }
  }

  const getArticleStatusUrl = ()=>{
    return 'https://play.ht/api/v1/articleStatus?transcriptionId='+transcriptionId;
  };

  const requestPrompt = async () => {
    //send request to openai
    console.log('2. requestPrompt');

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `the response must be more than 2 sentences respond. Everything after the hyphen must be regarded as the first message in a conversation - ${promptValue}`,
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

    console.log(response.data.choices[0].text.length < 50? response.data.choices[0].text: 'Tell me a joke');
    setPromptValue(response.data.choices[0].text);

    await fetchConversion(response.data.choices[0].text);
  };
  
  // Call the function to start the loop  

  useEffect(() => {
    if(transcriptionId!=''){
      console.log('transcriptionId == ',transcriptionId);

      const url = 'https://play.ht/api/v1/articleStatus?transcriptionId='+transcriptionId;
      checkStatus();
      setTranscriptionId('');
    }

  },[transcriptionId])

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <button className={styles.cta} onClick={sendTranscriptionRequest} >💬 Ask AI
        </button>
        {/* 🤔💭💭 */}
        <textarea className={styles.textarea} defaultValue={promptValue} onChange={(e)=>{
         setPromptValue(e.target.value);
        }}>
        </textarea>
        <div></div>
        {/* <div>
            {voices.length > 0 &&<Listbox as="div" value={selectedVoice} onChange={setSelectedVoice}>
              <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                {selectedVoice?.name}</Listbox.Button>
              <Listbox.Options>
                {voices.map((voice) => (
                  <Listbox.Option
                    key={voice.name}
                    value={voice.name}
                  >
                    {voice.name}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>}
          <div className="fixed top-16 w-72">
            <Combobox value={selected} onChange={setSelected}>
              <div className="relative mt-1">
                <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                  <Combobox.Input
                    className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                    displayValue={(person) => person.name}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">

                  </Combobox.Button>
                </div>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  afterLeave={() => setQuery('')}
                >
                  <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredPeople.length === 0 && query !== '' ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        Nothing found.
                      </div>
                    ) : (
                      filteredPeople.map((person) => (
                        <Combobox.Option
                          key={person.id}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-teal-600 text-white' : 'text-gray-900'
                            }`
                          }
                          value={person}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                {person.name}
                              </span>
                              {selected ? (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? 'text-white' : 'text-teal-600'
                                  }`}
                                >
                                </span>
                              ) : null}
                            </>
                          )}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </Transition>
              </div>
            </Combobox>
          </div>
        </div> */}
      </div>

      <div className={styles.center}>
        <h3>
          {promptValue}
        </h3>
        <h4>{selectedVoice?.name}</h4>
      </div>
      <motion.canvas
          initial={{
            filter: "blur(20px)",
          }}
          animate={{
            filter: "blur(0px)",
          }}
          transition={{
            duration: 1,
            ease: [0.075, 0.82, 0.965, 1],
          }}
          style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
          }}
          id="gradient-canvas"
          data-transition-in
          className="z-50 fixed top-0 right-[-2px] w-[80%] md:w-1/2 h-screen bg-[#c3e4ff]"
        ></motion.canvas>
    </main>
  )
}
