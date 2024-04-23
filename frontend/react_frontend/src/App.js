import React, { useState, useEffect, useRef } from 'react'
import { Bar, Line } from 'react-chartjs-2';
import "chart.js/auto";
import 'chartjs-adapter-moment';
import moment from 'moment';
import 'moment-timezone';
import 'moment/locale/en-au';
import './App.css';

function App() {

    const option_A = "Fight 100 duck-sized horses"
    const option_B = "Fight horse-sized ducks"

    const [selectedOption, setSelectedOption] = useState('option1');
    const [state1, setState1] = useState(true);
    const [state2, setState2] = useState(false);
    const [state3, setState3] = useState(false);
  
  const [presses_A, setPressesA] = useState(0);
  const [presses_B, setPressesB] = useState(0);

  const [var_presses_A, setVarPressesA] = useState([]);
  const [var_presses_B, setVarPressesB] = useState([]);

  const chartRef = useRef(null);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    switch (event.target.value) {
        case 'option1':
          setState1(true);
          setState2(false);
          setState3(false);
          break;
        case 'option2':
          setState1(false);
          setState2(true);
          setState3(false);
          break;
        case 'option3':
          setState1(false);
          setState2(false);
          setState3(true);
          break;
        default:
          break;
  };
}

  useEffect(() => {
      const fetchData = async () => {
          try {
              const response = await fetch('/total_count');
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              const data = await response.json();
              setPressesA(data.total_presses_A);
              setPressesB(data.total_presses_B);
          } catch (error) {
              console.error('There was a problem fetching the data:', error.message);
          }
      };

      // Initial fetch
      fetchData();

      // Polling interval
      let intervalId;
      if (!state3) {
        intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds
      }
      else {
        intervalId = null;
      }
  
      // Clear interval on component unmount
      return () => clearInterval(intervalId);
  }, [state3]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await fetch('/variable_count');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const { var_presses_A, var_presses_B } = await response.json();
            setVarPressesA(prevDataA => [...prevDataA, ...var_presses_A]);
            setVarPressesB(prevDataB => [...prevDataB, ...var_presses_B]);
        } catch (error) {
            console.error('There was a problem fetching the data:', error.message);
        }
    };

    // Initial fetch
    fetchData();

    // Polling interval
    const intervalId = setInterval(fetchData, 2000); // Poll every 5 seconds

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
    }, []);

  const boxStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "2px solid #ccc",
    borderRadius: "10px",
    padding: "1rem",
    margin: "0.5rem",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  };

  const chartData = {
    labels: [option_A, option_B],
    datasets: [
        {
            label: 'Presses',
            data: [presses_A, presses_B],
            backgroundColor: [
                presses_A > presses_B ? 'green' : 'red',
                presses_B > presses_A ? 'green' : 'red',
            ],
        },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive:true,
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0,
            },
        },
    },
  };


  const lineChartOptions = {
    maintainAspectRatio: false,
    responsive:true,
    scales: {
        x: {
            type: 'time',
            time: {
                unit: 'second',
                displayFormats: {
                    //minute: 'MMM D, YYYY, h:mm A'
                    second: 'MMM D, YYYY, h:mm:ss A'
                }
            },
        },
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0,
            },
        },
    },
}

  const formatData = (data) => {
    return {
        labels: data.map(entry => moment(entry.timestamp).format('MMM D, YYYY, h:mm:ss A')),
        datasets: [{
            label: 'Presses',
            data: data.map(entry => entry.count),
            borderColor: 'blue',
            fill: false,
        }],
    };
};
    
    useEffect(() => {
        if (var_presses_A.length > 0 && chartRef.current) {
            chartRef.current.data.datasets[0].data = var_presses_A.map(entry => entry.count);
            chartRef.current.data.labels = var_presses_A.map(entry => moment(entry.timestamp).format('MMM D, YYYY, h:mm:ss A'));
            chartRef.current.update();
        }
    }, [var_presses_A]);

    useEffect(() => {
        if (var_presses_B.length > 0 && chartRef.current) {
            chartRef.current.data.datasets[1].data = var_presses_B.map(entry => entry.count);
            chartRef.current.update();
        }
    }, [var_presses_B]);

  return (
    <div>
        <div class="mt-5"></div>
      <center>
          <h1><strong>The Great Debate</strong></h1>

     <div className="container mt-5">
      <h1 className="text-center">Would You Rather...</h1>

      <div className="row justify-content-center mt-4">
        <div className="col-md-5">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">{option_A}?</h5>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">{option_B}?</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
      </center>
         <div className="container mt-5">
      <h2 className="text-center">Select data visualization format:</h2>

      <div className="d-flex justify-content-center mt-4">
        <div className="btn-group btn-group-toggle" data-toggle="buttons">
          <label className={`btn btn-outline-primary ${selectedOption === 'option1' ? 'active' : ''}`}>
            <input
              type="radio"
              value="option1"
              checked={selectedOption === 'option1'}
              onChange={handleOptionChange}
            />
            &nbsp;Counter
          </label>

          <label className={`btn btn-outline-primary ${selectedOption === 'option2' ? 'active' : ''}`}>
            <input
              type="radio"
              value="option2"
              checked={selectedOption === 'option2'}
              onChange={handleOptionChange}
            />
            &nbsp;Bar Chart
          </label>

          <label className={`btn btn-outline-primary ${selectedOption === 'option3' ? 'active' : ''}`}>
            <input
              type="radio"
              value="option3"
              checked={selectedOption === 'option3'}
              onChange={handleOptionChange}
            />
            &nbsp;Timeseries
          </label>
        </div>
      </div>
    </div>
    {state1 && 
      <div
          style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "300%",
              height: "50vh",
              padding: "2rem",
          }}
      >
          <div
              style={{
                  ...boxStyle,
                  backgroundColor: presses_A > presses_B ? "springgreen" : "tomato",
              }}
          >
              <h3>{option_A}</h3>
              <div
                  style={{
                      fontSize: "80%",
                      marginTop: "1rem",
                  }}
              >
                  {presses_A}
              </div>
          </div>
          <div
              style={{
                  ...boxStyle,
                  backgroundColor: presses_B > presses_A ? "springgreen" : "tomato",
              }}
          >
              <h3>{option_B}</h3>
              <div
                  style={{
                      fontSize: "80%",
                      marginTop: "1rem",
                  }}
              >
                  {presses_B}
              </div>
          </div>
      </div>}

      {state2 &&
      <div className="mt-5">
      <h2 className="text-center">Bar Chart (Race)</h2>
      <div class="mt-5"></div>
      <div style={{ width: '50%', margin: 'auto', height: "40vh"}}>
        <Bar data={chartData} options={chartOptions} />
      </div>
      </div>}
      {state3 && 
      <div className="mt-5">
      <h2 className="text-center">Timeseries Plot (Presses versus Time)</h2>
      <div class="mt-5"></div>
      <div style={{ width: '70%', margin: 'auto',height: "40vh", }}>
        <Line
            ref={chartRef}
            data={{
                datasets: [
                    {
                        ...formatData(var_presses_A),
                        label: 'Michael Caiozzo',
                        borderColor: 'blue',
                    },
                    {
                        ...formatData(var_presses_B),
                        label: 'Mike Tyson',
                        borderColor: 'red',
                    },
                ],
            }}
            options={lineChartOptions}
        />
    </div>
    </div>}
    </div>
  )
}

export default App;
