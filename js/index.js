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

const xBarDomain = ["asia", "europe", "africa", "americas"];

let dataBackup = null;

loadData().then(data => {

    colorScale.domain(d3.set(data.map(d=>d.region)).values());

    d3.select('#range').on('change', function(){ 
        year = d3.select(this).property('value');
        yearLable.html(year);
        updateBar();
        updateScattePlot();
        updateBarForBarChart();
        updateBarChart();
    });

    d3.select('#radius').on('change', function(){ 
        rParam = d3.select(this).property('value');
        updateBar();
        updateScattePlot();
    });

    d3.select('#x').on('change', function(){ 
        xParam = d3.select(this).property('value');
        updateBar();
        updateScattePlot();
    });

    d3.select('#y').on('change', function(){ 
        yParam = d3.select(this).property('value');
        updateBar();
        updateScattePlot();
    });

    d3.select('#param').on('change', function(){ 
        param = d3.select(this).property('value');
        updateBarForBarChart();
        updateBarChart();
    });

    function updateBar(){
        scatterPlot.selectAll(".text-label-bubbles").remove();
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
        .attr("class", "text-label-bubbles")
        .attr("y", `${height - margin - 20}`)
        .attr("x", `${width - margin}`)
        .text(xParam);        

        scatterPlot.append("text")
        .attr("text-anchor", "end")
        .attr("class", "text-label-bubbles")
        .attr("y", `${margin}`)
        .attr("x", `${margin + 90}`)
        .text(yParam);    
    }

    function updateScattePlot(radius_label=rParam, x_label=xParam, y_label=yParam){
        console.log(data);
        scatterPlot.selectAll("circle").remove();
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

    function updateBarForBarChart() {
        barChart.selectAll(".text-label-bar").remove();
        
        xBar.domain(xBarDomain);
        xBarAxis.call(d3.axisBottom(xBar));  

        yBarAxis.call(d3.axisLeft(yBar).ticks(10));                  

        barChart.append("text")
        .attr("text-anchor", "end")
        .attr("class", "text-label-bar")
        .attr("y", `${height - margin - 20}`)
        .attr("x", `${500}`)
        .text("country");        

        barChart.append("text")
        .attr("text-anchor", "end")
        .attr("class", "text-label-bar")
        .attr("y", `${margin}`)
        .attr("x", `${margin + 90}`)
        .text(param);            
    }

    function updateBarChart(){
        barChart.selectAll("rect").remove();
        let tempData = _.groupBy(data, function(d) {
            return d.region;
          });
        let means = []

        xBarDomain.forEach(function(item, i, arr) {
            let mean =  _.meanBy(tempData[item], function(p) {
                return parseFloat((p[param][year] || 0.0), 10)
            });            
            means.push(mean);
        });
        yBar.domain([0, Math.max(...means)]);

        console.log(means)

        barChart
        .selectAll("rect")
        .data(means)
        .enter()
        .append("rect")
        .attr("fill", function(d, i) {
            return colorScale(xBarDomain[i]);
        })
        .attr("class", "bar")
        .attr("class", function(d, i) { return i })
        .attr("x", function(d, i) { return xBar(xBarDomain[i]); })
        .attr("y", function(d) { return yBar(d); })
        .attr("width", xBar.bandwidth())
        .attr("height", function(d) { return height - margin - yBar(d); });
    }

    updateBar();
    updateScattePlot();
    updateBarForBarChart();
    updateBarChart();

    barChart.selectAll("rect").on("mouseover", function(d, i) {
        dataBackup = _.cloneDeep(data)
        data = data.filter(function(val){
            return val.region == xBarDomain[i]
        })
        updateScattePlot();
        barChart
        .selectAll("rect")
        .filter(function() {
            return !this.classList.contains(i)
        })
        .attr("opacity", "0.5");
    })

    barChart.selectAll("rect").on("mouseout", function(d, i) {
        data = _.cloneDeep(dataBackup);
        updateScattePlot();        
        barChart
        .selectAll("rect")
        .attr("opacity", "1");
    })    
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
