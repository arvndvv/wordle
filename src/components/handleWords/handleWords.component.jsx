import React,{useEffect,useState} from 'react';
import './handleWords.styles.css';
import clearImg from '../../assets/img/backspace.svg';
import WordsData from '../../data/data.json'
const HandleWords = ()=>{
    const alphabets = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
    const DictionaryApi = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
    const [currentInput, setCurrentInput] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [wordle,setWordle] = useState('');
    const [toaster,setToaster] = useState('');
    const [keyBoard,setKeyBoard] = useState([
        [{value:'q',class:'inactive'},{value:'w',class:'inactive'},{value:'e',class:'inactive'},{value:'r',class:'inactive'},{value:'t',class:'inactive'},{value:'y',class:'inactive'},{value:'u',class:'inactive'},{value:'i',class:'inactive'},{value:'o',class:'inactive'},{value:'p',class:'inactive'}],
        [{value:'a',class:'inactive'},{value:'s',class:'inactive'},{value:'d',class:'inactive'},{value:'f',class:'inactive'},{value:'g',class:'inactive'},{value:'h',class:'inactive'},{value:'j',class:'inactive'},{value:'k',class:'inactive'},{value:'l',class:'inactive'}],
        [{value:'enter',class:'inactive'},{value:'z',class:'inactive'},{value:'x',class:'inactive'},{value:'c',class:'inactive'},{value:'v',class:'inactive'},{value:'b',class:'inactive'},{value:'n',class:'inactive'},{value:'m',class:'inactive'},{value:'backspace',class:'inactive'}]
    ]);
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
    const getRandomWord = (filteredWords)=>{
        return filteredWords[Math.floor(Math.random()*filteredWords.length)];
    }
    const getValidWord = async ()=>{
        const filteredWords = WordsData;
        let wordExist = false;
        let word = '';
        while(!wordExist){
            word = getRandomWord(filteredWords);
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
    const updateKeyboardData = (keyBoardDummy,letter,className='scrambled',condition='not-equal',match='exact-match')=>{
        return keyBoardDummy.map(row =>(
            row.map(col=>{
                if(col.value===letter){
                    if(condition==='not-equal'){
                        if(col.class!== match){
                            return {...col,class:className}
                        }
                    }else if(condition ==='equal'){
                        if(col.class=== match){
                            return {...col,class:className}
                        }
                    }
                }
                return col
            })
        ));
    }
    useEffect(() => {
        (async () => {
            const word = await getValidWord();
            setWordle(word)
        })()
    }, []);
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
                let keyBoardDummy = keyBoard;
                currentInputArray.forEach((letter,index)=>{
                    let className = 'not-match';
                    console.log(letter);
                    if(wordle[index] === letter){
                        className = 'exact-match';
                        keyBoardDummy = updateKeyboardData(keyBoardDummy,letter,'exact-match','not-equal','exact-match');
                   }
                    else if(wordle.includes(letter)){
                        const countOfLetterInWordle = (wordle.match(new RegExp(letter, "g")) || []).length;
                        const countOfLetterInInput = (lowerCaseInput.match(new RegExp(letter, "g")) || []).length;
                        if(countOfLetterInWordle >= countOfLetterInInput){
                            className = 'scrambled';
                            keyBoardDummy = updateKeyboardData(keyBoardDummy,letter,'scrambled','not-equal','exact-match');
                        
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
                                className = 'scrambled';
                                keyBoardDummy = updateKeyboardData(keyBoardDummy,letter,'scrambled','not-equal','exact-match');
                            
                                }

                            }
                        }
                    }
                    if(className==='not-match'){
                        keyBoardDummy = updateKeyboardData(keyBoardDummy,letter,'not-match','equal','inactive');
                        
                    }
                    inputMatrixCurrentRow[index].letter=letter;
                    inputMatrixCurrentRow[index].class = className;
                })
                setKeyBoard(keyBoardDummy);
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
    useEffect(() => {
      
          document.addEventListener('keydown', handleKeyDown);
          return function cleanup() {
            document.removeEventListener('keydown', handleKeyDown);
          }
    }, [currentInput,wordle]);
return(
    <div className='main_wrapper'>
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
        <div className="keyboard">
            {
                keyBoard.map((row,index)=>(
                    <div className="row" key={index}>
                        {
                            row.map((col,colIndex)=>(
                                <div className={'col ' + col.class} key={colIndex} onClick={()=>{handleKeyDown({key:col.value})}}>
                                    {col.value==='backspace'?(<img src={clearImg} alt="clear"/>): col.value}
                                </div>
                            ))
                        }
                        </div>
                ))
            }
        </div>
        <div className="credits">
            <strong>API Used:</strong>

                <a href='https://dictionaryapi.dev/'>Dictionary Api</a>


        </div>
        <div className="footer">
       <div>
       Coded with <span className='heart'>♥</span> <a href='https://arvndvv.github.io'>Aravind</a></div>
       </div>
          </div>
)
}
export default HandleWords;
