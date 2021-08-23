const CHART_COLOR = "#026CB6";

const f = d3.format(",.0f");

// const PROJECTION = d3.geoMercator().center([106, 19]).scale(3600);

function getProjection(selector) {
    let mapContainer = document.getElementById(selector);
    let width = mapContainer.clientWidth - 28;
    return d3.geo.mercator()
        .center([100 - 0.0101 * width + 14.5, 19]).scale(3.17 * width + 1400);
}

function returnScale(group, colors) {
    // https://github.com/schnerd/d3-scale-cluster
    let breaks = [0].concat(group.all().map(function (d) {
        return d.value;
    }));

    let scale = d3.scaleCluster()
        .domain(breaks)
        .range(colors);

    let clusters = scale.clusters();

    if (clusters.length < colors.length) {
        let ranges = clusters.length > 1 ? clusters.length + 1 : 3;
        colors = colors.slice(0, ranges);
    }

    return d3.scaleCluster()
        .domain(breaks)
        .range(colors)
}

const mapChart = dc.geoChoroplethChart("#map")
    .chartGroup("projects");
const mapDistrictChart = dc.geoChoroplethChart("#map-district")
    .chartGroup("projects");
const partnersChart = dc.rowChart("#partners")
    .chartGroup("projects");
const sectorChart = dc.barChart("#sector")
    .chartGroup("projects");
const nsedcChart = dc.barChart("#nsedc")
    .chartGroup("projects");
const issuesChart = dc.rowChart("#cross_cutting_issues")
    .chartGroup("projects");
const sdgChart1 = dc.rowChart("#sdg1")
    .chartGroup("projects");
const priorityChart = dc.pieChart('#priority-chart')
    .chartGroup("projects");
const modalityChart = dc.pieChart('#modality-chart')
    .chartGroup("projects");
// const dataTable = dc.dataTable("#data-table");
const ipCategory = dc.rowChart("#ip-category")
    .chartGroup("projects");
const totalFunding = dc.numberDisplay("#funding-total")
    .chartGroup("projects");
const totalCount = dc.dataCount("#count")
    .chartGroup("projects");

const greenMap = dc.geoChoroplethChart("#green-map");
const greenPartners = dc.rowChart("#green-partner");

const greenChart1 = dc.barChart("#green-chart-1");
const greenChart2 = dc.barChart("#green-chart-2");
const greenChart3 = dc.rowChart("#green-chart-3");
const greenChart4 = dc.rowChart("#green-chart-4");

const greenChart5 = dc.barChart("#green-chart-5");
const greenChart6 = dc.barChart("#green-chart-6");
const greenCount = dc.dataCount('#green-count');

const greenFunding = dc.numberDisplay("#green-funding");

const pipelineTable = dc.dataTable("#pipeline-table")
    .chartGroup("pipeline");

const pipelineFilter = dc.rowChart("#pipeline-partner-filter")
    .chartGroup("pipeline");

const projectCharts = [
    mapChart,
    mapDistrictChart,
    partnersChart,
    sectorChart,
    nsedcChart,
    issuesChart,
    sdgChart1,
    priorityChart,
    modalityChart,
    // dataTable,
    ipCategory,
    totalCount,
    totalFunding
];

function renderCharts(charts) {
    charts.forEach((chart) => chart.render());
}


const GREEN_COLOR = "#31a354";
const GREEN_COLORS = ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476",
    "#31a354", "#006d2c"];
const colors = ['#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#034e7b'];

const retrieveSectorField = record => record['sector']['sector_name']
retrievePriorityArea = record => record['sector']['priority_area'];

function wrap(text, width) {
    text.each(function () {
        let text = d3.select(this),
            tspans = text.selectAll('tspan'),
            words;

        if (tspans[0].length > 0) {
            let tss = [];
            tspans[0].map(function (d) {
                tss = tss.concat(d3.select(d).text().split(/\s+/));
            }).reverse();

            words = tss.reverse();
        } else {
            words = text.text().split(/\s+/).reverse();
        }


        let word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1,
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");


        while (word = words.pop()) {
            line.push(word);


            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(line.join(" "));
            }
        }
    });
}


