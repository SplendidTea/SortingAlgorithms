
import './App.css';
import React, {useState, useEffect, useRef, useCallback} from 'react'
import {Howl, Howler} from 'howler'
import Gameover from "../Music/Gameover.mp3";
import WinnerSound from "../Music/Winner.mp3";
import dmgau from "../Music/dmg.mp3";
import corau from "../Music/cor.mp3";
import {authAxios} from '../Interceptors/authAxios';

function BSApp({mode}) {

  //React States Declared
const [difficulty, setDifficulty]=useState(mode);
const [displayedArray, setArray]=useState([]);
const [sortedArray,setSortedArray]=useState([1]);
const [barEffects, setBarEffects] =useState([]);
const [playing, setPlaying] = useState(false);
const [swap, setSwap] = useState(false);
const [baseArray, setBaseArray] = useState([])
const [index, setIndex] = useState([0,1]);
const [lengt, setLengt]=useState([0]);
const [time, setTime] = useState(0);
const [done, setDone]=useState(false);
const [lives, setlives] = useState(3);
const [winner, setWinner] = useState(false);
const [userArray, setUserArray] = useState("");
const [isCorrect, setIsCorrect] = useState(0);

//React Callbacks
const swapFNRef=useRef(()=>{})
const compareRef=useRef(()=>{})
const noSwapFNRef=useRef(()=>{})

const audioClips=[
   Gameover,
  WinnerSound,
  dmgau,
  corau
]

const SoundPlay=(src)=>{
  const sound =new Howl({
    src
  })
  sound.play()
}
Howler.volume(0.5)

//Compares two arrays return false if they are not the same, returns true if they are
const compareArrays = (a1, a2) => {
  if (a1.length !== a2.length) return false;
  for (let i = 0; i < a1.length;i++) {
    if (a1[i] !== a2[i]) return false;
  }
  return true;
}


useEffect(() => {
  
//if its not playing return else set the array and compare
  if(!playing) return;

  
  let  workingArray=[...baseArray]
  setArray(workingArray)
  bubblesort(baseArray)
  compare();


//swaps index 1 with index0 
  function swapFN(){

    workingArray=[...workingArray]
    const tmp=workingArray[index[0]]
    workingArray[index[0]]=workingArray[index[1]]
    workingArray[index[1]]=tmp
    setArray(workingArray);
    setIndex([index[0]++,index[1]++]);
    return 
  
  }swapFNRef.current=swapFN;

  //increases the indexes
function noSwapFN(){
  setIndex([index[0]++,index[1]++]);
  return
}noSwapFNRef.current=noSwapFN;



  function compare(){


    //reduces length 
    if(index[0]==lengt){
      setIndex([index[0]=0,index[1]=1]);
      setLengt([lengt[0]=lengt[0]-1]);
      console.log(lengt);
    }
   
    //sets buttons to be red or green
    setBarEffects({
      [index[0]]:'green',
      [index[1]]:'red'
    })
  
    
    if(workingArray[index[0]]>workingArray[index[1]])
    {
      setSwap(true)
    }
    else{
      setSwap(false)
    }

    
      if(compareArrays(sortedArray,workingArray))
      {
        setDone(true);
        setWinner(true);
        setPlaying(false);
          
         
      }
    

  
  }compareRef.current=compare;

},[baseArray ,playing])


//Timer Use Effect
useEffect(()=>{
	if(playing){
	const timerId = setInterval(() => setTime(time+1), 10);
  console.log(time)
			return () => clearInterval(timerId);
      
	}
})


//call back declaration

const swapFN=useCallback(()=>{swapFNRef.current();},[swapFNRef])
const compare=useCallback(()=>{compareRef.current();},[compareRef])
const noSwapFN=useCallback(()=>{noSwapFNRef.current();},[noSwapFNRef])


//creates Array based on difficulty

const createArray=() =>{
switch(difficulty) {
  case 1: setBaseArray(generateArray(10,1,20))
          setPlaying(true); 
          setLengt([9]);   
    break;
  case 2:
          setBaseArray(generateArray(15,1,40))
          setPlaying(true); 
          setLengt([14]);   
    break;
  case 3:
          setBaseArray(generateArray(20,1,50))
          setPlaying(true); 
          setLengt([19]);   
    break;
  case 5:
          setBaseArray(generateArray(50,1,100))
          setPlaying(true); 
          setLengt([49]);   
    break;
  case 4:if(userArray=="")
        {
          setBaseArray(generateArray(10,1,20))
          setLengt([9])
        }
        else
        {
            let tempo=splitterOfArrays()
            let lento=tempo.length-1
            bubblesort(tempo)
            setBaseArray(tempo)
            setLengt([lento])
        }
        setPlaying(true);
    break;
  default:
          setBaseArray(generateArray(10,1,20))
          setPlaying(true); 
          setLengt([9]);   
    break;
}
}

//converts a text input to an array of numbers
const splitterOfArrays=()=>{

  let newArr=userArray.split(',').map(Number)

  if(!newArr.some(isNaN)){
    return newArr;
  }
  else{
    alert("enter in a valid number array in (a,b,c) format where the letters represent numbers")
  }
}


//generates an array based on some params
const generateArray=(length,min,max) =>{

const nmin=Math.ceil(min)
const nmax=Math.floor(max+1)
let array=Array.from({length:length},()=>Math.floor(Math.random()*(nmax-nmin)+nmin));
bubblesort(array);
return array
}

//bubble sort and set a sorted array
const bubblesort = (arr)=> {

  let temp=[...arr]
  let swapped=false;
let i,j;


  for(i=0; i<temp.length; i++) {
swapped=false;

for(j=0;j<temp.length; j++) {
if(temp[j]>temp[j+1])
{
  let nt=temp[j];
  temp[j]=temp[j+1]
  temp[j+1]=nt
  swapped=true;
}
}

if(!swapped)
{
  break;
}
  }

setSortedArray(temp);
}


//swap button handeling
const swapBTN=()=>{
  
if(swap)
{
  setIsCorrect(1)
 SoundPlay(audioClips[3])
  swapFN()
}
else
{
  setIsCorrect(2)
  SoundPlay(audioClips[2])
  if(difficulty>0&&difficulty!=4)
  {
    
    setlives(lives-1)
    checklives()
  }
  
}
compare()
}

//noswap button handeling
const noSwapBTN=()=>{
  
if(!swap){
  setIsCorrect(1)
  SoundPlay(audioClips[3])
  noSwapFN()
}
else
{
  setIsCorrect(2)
  SoundPlay(audioClips[2])
 if(difficulty>0&&difficulty!=4)
 {
  
   setlives(lives-1)
   checklives()
 }
 
}

compare()
}

//lessons mode button handeling
const nxtStep=()=>{
if(swap){
  swapFN() 
}
else
{
  noSwapFN()
}

compare()


}

//checks the lives left
const checklives=()=>{
  if(lives<=1)
  {
    setPlaying(false)
    setDone(true)
  }

}

//timerstuff
const displayTime = () => {
  let minutes = Math.floor((time/100/60)).toString().padStart(2,"0");
  let seconds = Math.floor((time/100%60)).toString().padStart(2,"0");
  let ms = (time).toString().padStart(2,"0").slice(-2);
  return minutes+":"+seconds+":"+ms;
  }


  //lives stuff
  const drawLives = () => {
    let dispLives = [];
    for (let i = 0; i < lives; i++) {
      dispLives.push(<label key={i} style={{border:"solid 1px black"}}>{"<3"}</label>);
    }
    return (
      <div>
          {
            dispLives
          }
      </div>
    );
  }


  //displays tutorial messages
const displaytut = () => {
  
if(playing){

  if(swap)
  {
  return (<div><label>since the number highlighted in green is larger than the number highlighted in red, swap them</label></div>)
  }
  else
  {
    return (<div><label>compare and move on </label></div>)
  }

}
else if (done)
{
  SoundPlay(audioClips[1])
  return (<div><label>Array is Sorted tutorial complete </label></div>)
}

}


//winner checks

const displayWinner=() => {

  if(winner){
   
  
    SoundPlay(audioClips[1])
return (<div><label>You Have Won......Yay!</label></div>)
  }
  else{
    SoundPlay(audioClips[0])
    return (<div><label>You Have Lost, take a break and watch Shrek 2 </label></div>)
  }



}
//restart button handeling
const restart=()=>{
  
  authAxios.post('https://server-346001.ue.r.appspot.com/newStat',{
  level: difficulty,
  algorithm: "Bubble Sort",
  time: time,
  lives: lives,
  success: winner
}).then(res=>console.log(res)).catch(err=>console.log(err));


  setArray([])
setSortedArray([1])
setBarEffects([])
setPlaying(false)
setBaseArray([])
setIndex([index[0]=0,index[1]=1]);
setLengt(lengt[0]=0)
setTime(0)
setDone(false)
setlives(3)
setWinner(false)
setUserArray("")
setIsCorrect(0)
}

//display handeling
 const display=()=>{

return(<div>
  {(!playing&&!done)&&difficulty==4?<input type="text" className="uiArr" placeholder="a,b,c but in numbers" required onChange={e=>setUserArray(e.target.value)}></input>:null}
  {(playing||done)&&difficulty>0?<label className="timer">{displayTime()}</label>:null}
<div className="array">
  {displayedArray.map((value, index)=>(
    <button className="button" key={index}
    style={{ left: index*30,
             width:50,
             bottom: 0,
             height:50,
             backgroundColor: barEffects[index],
          }}
          title={`Value: ${value}`}
          >{value}</button>
  ))}


  </div>
  <br/>
  <div>
  
  {!playing&&!done?<button className="choices" onClick={() => createArray()}>Start</button>:null}
  </div>

  <div>
  {playing&&difficulty>=0?<button className="choices" onClick={swapBTN}>Swap</button>:null}
  {playing&&difficulty>=0?<div className="divider"/>:null}
  {playing&&difficulty>=0?<button className="choices" onClick={noSwapBTN}>Don't Swap</button>:null}

  {playing&&difficulty==-1?<button className="choices" onClick={nxtStep}>Next Step</button>:null}
  </div>
  <br/>
  {difficulty<1?displaytut():null}
  {difficulty>0&&done?displayWinner():null}
  {difficulty>0&&playing&&difficulty!=4?drawLives():null}

  <br/>
  {playing&&isCorrect==1?<label>Correct</label>:null}
  {playing&&isCorrect==2?<label>Incorrect</label>:null}
  {done?<button onClick={restart}>Restart?</button>:null}
  </div>)

  
 }
 
 
 
  return (
    <div className="App">
      <h1>Bubble Sort {difficulty==-1?'Tutorial Lesson':null} {difficulty==0?'Practice Level':null} {difficulty==1?'Level 1':null} {difficulty==2?'Level 2':null} {difficulty==3?'Level 3':null}{difficulty==5?'Level 4':null} {difficulty==4?'Custom Level':null}</h1>
      {display()}
    </div>
  );
}

export default BSApp;
