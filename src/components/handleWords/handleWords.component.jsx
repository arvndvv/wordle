import React,{useEffect,useState} from 'react';
import './handleWords.styles.css';
const HandleWords = ()=>{
    const alphabets = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
    const randomWordApi = 'https://random-word-api.herokuapp.com/all';
    const DictionaryApi = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
    const [currentInput, setCurrentInput] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [wordle,setWordle] = useState('');
    const [toaster,setToaster] = useState('');
    const [inputMatrix,setinputMatrix]=useState([
        [{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'}],
        [{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'}],
        [{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'}],
        [{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'}],
        [{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'}],
        [{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'},{letter:'',class:'inActive'}],
          ])
    const checkIfWordExist = async (word)=>{
            const response = await fetch(DictionaryApi+word);
            const data = await response.json();
            const hasMeaning = !!data[0];
            return hasMeaning;
    }
    const getRandomWord = async (filteredWords)=>{
        return filteredWords[Math.floor(Math.random()*filteredWords.length)];
    }
    const getValidWord = async ()=>{
        const respose = await fetch(randomWordApi);
        const words = await respose.json();
        const filteredWords = words.filter(word=>word.length===5);
        let wordExist = false;
        let word = '';
        while(!wordExist){
            word = await getRandomWord(filteredWords);
            wordExist = await checkIfWordExist(word);
        }
        return word.toLowerCase();
    }
    const showToaster = (msg,persist=false)=>{
        setToaster(msg);
        if(!persist){
            setTimeout(() => {
                setToaster('')
            }, 2000);
        }
    }
    useEffect(() => {
        (async () => {
            const word = await getValidWord();
            setWordle(word)
        })()
    }, []);
    useEffect(() => {
        const handleKeyDown = async(e)=>{
            if(!wordle.length || currentIndex === 6){
                return;
            }
            const keyPressed = e.key.toLowerCase();
            if(!alphabets.includes(keyPressed)){
                if(keyPressed==='backspace' && currentInput.length){
                    setCurrentInput(currentInput.slice(0,-1))
                }
                if(keyPressed==='enter' && currentInput.length === 5){
                    const wordExist = await checkIfWordExist(currentInput);
                    if(!wordExist){
                        showToaster('Not in wordlist')
                        return;
                    }
                    const lowerCaseInput = currentInput.toLowerCase();
                    const currentInputArray = lowerCaseInput.split('');
                    let wordsHistory = inputMatrix;
                    let inputMatrixCurrentRow = wordsHistory[currentIndex];
                    currentInputArray.forEach((letter,index)=>{
                        let className = 'not-match';
                        if(wordle[index] === letter){
                            className = 'exact-match'
                        }
                        else if(wordle.includes(letter)){
                            const countOfLetterInWordle = (wordle.match(new RegExp(letter, "g")) || []).length;
                            const countOfLetterInInput = (lowerCaseInput.match(new RegExp(letter, "g")) || []).length;
                            if(countOfLetterInWordle >= countOfLetterInInput){
                                className = 'scrambled'
                            }
                            else{
                                const InputHasLettersInExactPlaces = wordle.split('').every((wordleLetter,index)=>{
                                    if(wordleLetter===letter){
                                       return currentInputArray[index]===letter;
                                    }
                                    else{
                                        return true;
                                    }
                                })
                                if(!InputHasLettersInExactPlaces){
                                    const AlreadyMatched = inputMatrixCurrentRow.filter(col=>col.letter===letter);
                                    if(AlreadyMatched.length < countOfLetterInWordle){
                                    className = 'scrambled'
                                    }
                                }
                            }
                        }
                        inputMatrixCurrentRow[index].letter=letter;
                        inputMatrixCurrentRow[index].class = className;
                    })
                    setinputMatrix(wordsHistory);
                    if(currentInput===wordle){
                        setCurrentIndex(6);
                        setCurrentInput('');
                        //success
                        showToaster('Genius! You guess it right!',true);
                        return;
                    }
                    setCurrentIndex(currentIndex+1);
                    setCurrentInput('');
                    if(currentIndex===5){
                        showToaster(wordle.toUpperCase(),true)
                    }
                }
                return;
            }
            if(currentInput.length===5){
                return;
            }
            setCurrentInput(currentInput+keyPressed)
          }
      
          document.addEventListener('keydown', handleKeyDown);
      
          return function cleanup() {
            document.removeEventListener('keydown', handleKeyDown);
          }
    }, [currentInput,wordle]);
return(
    <div className='main_wrapper'>
        <input type="text" />
        <div className='wrapper'>
        <h1>WORDLE</h1>
        <p>{wordle?'Type your Guess':'Getting word for you...'}</p>

        <div className={"wordle " + (!wordle?'isloading':'')}>
{!wordle?<div className="loading"></div>:''}

            {
                toaster ?
            <div className="toaster">{toaster}</div> 
            :''
            }
            {
                inputMatrix.map((row,index)=>(
                    <div className={'row ' + (index===currentIndex ? 'input' : '')} key={index}>
                        {
                            row.map((col,colIndex)=>(
                                <div className={'col ' + col.class} key={colIndex}>{index===currentIndex?(currentInput[colIndex]||''):(col.letter)}</div>
                            ))
                        }
                    </div>
                ))
            }
        </div>
        </div>
        <div className="credits">
            <strong>APIs Used:</strong>

                <a href='https://dictionaryapi.dev/'>Dictionary Api</a>
                <a href='https://random-word-api.herokuapp.com/home'>Words Api</a>


        </div>
        {/* ☕  */}
   <div className="footer">
       <div>
           Drink ☕ & code JS 
       </div>
       <div>
       Coded with <span className='heart'>♥</span> <a href='https://arvndvv.github.io'>Aravind</a></div>
       </div>
    </div>
)
}
export default HandleWords;