function renderGreenDashboard(geo_data, data, districts_list, provinces_list, districts) {

    const green_data = crossfilter(data.filter(d => d['has_green_category'] === true));

    const green_province = green_data.dimension(d => d['locations'].map(d => d.province), true);

    const green_dim1 = green_data.dimension(d => {
        return d['funding_by_phakhao_lao'].map(d => d['category']);
    }, true);

    const green_dim2 = green_data.dimension(d => {
        return d['funding_by_forest_partnership'].map(d => d['category']);
    }, true);

    const green_dim3 = green_data.dimension(d => {
        return d['complementary_area_categories'].map(d => d);
    }, true);

    const green_dim4 = green_data.dimension(d => {
        return d['green_catalysers_categories'].map(d => d);
    }, true);

    const green_dim5 = green_data.dimension(d => {
        if (d['funding_by_phakhao_lao'].length > 0) {
            return 'Phakhao Lao'
        } else {
            return 'None'
        }
    });

    let filteredGroup = (group) => {
        return {
            all: () => {
                return group.all().filter((d) => {
                    return d.key !== "None";
                });
            }
        };
    };


    const green_dim6 = green_data.dimension(d => {
        if (d['funding_by_forest_partnership'].length > 0) {
            return 'Forest Partnership'
        } else {
            return 'None'
        }
    });

    greenMap
        .width(() => document.getElementById("green-map").parentElement.clientWidth - 28)
        .height(600)
        .dimension(green_province)
        .group(green_province.group())
        .colors(returnScale(green_province.group(), GREEN_COLORS))
        .overlayGeoJson(
            geo_data.features
            , "state"
            , function (d) {
                return d.properties['pr_name2'];
            }
        )
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .projection(getProjection("green-map-container"));

    const green_partner = green_data.dimension((d) => {
        return d["partners"].map(d => d['partner']);
    }, true);

    greenPartners
        .width(() => document.getElementById("green-partner-container").clientWidth - 28)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 5})
        .dimension(green_partner)
        .group(green_partner.group())
        .ordering(function (d) {
            return -d.value;
        })
        .transitionDuration(500)
        .colors(GREEN_COLOR)
        .x(d3.scale.ordinal())
        .elasticX(true)
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));

    greenCount
        .dimension(green_data)
        .group(green_data.groupAll());

    greenFunding
        .valueAccessor(function (d) {
            return Math.round(d);
        })
        .group(green_data.groupAll().reduceSum((d) => {
            return d["total_funding"];
        }));


    greenChart1
        .width(300)
        .height(300)
        .margins({top: 10, right: 0, bottom: 60, left: 20})
        .dimension(green_dim1)
        .group(green_dim1.group())
        .colors(GREEN_COLOR)
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('renderlet', function (chart) {
            chart.selectAll(".x text")
                .call(wrap, 60);
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(false)
        .yAxis();

    greenChart2
        .width(300)
        .height(300)
        .margins({top: 10, right: 0, bottom: 60, left: 20})
        .dimension(green_dim2)
        .group(green_dim2.group())
        .colors(GREEN_COLOR)
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('renderlet', function (chart) {
            chart.selectAll(".x text")
                .call(wrap, 60);
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(false)
        .yAxis();

    greenChart3
        .width(300)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 5})
        .dimension(green_dim3)
        .group(green_dim3.group())
        .transitionDuration(500)
        .colors(GREEN_COLOR)
        .x(d3.scale.ordinal())
        .elasticX(true)
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));

    greenChart4
        .width(300)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 5})
        .dimension(green_dim4)
        .group(green_dim4.group())
        .transitionDuration(500)
        .colors(GREEN_COLOR)
        .x(d3.scale.ordinal())
        .elasticX(true)
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    greenChart5
        .width(300)
        .height(350)
        .margins({top: 10, right: 0, bottom: 60, left: 20})
        .dimension(green_dim5)
        .group(filteredGroup(green_dim5.group()))
        .ordering(function (d) {
            return d.key === 'None' ? 999 : 1;
        })
        .colors(GREEN_COLOR)
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('renderlet', (chart) => {
            chart.selectAll(".x text")
                .call(wrap, 60);
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(false)
        .yAxis();

    greenChart6
        .width(300)
        .height(350)
        .margins({top: 10, right: 0, bottom: 60, left: 20})
        .dimension(green_dim6)
        .group(filteredGroup(green_dim6.group()))
        .ordering(function (d) {
            return d.key === 'None' ? 999 : 1;
        })
        .colors(GREEN_COLOR)
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('renderlet', function (chart) {
            chart.selectAll(".x text")
                .call(wrap, 60);
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(false)
        .yAxis();


    greenMap.render();
    greenPartners.render();
    greenCount.render();
    greenFunding.render();
    greenChart1.render();
    greenChart2.render();
    greenChart3.render();
    greenChart4.render();
    greenChart5.render();
    greenChart6.render();
}


function renderProjectsDashboard(geo_data, data, districts_list, provinces_list, districts) {
    let districtsNames = {};


    data.forEach(datum => {
        datum.districts = [].concat.apply([], datum.locations.map(function (d) {
            return d.districts;
        }));
    });

    districts_list.forEach(function (e, i, arr) {
        districtsNames[e['dcode']] = e.name;
    });


    let config = {
        level: 'province',
        measure: 'count'
    };

    const cf = crossfilter(data);

    let province = cf.dimension(d => d['locations'].map(d => d.province), true);

    let district = cf.dimension(d => {
        let districts = d['districts'].map(d => d);
        return districts ? districts : 'No district';
    }, true);

    let sector = cf.dimension(retrieveSectorField);

    let partner = cf.dimension((d) => {
        return d["partners"].map(d => d['partner']);
    }, true);


    let implementing_partner = cf.dimension(function (d) {
        return d['implementing_partner'] ? d['implementing_partner'] : 'No implementing partner';
    }, true);

    const priority_area_dim = cf.dimension(retrievePriorityArea);

    const priority_area = {
        dim: cf.dimension(retrievePriorityArea),
        count: priority_area_dim.group()
            .reduceCount(retrievePriorityArea),
        funding: priority_area_dim.group()
            .reduceSum(function (d) {
                return Math.round(d["total_funding"]);
            })
    }

    const modality_dim = cf.dimension(d => d['funding_by_modality'].map(d => d['modality']), true);

    const nsedc_dim = cf.dimension(d => d['sector']['outputs'].map(o => o['outcome']).filter((v, i, a) => a.indexOf(v) === i), true)

    const list2 = [
        'Affordable and Clean Energy',
        'Decent Work and Economic Grouth',
        'Industry, Innovation and Infrastructure',
        'Reduce Inequalities',
        'Sustainable Cities and Comunities',
        'Responsible Consumption and Production']

    const list3 = [
        'Climate Action',
        'Live Bellow Water',
        'Live on Land',
        'Peace, Justice and Strong Institutions',
        'Partnership',
        'Lives Save from UXO',
        'Affordable and Clean Energy',
        'Affordable and Clean Energy',
        'Decent Work and Economic Grouth',
        'Industry, Innovation and Infrastructure',
        'Reduce Inequalities',
        'Sustainable Cities and Comunities',
        'Responsible Consumption and Production']

    const sdg_colors = [
        '#e5243b',
        '#dda63a',
        '#4c9f38',
        '#c5192d',
        '#ff3a21',
        '#26bde2',
        '#fcc30b',
        '#a21942',
        '#fd6925',
        '#dd1367',
        '#fd9d24',
        '#bf8b2e',
        '#3f7e44',
        '#0a97d9',
        '#56c02b',
        '#00689d',
        '#19486a',
        '#E0292C'
    ]

    const sdg_dim1 = cf.dimension(d => d['sector']['sdg']
        .map(d => d), true);

    const cci_dim = cf.dimension(d => d['cross_cutting_issues'].map(d => d), true);


    // Groups for Dimensions
    let count_by_province = province.group()
        .reduceCount(function (d) {
            return d["project_title"];
        });

    let funding_by_province = province.group()
        // .reduceCount(d => d['total_funding']);
        .reduceSum(function (d) {
            return Math.round(getFundingByPartners(d) / d.locations.length);
        });

    let count_by_district = district.group()
        .reduceCount(function (d) {
            return d["project_title"];
        });

    let funding_by_district = district.group()
        .reduceSum(function (d) {
            return Math.round(d["total_funding"] / d.districts.length);
        });

    let count_by_sector = sector.group()
        .reduceCount(retrieveSectorField);

    let funding_by_sector = sector.group()
        .reduceCount(d => d['total_funding']);
    // .reduceSum(d => Math.round(getFundingByPartners(d)));
    // .reduce(
    //     function (p, v) {
    //         p.funding_by_partner += getFundingByPartners(v);
    //         return p;
    //     },
    //     function (p, v) {
    //         p.funding_by_partner -= getFundingByPartners(v);
    //         return p;
    //     },
    //     function () {
    //         return {
    //             funding_by_partner: 0
    //         }
    //     });

    function getFundingByPartners(d) {
        let partners = partnersChart.filters();
        if (partners.length > 0) {
            if (d.id === 345) {
                console.log(partners);
                console.log(d);
            }
            // return d.partners
            //     .filter(p => partners.includes(p['partner']))
            //     .map(p => p['planed_amount'])
            //     .reduce((a, b) => a + b, 0);
        } else {
        }
        return d['total_funding'];
    }

    var chartObject = {
        chart: sectorChart,
        dim: sector,
        count: sector.group().reduceCount(retrieveSectorField),
        funding: sector.group().reduceCount(d => d['total_funding']),
        displayFunding: () => this.chart.group(this.funding),
        displayCount: () => this.chart.group(this.count)
    }

    let count_by_implementing_partner = implementing_partner.group()
        .reduceCount(function (d) {
            return d["implementing_partner"];
        });

    let funding_by_implementing_partner = implementing_partner.group()
        .reduceSum(function (d) {
            return Math.round(d['total_funding'] / d.implementing_partner.length);
        });

    let count_by_partner = partner.group()
        .reduceCount(function (d) {
            return d["partner"];
        });

    let funding_by_partner = partner.group()
        .reduceSum(function (d) {
            return Math.round(d['total_funding']);
        });


    mapDistrictChart
        .width(700)
        .height(600)
        .dimension(district)
        .group(count_by_district)
        .colors(returnScale(count_by_district, colors))
        .overlayGeoJson(
            districts.features
            , "state"
            , function (d) {
                return d.properties['DCode'].toString(); // Code
            }
        )
        .title(function (p) {
            return districtsNames[p.key] + ': ' + f(p.value);
        })
        .projection(getProjection("map-container"));

    const mapContainer = document.getElementById("map-container");
    mapChart
        .width(() => mapContainer.clientWidth - 28)
        .height(600)
        .dimension(province)
        .group(province.group())
        .colors(returnScale(province.group(), colors))
        .overlayGeoJson(
            geo_data.features
            , "state"
            , function (d) {
                return d.properties['pr_name2'];
            }
        )
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .on('filtered', function (chart, filter) {

        })
        .projection(getProjection("map-container"));


    const ip_category_dim = cf.dimension((d) => {
        return [...new Set(d['implementing_partner'].map(d => d['category']).map(d => d))];
    }, true);
    ipCategory
        .width(() => document.getElementById("ip-category").parentElement.clientWidth - 28)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 0, bottom: 35, left: 5})
        .dimension(ip_category_dim)
        .group(ip_category_dim.group())
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scale.ordinal())
        .elasticX(true)
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));

    const partnersContainer = document.getElementById("partners-chart-container");
    partnersChart
        .width(() => partnersContainer.clientWidth - 28)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 5})
        .dimension(partner)
        .group(partner.group())
        .ordering(function (d) {
            return -d.value;
        })
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scale.ordinal())
        .elasticX(true)
        .on('filtered', function (chart, filter) {

        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    const nsedcContainer = document.getElementById("nsedc-chart-container");
    nsedcChart.width(() => nsedcContainer.clientWidth - 28)
        .height(400)
        .margins({top: 10, right: 0, bottom: 60, left: 0})
        .dimension(nsedc_dim)
        .group(nsedc_dim.group())
        .colors(CHART_COLOR)
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('renderlet', (chart) => {
            chart.selectAll(".x text")
                .call(wrap, 60);
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal);

    const cciContainer = document.getElementById("cci-chart-container");
    issuesChart
        .width(() => cciContainer.clientWidth - 28)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 0, bottom: 35, left: 0})
        .dimension(cci_dim)
        .group(cci_dim.group())
        .ordering(function (d) {
            return -d.value;
        })
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scale.ordinal())
        .elasticX(true)
        .on('filtered', function (chart, filter) {

        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));

    const sdgSubContainer = document.getElementById("sdg-1-container");
    sdgChart1
        .width(() => sdgSubContainer.clientWidth - 28)
        .height(400)
        .gap(10)
        .margins({top: 10, right: 0, bottom: 35, left: 0})
        .dimension(sdg_dim1)
        .group(sdg_dim1.group())
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scale.ordinal())
        .elasticX(true)
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .colors(d3.scale.ordinal().range(sdg_colors))
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    const priorityChartContainer = document.getElementById("priority-chart-container");
    priorityChart
        .title(d => d.key + ': ' + d.value)
        .width(() => priorityChartContainer.clientWidth - 28)
        .height(200)
        .dimension(priority_area.dim)
        .group(priority_area.count)
        .innerRadius(50)
        .radius(80)
        .cx(80)
        .renderLabel(false)
        .legend(dc.legend().x(200).y(60).gap(5));

    modalityChart
        .title(d => d.key + ': ' + d.value)
        .width(() => priorityChartContainer.clientWidth - 28)
        .height(200)
        .innerRadius(50)
        .radius(80)
        .cx(80)
        .dimension(modality_dim)
        .group(modality_dim.group())
        .renderLabel(false)
        .legend(dc.legend().x(200).y(60).gap(5));


    const sectorContainer = document.getElementById("sector-chart-container");
    sectorChart
        .width(() => sectorContainer.clientWidth - 28)
        .height(350)
        .margins({top: 10, right: 0, bottom: 60, left: 20})
        .dimension(sector)
        // .group(count_by_sector)
        .group(sector.group())
        .ordering(function (d) {
            return d.key === 'Other' ? 999 : 1;
        })
        .colors(CHART_COLOR)
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('renderlet', function (chart) {
            chart.selectAll(".x text")
                .call(wrap, 60);
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxis();
    // .yAxisLabel('Number of Projects')
    // .tickFormat(d3.format("d"));

    totalCount
        .dimension(cf)
        .group(cf.groupAll());


    totalFunding
        .valueAccessor(function (d) {
            return Math.round(d);
        })
        .group(cf.groupAll().reduceSum(function (d) {
            return d["total_funding"];
        }));

    // dataTable
    //     .dimension(district)
    //     .group(() => "Projects")
    //     .columns(['project_title', 'count']);

    renderCharts(projectCharts);


    // Initialize legend container with .legendQuant class
    let svg = d3.select("#legend");
    svg.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(20,20)");


    function updateLegend(scale, format) {

        // Aplly colorscale and number format to the legend

        let legend = d3.legend.color()
            .scale(scale)
            .labelFormat(format);

        svg.select(".legendQuant")
            .call(legend);

        function clearLabel(labels) {
            labels.each(function () {
                let label = d3.select(this);
                label.text(label.text().replace('to NaN', 'and more'));
            });
        }

        svg.selectAll("text.label")
            .call(clearLabel)
    }

    updateLegend(returnScale(count_by_province, colors), f);

    cf.onChange(function (e) {
        let groups = {
            'province': {
                'count': count_by_province,
                'funding': funding_by_province
            },
            'district': {
                'count': count_by_district,
                'funding': funding_by_district
            }
        };

        let current_group = [
            groups['province'][config.measure],
            groups['district'][config.measure]
        ];

        mapChart.colors(returnScale(current_group[0], colors));
        mapDistrictChart.colors(returnScale(current_group[1], colors));
        updateLegend(returnScale(groups[config.level][config.measure], colors), d3.format(",.0f"));
    });


    function changeChoropleth(chart, group, colors, type) {
        chart.group(group)
            .colors(colors);
    }

    function changeFormat(format) {
        partnersChart.xAxis().tickFormat(d3.format(format));
        sectorChart.yAxis().tickFormat(d3.format(format));
    }

    $('#measure-toggle')
        .checkbox({
            onChecked: () => {
                let geolevel = config.level;
                config.measure = 'funding';
                changeChoropleth(mapChart, funding_by_province, returnScale(funding_by_province, colors), 'f');
                changeChoropleth(mapDistrictChart, funding_by_district, returnScale(funding_by_district, colors), 'f');
                updateLegend(returnScale(geolevel === 'province' ? funding_by_province : funding_by_district, colors), f);
                partnersChart.group(funding_by_partner);
                // Object.create(chartObject).displayFunding();
                sectorChart.group(funding_by_sector);

                nsedcChart.group(nsedc_dim.group());
                issuesChart.group(cci_dim.group());
                sdgChart1.group(sdg_dim1.group());
                priorityChart.group(priority_area.count);
                modalityChart.group(modality_dim.group());
                ipCategory.group(ip_category_dim.group());

                changeFormat('.2s');
                renderCharts(projectCharts);
            },
            onUnchecked: () => {
                let geolevel = config.level;
                config.measure = 'count';
                changeChoropleth(mapChart, count_by_province, returnScale(count_by_province, colors), 'c');
                changeChoropleth(mapDistrictChart, count_by_district, returnScale(count_by_district, colors), 'c');
                updateLegend(returnScale(geolevel === 'province' ? count_by_province : count_by_district, colors), f);
                partnersChart.group(count_by_partner);
                sectorChart.group(count_by_sector);
                // chartObject.displayCount();

                nsedcChart.group(nsedc_dim.group());
                issuesChart.group(cci_dim.group());
                sdgChart1.group(sdg_dim1.group());
                priorityChart.group(priority_area.count);
                modalityChart.group(modality_dim.group());
                ipCategory.group(ip_category_dim.group());

                changeFormat('d');
                renderCharts(projectCharts);
            }
        });


    function show(container, chart) {
        document.getElementById('map').style.display = 'none';
        document.getElementById('map-district').style.display = 'none';
        document.getElementById(container).style.display = 'block';
        updateLegend(chart.colors(), f);
        chart.render();
    }

    $('#geolevel').on('change', function (e) {

        let geolevel = $(this).val();
        config.level = geolevel;

        if (geolevel === 'province') {
            show('map', mapChart);
        } else {
            show('map-district', mapDistrictChart);
        }

        $('#geolabel').html(geolevel);
    });


    function downloadData() {

        let header = [
            'id',
            'project_code',
            'project_title',
            'status',
            'sector',
            'partner',
            'total_funding',
            'provinces',
            'districts'
        ];

        let data = partner.top(Infinity)
            .map(function (record) {
                return [
                    record['id'],
                    record['project_code'],
                    record['project_title'],
                    record['status'],
                    retrieveSectorField(record),
                    record['partner'],
                    record['total_funding'],
                    record['locations'].map(function (d) {
                        return d.province
                    }).join('; '),
                    record['districts'].map(function (d) {
                        return districtsNames[d]
                    }).join('; ')

                ];
            });

        data.unshift(header);
        let result = d3.csv.formatRows(data);
        let blob = new Blob([result], {type: "text/csv;charset=utf-8"});
        saveAs(blob, 'jp-projects-laos-dataset-' + (new Date()).getTime() + '.csv')

    }

    $('#download').on('click', function (e) {
        downloadData();
    });

}


function renderPipelines(data) {
    const cf = crossfilter(data);
    const partner_dim = cf.dimension(d => d['partner']);
    const sector_dim = cf.dimension(d => d['sector']);
    let sector_group = sector_dim.group()
        .reduce(
            function (p, v) {
                p.planed_amount_2021 += +v.planed_amount_2021;
                p.planed_amount_2022 += +v.planed_amount_2022;
                p.planed_amount_2023 += +v.planed_amount_2023;
                p.planed_amount_2024 += +v.planed_amount_2024;
                p.planed_amount_2025 += +v.planed_amount_2025;
                p.planed_amount_2026 += +v.planed_amount_2026;
                p.planed_amount_2027 += +v.planed_amount_2027;
                p.total_amount += +v.planed_amount_2021 +
                    +v.planed_amount_2022 +
                    +v.planed_amount_2023 +
                    +v.planed_amount_2024 +
                    +v.planed_amount_2025 +
                    +v.planed_amount_2026 +
                    +v.planed_amount_2027
                return p;
            },
            function (p, v) {
                p.planed_amount_2021 -= +v.planed_amount_2021;
                p.planed_amount_2022 -= +v.planed_amount_2022;
                p.planed_amount_2023 -= +v.planed_amount_2023;
                p.planed_amount_2024 -= +v.planed_amount_2024;
                p.planed_amount_2025 -= +v.planed_amount_2025;
                p.planed_amount_2026 -= +v.planed_amount_2026;
                p.planed_amount_2027 -= +v.planed_amount_2027;
                p.total_amount -= +v.planed_amount_2021 +
                    +v.planed_amount_2022 +
                    +v.planed_amount_2023 +
                    +v.planed_amount_2024 +
                    +v.planed_amount_2025 +
                    +v.planed_amount_2026 +
                    +v.planed_amount_2027
                return p;
            },
            function () {
                return {
                    planed_amount_2021: 0,
                    planed_amount_2022: 0,
                    planed_amount_2023: 0,
                    planed_amount_2024: 0,
                    planed_amount_2025: 0,
                    planed_amount_2026: 0,
                    planed_amount_2027: 0,
                    total_amount: 0
                }
            });

    function reversible_group(group) {
        return {
            top: function (N) {
                return group.top(N);
            },
            bottom: function (N) {
                return group.top(Infinity).slice(-N).reverse();
            }
        };
    }

    sector_group.all();

    pipelineFilter
        .width(300)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 5})
        .dimension(partner_dim)
        .group(partner_dim.group())
        .transitionDuration(500)
        .colors(GREEN_COLOR)
        .x(d3.scale.ordinal())
        .elasticX(true)
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));

    pipelineTable
        .dimension(reversible_group(sector_group))
        .group(d => d['sector'])
        .showGroups(false)
        .columns([
            // {
            //     label: 'Priority Area',
            //     format: (d) => d['priority_area']
            // },
            {
                label: 'Sector',
                format: d => d.key
            },
            {
                label: 'Total Indicative Allocation (%)',
                format: d => d.value.total_amount
            },
            {
                label: "2021",
                format: d => d.value.planed_amount_2021
            },
            {
                label: "2022",
                format: d => d.value.planed_amount_2022
            },
            {
                label: "2023",
                format: d => d.value.planed_amount_2023
            },
            {
                label: "2024",
                format: d => d.value.planed_amount_2024
            },
            {
                label: "2025",
                format: d => d.value.planed_amount_2025
            },
            {
                label: "2026",
                format: d => d.value.planed_amount_2026
            },
            {
                label: "2027",
                format: d => d.value.planed_amount_2027
            }

        ]);

    pipelineFilter.render();
    pipelineTable.render();
}


