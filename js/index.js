const width = 1000;
const barWidth = 500;
const height = 500;
const margin = 30;

const yearLable = d3.select('#year');
const countryName = d3.select('#country-name');

const barChart = d3.select('#bar-chart')
            .attr('width', barWidth)
            .attr('height', height);

const scatterPlot  = d3.select('#scatter-plot')
            .attr('width', width)
            .attr('height', height);

const lineChart = d3.select('#line-chart')
            .attr('width', width)
            .attr('height', height);

let xParam = 'fertility-rate';
let yParam = 'child-mortality';
let rParam = 'gdp';
let year = '2000';
let param = 'child-mortality';
let lineParam = 'gdp';
let highlighted = '';
let selected;

const x = d3.scaleLinear().range([margin*2, width-margin]);
const y = d3.scaleLinear().range([height-margin, margin]);

const xBar = d3.scaleBand().range([margin*2, barWidth-margin]).padding(0.1);
const yBar = d3.scaleLinear().range([height-margin, margin])

const xAxis = scatterPlot.append('g').attr('transform', `translate(0, ${height-margin})`);
const yAxis = scatterPlot.append('g').attr('transform', `translate(${margin*2}, 0)`);

const xLineAxis = lineChart.append('g').attr('transform', `translate(0, ${height-margin})`);
const yLineAxis = lineChart.append('g').attr('transform', `translate(${margin*2}, 0)`);

const xBarAxis = barChart.append('g').attr('transform', `translate(0, ${height-margin})`);
const yBarAxis = barChart.append('g').attr('transform', `translate(${margin*2}, 0)`);

const colorScale = d3.scaleOrdinal().range(['#DD4949', '#39CDA1', '#FD710C', '#A14BE5']);
const radiusScale = d3.scaleSqrt().range([10, 30]);

loadData().then(data => {

    colorScale.domain(d3.set(data.map(d=>d.region)).values());

    d3.select('#range').on('change', function(){ 
        year = d3.select(this).property('value');
        yearLable.html(year);
        updateScattePlot();
        updateBar();
    });

    d3.select('#radius').on('change', function(){ 
        rParam = d3.select(this).property('value');
        updateScattePlot();
    });

    d3.select('#x').on('change', function(){ 
        xParam = d3.select(this).property('value');
        updateScattePlot();
    });

    d3.select('#y').on('change', function(){ 
        yParam = d3.select(this).property('value');
        updateScattePlot();
    });

    d3.select('#param').on('change', function(){ 
        param = d3.select(this).property('value');
        updateBar();
    });

    function updateBar(){
        return;
    }

    function updateScattePlot(){
        return;
    }

    function drawAxis() {
        xMax = Math.max(...data.map(o => o[xParam][year]), 0);
        yMax = Math.max(...data.map(o => o[yParam][year]), 0);
        zMax = Math.max(...data.map(o => o[rParam][year]), 0);
        x.domain([0, xMax]);
        xAxis.call(d3.axisBottom(x).ticks(10));  

        y.domain([0, yMax]);
        yAxis.call(d3.axisLeft(y).ticks(10));                  

        radiusScale.domain([0, zMax]);

        scatterPlot.append("text")
        .attr("text-anchor", "end")
        .attr("y", `${height - margin - 20}`)
        .attr("x", `${width - margin}`)
        .text(xParam);        

        scatterPlot.append("text")
        .attr("text-anchor", "end")
        .attr("y", `${margin}`)
        .attr("x", `${margin + 90}`)
        .text(yParam);                
    }

    function drawBubbleChart(radius_label=rParam, x_label=xParam, y_label=yParam, year=2000) {
        console.log(data);
        scatterPlot
        .selectAll("circle")
        .data(data).enter()
        .append("circle")
        .attr("cx", function(d) {
            if (d[x_label]) {
                return x(d[x_label][year] || 0)
            }}
        )
        .attr("cy", function(d) {
            if (d[y_label]) {
                return y(d[y_label][year] || 0)
            }}
        )
        .attr("r", function(d) {
            if (d[radius_label]) {
                return radiusScale(d[radius_label][year] || 0)
            }}            
        )
        .attr("fill", function(d) {
            return colorScale(d.region);
        });        
    }

    updateBar();
    updateScattePlot();

    drawAxis();  
    drawBubbleChart();    
});


async function loadData() {
    const data = { 
        'population': await d3.csv('data/population.csv'),
        'gdp': await d3.csv('data/gdp.csv'),
        'child-mortality': await d3.csv('data/cmu5.csv'),
        'life-expectancy': await d3.csv('data/life_expectancy.csv'),
        'fertility-rate': await d3.csv('data/fertility-rate.csv')
    };

    console.log(data);
    
    return data.population.map(d=>{
        const index = data.gdp.findIndex(item => item.geo == d.geo);
        return  {
            country: d.country,
            geo: d.geo,
            region: d.region,
            population: d,
            'gdp': data['gdp'][index],
            'child-mortality': data['child-mortality'][index],
            'life-expectancy': data['life-expectancy'][index],
            'fertility-rate': data['fertility-rate'][index]
        }
    })
}