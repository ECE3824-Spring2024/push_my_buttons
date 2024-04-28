/* 
@brief Runs a React frontend that displays interactive graphs.

@section Description
This program drives the React frontend, which constantly polls
a Flask backend. The Flask backend queries a Redis database, and
ships the results to this frontend to be displayed using chartjs.

@section Author
- Muho Ahmed, Michael Caiozzo, Anna Chau, Luke Dewees, John Nori, and Abraham Paroya (c) 2024
*/

// IMPORTS
import React, { useState, useEffect, useRef } from 'react'
import { Bar, Line } from 'react-chartjs-2';
import "chart.js/auto";
import 'chartjs-adapter-moment';
import moment from 'moment';
import 'moment-timezone';
import 'moment/locale/en-au';
import './App.css';

// The Frontend Application
function App() {

    /////////////// STATE and DATA VARIABLES  ///////////////

    // variables that control the question and the two options
    const question = "Would you rather ...";
    const option_A = "Fight 100 duck-sized horses";
    const option_B = "Fight a single horse-sized duck";

    // variables that store the current state of the radio button
    const [selected_option, set_selected_option] = useState('option1');
    const [state_counter, set_state_counter]     = useState(true);
    const [state_bar, set_state_bar]             = useState(false);
    const [state_line, set_state_line]           = useState(false);

    // variables that store the total number of times each button has been pressed
    const [presses_A, set_presses_A] = useState(0);
    const [presses_B, set_presses_B] = useState(0);

    // variables (arrays) that store the timeseries data for displaying presses over time
    const [var_presses_A, set_var_presses_A] = useState([]);
    const [var_presses_B, set_var_presses_B] = useState([]);

    // reference to the timeseries line chart
    const chart_reference = useRef(null);
    
    ///////////////  STYLING VARIABLES  ///////////////

    // styling for counters
    const counter_style = {
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

    // styling for bar chart
    const bar_chart_data = {
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

    // options for bar chart
    const bar_chart_options = {
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

    // options for line chart
    const linebar_chart_options = {
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
    };

    ///////////////  ARROW FUNCTIONS  ///////////////

    // arrow function: handle_radio_change
    const handle_radio_change = (event) => {

        // update the variable that keeps track of which button is pressed
        set_selected_option(event.target.value);

        // determine which way the data should be displayed
        switch (event.target.value) {
            case 'option1':
                set_state_counter(true);
                set_state_bar(false);
                set_state_line(false);
                break;
            case 'option2':
                set_state_counter(false);
                set_state_bar(true);
                set_state_line(false);
                break;
            case 'option3':
                set_state_counter(false);
                set_state_bar(false);
                set_state_line(true);
                break;
            default:
                break;
        }
    }

    // arrow function: format_timeseries_data
    const format_timeseries_data = (data) => {

        // get the local timezone (UTC for now)
        const localTimezone = moment.tz.guess();

        // return the formatted timeseries data
        return {
            labels: data.map(entry => moment(entry.timestamp).tz(localTimezone).format('MMM D, YYYY, h:mm:ss A')),
            datasets: [
                {
                    label: 'Presses',
                    data: data.map(entry => entry.count),
                    borderColor: 'blue',
                    fill: false,
                }
            ],
        };
    }

    ///////////////  useEffect Hook INSTANCES  ///////////////

    // useEffect hook: initialize the timeseries graph for the last 10 hours (fires once)
    useEffect(() => {

        // arrow function: fetch_updated_data
        const fetch_updated_data = async () => {

            // try to retrieve data from the backend
            try {

                const response = await fetch('/initialize_count');

                if (!response.ok) {
                    throw new Error('Network response error!');
                }

                // parse the JSON data from the response
                const { var_presses_A, var_presses_B } = await response.json();

                // fetch the last 9 data points (9 hours)
                set_var_presses_A(prevDataA => [...prevDataA, ...var_presses_A]);
                set_var_presses_B(prevDataB => [...prevDataB, ...var_presses_B]);
            }
        
            catch (error) {
                console.error('[ERROR] Fetching data failed:', error.message);
            }
        }

        fetch_updated_data();
    }, [])

    // useEffect hook: poll for total count updates (conditionally ON)
    useEffect(() => {

        // arrow function: fetch_updated_data
        const fetch_updated_data = async () => {

            // try to retrieve data from the backend
            try {

                const response = await fetch('/total_count');

                if (!response.ok) {
                    throw new Error('Network response error!');
                }

                // parse the JSON data from the response
                const data = await response.json();

                // update the total count variables
                set_presses_A(data.total_presses_A);
                set_presses_B(data.total_presses_B);
            }
            
            catch (error) {
                console.error('[ERROR] Fetching data failed:', error.message);
            }
        }

        // call the function to fetch data (upon timer expiration)
        fetch_updated_data();

        // set the polling interval to 5 seconds only if the user is NOT looking
        // as the timeseries plot on the webpage
        let timer_period;
        if (!state_line) {

            // set the interval to 5 seconds
            timer_period = setInterval(fetch_updated_data, 5000);
        }
        else {

            // otherwise, do NOT continue polling so as to make more efficient use
            // of application resources
            timer_period = null;
        }
    
        // turn off the timer upon return
        return () => clearInterval(timer_period);
    
    }, [state_line])

    // useEffect hook: poll for variable counts every hour (always ON)
    useEffect(() => {

        // arrow function: fetch_updated_data
        const fetch_updated_data = async () => {

            // try to retrieve data from the backend
            try {
                
                const response = await fetch('/variable_count');
                
                if (!response.ok) {
                    throw new Error('Network response error!');
                }

                // parse the JSON data from the response
                const { var_presses_A, var_presses_B } = await response.json();

                // add new timeseries data to the existing arrays
                set_var_presses_A(prevDataA => [...prevDataA, ...var_presses_A].slice(-10));
                set_var_presses_B(prevDataB => [...prevDataB, ...var_presses_B].slice(-10));
            }

            catch (error) {
                console.error('There was a problem fetching the data:', error.message);
            }
        }

        // initial timeout to start after 5 seconds (forces graph update)
        const initialTimeout = setTimeout(() => {

            fetch_updated_data();

            // after the initial execution, set up a setInterval to repeat every 1 minute
            const interval = setInterval(() => {

                fetch_updated_data();

            }, 60000); // 1 hour = 3600000 milliseconds

            // turn off the timer upon return
            return () => clearInterval(interval);

        }, 5000); // 1000 milliseconds = 1 second

        // turn off the timer upon return
        return () => clearTimeout(initialTimeout);

    }, []);

    // useEffect hook: update the timeseries data array for the x-axis and option A
    useEffect(() => {

        // only update if new data is available
        if (var_presses_A.length > 0 && chart_reference.current) {

            // data for option A
            chart_reference.current.data.datasets[0].data = var_presses_A.map(entry => entry.count);

            // timestamp (same for option A and option B since data is fetched at the same time)
            chart_reference.current.data.labels = var_presses_A.map(entry => moment(entry.timestamp).format('MMM D, YYYY, h:mm:ss A'));

            // update the chart
            chart_reference.current.update();
        }
    }, [var_presses_A])

    // useEffect hook: update the timeseries data array for option B
    useEffect(() => {

        // only update if new data is available
        if (var_presses_B.length > 0 && chart_reference.current) {

            // data for option B
            chart_reference.current.data.datasets[1].data = var_presses_B.map(entry => entry.count);

            // update the chart
            chart_reference.current.update();
        }

    }, [var_presses_B])

    ///////////////  HTML Webpage Rendering  ///////////////
    return (

        <div>

            <div class="mt-5"></div>

            <div className="header">
                <h1 className="text-center"><strong>The Great Debate</strong></h1>
            </div>

            <div className="container mt-5">
                
                <h1 className="text-center">{question}</h1>
                
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

            <div className="container mt-5">

                <h2 className="text-center">Select data visualization format:</h2>
                
                <div className="d-flex justify-content-center mt-4">
                    <div className="btn-group btn-group-toggle" data-toggle="buttons">
                        <label className={`btn btn-outline-primary ${selected_option === 'option1' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                value="option1"
                                checked={selected_option === 'option1'}
                                onChange={handle_radio_change}
                            />
                            &nbsp;Counter
                        </label>

                        <label className={`btn btn-outline-primary ${selected_option === 'option2' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                value="option2"
                                checked={selected_option === 'option2'}
                                onChange={handle_radio_change}
                            />
                            &nbsp;Bar Chart
                        </label>

                        <label className={`btn btn-outline-primary ${selected_option === 'option3' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                value="option3"
                                checked={selected_option === 'option3'}
                                onChange={handle_radio_change}
                            />
                            &nbsp;Timeseries
                        </label>
                    </div>
                </div>
            </div>
            
            {state_counter && 
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
                            ...counter_style,
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
                            ...counter_style,
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
                </div>
            }

            {state_bar &&

                <div className="mt-5">

                    <h2 className="text-center">Bar Chart (Race)</h2>
                    
                    <div class="mt-5"></div>
            
                    <div style={{ width: '50%', height: '40vh', margin: 'auto'}}>
                        <Bar data={bar_chart_data} options={bar_chart_options} />
                    </div>
                </div>
            }


            {state_line && 

                <div className="mt-5">
                    
                    <h2 className="text-center">Timeseries Plot (Presses versus Time)</h2>
                    
                    <div class="mt-5"></div>
                    
                    <div style={{ width: '70%', margin: 'auto',height: "40vh", }}>
                        <Line
                            ref={chart_reference}
                            data={{
                                datasets: [
                                    {
                                        ...format_timeseries_data(var_presses_A),
                                        label: option_A,
                                        borderColor: 'blue',
                                    },
                                    {
                                        ...format_timeseries_data(var_presses_B),
                                        label: option_B,
                                        borderColor: 'red',
                                    },
                                ],
                            }}
                            options={linebar_chart_options}
                        />
                    </div>
                </div>
            }

    </div>

  )
}

export default App;
