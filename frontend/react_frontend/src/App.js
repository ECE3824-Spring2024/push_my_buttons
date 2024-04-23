import React, { useState, useEffect, useRef } from 'react'
import { Bar, Line } from 'react-chartjs-2';
import "chart.js/auto";
import 'chartjs-adapter-moment';
import moment from 'moment';
import 'moment-timezone';
import 'moment/locale/en-au';

function App() {
  
  const [presses_A, setPressesA] = useState(0);
  const [presses_B, setPressesB] = useState(0);

  const [var_presses_A, setVarPressesA] = useState([]);
  const [var_presses_B, setVarPressesB] = useState([]);

  const chartRef = useRef(null);

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
      const intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds

      // Clear interval on component unmount
      return () => clearInterval(intervalId);
  }, []);

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
    const intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds

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
    labels: ['Michael Caiozzo', 'Mike Tyson'],
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
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0,
            },
        },
    },
  };

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
      <center>
          <h1><strong>The Great Debate</strong></h1>
          <h2>Who is the better Mike?</h2>
      </center>
      <div
          style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "300%",
              height: "100vh",
              padding: "2rem",
          }}
      >
          <div
              style={{
                  ...boxStyle,
                  backgroundColor: presses_A > presses_B ? "springgreen" : "tomato",
              }}
          >
              <h3>Michael Caiozzo</h3>
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
              <h3>Mike Tyson</h3>
              <div
                  style={{
                      fontSize: "80%",
                      marginTop: "1rem",
                  }}
              >
                  {presses_B}
              </div>
          </div>
      </div>
      <div style={{ width: '50%', margin: 'auto' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div style={{ width: '70%', margin: 'auto' }}>
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
            options={{
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
            }}
        />
    </div>
    </div>
  )
}

export default App;