function ResetAll() {
    dc.filterAll("projects");
    dc.redrawAll("projects");
}

function loadData(err, geodata, data, districts_list, provinces_list, districts, pipelines) {

    if (!data) {
        $('#loader').toggleClass('active');
        return;
    }

    $('#loader').toggleClass('active');
    $('#dashboard').css('visibility', 'visible');
    $('#footer').css('visibility', 'visible');

    renderProjectsDashboard(geodata, data, districts_list, provinces_list, districts);

    $('.menu .item').tab({
        'onFirstLoad': (path) => {
            switch (path) {
                case 'projects':
                    renderProjectsDashboard(geodata, data, districts_list, provinces_list, districts);
                    break
                case 'team-europe':
                    renderGreenDashboard(geodata, data, districts_list, provinces_list, districts);
                    break
                case 'pipeline':
                    renderPipelines(pipelines);
                    break
            }
        },
        'onLoad': (path) => {
            switch (path) {
                case 'projects':
                    renderCharts(projectCharts);
                    break
                case 'team-europe':
                    greenMap.render();
                    greenPartners.render();
                    greenCount.render();
                    greenFunding.render();
                    greenChart1.render();
                    greenChart2.render();
                    greenChart3.render();
                    greenChart4.render();
                    greenChart5.render();
                    greenChart6.render();
                    break
                case 'pipeline':
                    pipelineFilter.render();
                    pipelineTable.render();
                    break
            }
        }
    });


}