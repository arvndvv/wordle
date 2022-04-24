import React, { Component } from 'react';
import './App.css';
import HandleWords from './components/handleWords/handleWords.component'
class App extends Component {
  render() {
    return (
      <div className="App">
        <HandleWords/>
      </div>
    );
  }
}

export default App;
