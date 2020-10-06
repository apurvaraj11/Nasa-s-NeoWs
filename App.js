import React, { Component } from 'react';
import { Bar, Line} from 'react-chartjs-2';
import { Button } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.css";
import './App.css';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      loading: false,
      error: null,
      api_key: 'V0z82oMb9gRpiQFk3lHddN4Z4TymIzwSjlQDV4F2',
      start_date: '',
      end_date: '',
      stats: { fastest: 0, closest: 7890.00, fastestData: {}, closestData: {},avgMaxSize:0,avgMinSize:0 }
    }
    this.fetchData = this.fetchData.bind(this)
    this.setDate = this.setDate.bind(this)
  }

  fetchData(e) {
    const { api_key, start_date, end_date } = this.state
    fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${start_date}&end_date=${end_date}&api_key=${api_key}`).then((data) => data.json()).then((data) => {
      this.setState({ error: null, data, stats: this.formateData(data) })

    }).catch((error) => {
      this.setState({ error })
    })
    if (e) {
      e.preventDefault()
    }
  }

  formateData(data) {
    const dataArr = Object.keys(data.near_earth_objects).reduce((acc, date) => acc.concat(data.near_earth_objects[date]), [])

    const stats = dataArr.reduce((acc, data) => {
      acc.avgMaxSize=acc.avgMaxSize + data.estimated_diameter.kilometers.estimated_diameter_max
      acc.avgMinSize=acc.avgMinSize + data.estimated_diameter.kilometers.estimated_diameter_min
      
      console.log('Prev',acc.fastest, 'Next', data.close_approach_data[0].relative_velocity.kilometers_per_second)  //For debugging purposes

      if (parseFloat(acc.fastest) < parseFloat(data.close_approach_data[0].relative_velocity.kilometers_per_second)) {
        acc.fastest = data.close_approach_data[0].relative_velocity.kilometers_per_second;
        acc.fastestData = data;
      }

      console.log('Prev',acc.closest, 'Next', data.close_approach_data[0].miss_distance.astronomical)   //For debugging purposes

      if (parseFloat(acc.closest) > parseFloat(data.close_approach_data[0].miss_distance.astronomical)) {
        acc.closest = data.close_approach_data[0].miss_distance.astronomical;
        acc.closestData = data;
      }
      return acc;
    }, { fastest: 0.00, closest: 7890.00, fastestData: {}, closestData: {},avgMaxSize:0,avgMinSize:0 })
    
    console.log(stats)   //For debugging purposes

    stats.avgMaxSize=stats.avgMaxSize/dataArr.length
    stats.avgMinSize=stats.avgMaxSize/dataArr.length
    return stats;
  }

  setDate(e) {
    this.setState({ [e.target.name]: e.target.value })
    e.preventDefault()
  }

  render() {
    const { start_date, end_date, data, stats } = this.state;
    let state = {}
    if (data.near_earth_objects) {
      state = {
        labels: Object.keys(data.near_earth_objects),
        datasets: [
          {
            label: 'Asteroids ',
            backgroundColor: 'rgb(240, 128, 128)',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 2,
            data: Object.keys(data.near_earth_objects).map(item => data.near_earth_objects[item].length)
          }
        ]
      }
    }

    return (
      <div className="App">
        <h1>Welcome, inquisitive viewer!</h1>
        <p>You will get the details about various asteroids passing near the Earth here.
        All you need to do is select a starting and an ending date, and you are ready to go.</p>
        <p>But, before that, let's take a sneak-peek towards what asteroids really are.</p>
        <p>Asteroids are minor planets, especially of the inner Solar System. Larger asteroids have also been called planetoids. These terms have historically been applied to any astronomical object orbiting the Sun that did not resolve into a disc in a telescope and was not observed to have characteristics of an active comet such as a tail. As minor planets in the outer Solar System were discovered that were found to have volatile-rich surfaces similar to comets, these came to be distinguished from the
        objects found in the main asteroid belt.</p>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Asteroids-KnownNearEarthObjects-Animation-UpTo20180101.gif/370px-Asteroids-KnownNearEarthObjects-Animation-UpTo20180101.gif" width="390" height="230" align="right"/>
        
        <form class="formstyle">
          <label><strong>Start Date :&nbsp;</strong></label>
          <input type="date" id="start date" name="start_date" onChange={this.setDate} value={start_date} />
          
          <label>&nbsp;&nbsp;&nbsp;&nbsp;<strong>End Date :&nbsp;</strong></label>
          <input type="date" id="end date" name="end_date" onChange={this.setDate} value={end_date} />
          <br/>
          <button type="button" onClick={this.fetchData} className="btn btn-primary">Submit</button>
        </form>

        <div class="records">
          {stats.fastestData.name && <div><strong>Fastest Asteroid in km/h :</strong> {stats.fastestData.name} </div>}
          {stats.closestData.name && <div><strong>Closest Asteroid :</strong> {stats.closestData.name}</div>}
          {stats.avgMaxSize ? <div><strong>Average Maximum Size :</strong> {stats.avgMaxSize} km</div>:null}
          {stats.avgMinSize ? <div><strong>Average Mininimum Size :</strong> {stats.avgMinSize} km</div>:null}
        </div>

        <br/><br/>
        {data.near_earth_objects && <div class="Chart1">
          <Bar
            data={state}
            options={{
              title: {
                display: true,
                text: 'Number of asteroids for each day',
                fontSize: 20
              },
              legend: {
                display: true,
                position: 'right'
              },
              scales: {
                xAxes: [{
                  display: true
                }],
                yAxes: [{
                  display: true,
                  ticks:
                  {
                    min: 0
                  }
                }],
              }
            }}
        />
        </div>};

        {data.near_earth_objects && <div class="Chart2">
          <Line
            data={state}
            options={{
              title: {
                display: true,
                text: 'Number of asteroids for each day',
                fontSize: 20
              },
              legend: {
                display: true,
                position: 'right'
              },
              scales: {
                xAxes: [{
                  display: true
                }],
                yAxes: [{
                  display: true,
                  ticks:
                  {
                    min: 0
                  }
                }],
              }
            }}
          />
        </div>}

        <div>
          {data.near_earth_objects && Object.keys(data.near_earth_objects).map((date, index) => {
            return <div>
              <div class="tabular"><label><strong>Date :</strong>&nbsp;</label><strong><em>{date}</em></strong></div>
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">Sl. No.</th>
                    <th scope="col">Name</th>
                    <th scope="col">Absolute Magnitude</th>
                    <th scope="col">Close Approach Date</th>
                  </tr>
                </thead>

                <tbody>
                  {data.near_earth_objects[date].map((item, i) => {
                    return <tr>
                      <th scope="row">{i}</th>
                      <td>{item.name}</td>
                      <td>{item.absolute_magnitude_h}</td>
                      <td>{item.close_approach_data[0].close_approach_date}</td>
                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          })}
        </div>
      </div>
    );
  }
}

export default App;