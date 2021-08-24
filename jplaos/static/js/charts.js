const CHART_COLOR = "#026CB6";

const f = d3.format(",.0f");

// const PROJECTION = d3.geoMercator().center([106, 19]).scale(3600);

function getProjection(selector) {
    let mapContainer = document.getElementById(selector);
    let width = mapContainer.clientWidth - 28;
    return d3.geoMercator()
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
const projectsDataGrid = dc.dataTable("#projects-data-grid")
    .chartGroup("projects");

const greenMap = dc.geoChoroplethChart("#green-map")
    .chartGroup("green");
const greenPartners = dc.rowChart("#green-partner")
    .chartGroup("green");
const greenChart1 = dc.barChart("#green-chart-1")
    .chartGroup("green");
const greenChart2 = dc.barChart("#green-chart-2")
    .chartGroup("green");
const greenChart3 = dc.rowChart("#green-chart-3")
    .chartGroup("green");
const greenChart4 = dc.rowChart("#green-chart-4")
    .chartGroup("green");
const greenChart5 = dc.barChart("#green-chart-5")
    .chartGroup("green");
const greenChart6 = dc.barChart("#green-chart-6")
    .chartGroup("green");
const greenCount = dc.dataCount('#green-count')
    .chartGroup("green");
const greenFunding = dc.numberDisplay("#green-funding")
    .chartGroup("green");

const pipelineTable = dc.dataTable("#pipeline-table")
    .chartGroup("pipeline");
const pipelineFilter = dc.cboxMenu("#pipeline-partner-filter")
    .multiple(true)
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
    totalFunding,
    projectsDataGrid
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

        if (tspans[0] !== undefined && tspans[0].length > 0) {
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

function updateLegend(scale, svg, format) {

    // Aplly colorscale and number format to the legend

    let legend = d3.legendColor()
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
        .useViewBoxResizing(true)
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
        .useViewBoxResizing(true)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 5})
        .dimension(green_partner)
        .group(green_partner.group())
        .ordering(function (d) {
            return -d.value;
        })
        .transitionDuration(500)
        .colors(GREEN_COLORS[3])
        .x(d3.scaleBand())
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
        .useViewBoxResizing(true)
        .height(300)
        .margins({top: 10, right: 0, bottom: 50, left: 20})
        .dimension(green_dim1)
        .group(green_dim1.group())
        .colors(GREEN_COLORS[3])
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('postRender', function (chart) {
            chart.selectAll(".x text")
                .call(wrap, 120);
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .elasticY(false)
        .yAxis();

    greenChart2
        .useViewBoxResizing(true)
        .height(300)
        .margins({top: 10, right: 0, bottom: 50, left: 20})
        .dimension(green_dim2)
        .group(green_dim2.group())
        .colors(GREEN_COLORS[3])
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('postRender', function (chart) {
            chart.selectAll(".x text")
                .call(wrap, 120);
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .elasticY(false)
        .yAxis();

    greenChart3
        .useViewBoxResizing(true)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 5})
        .dimension(green_dim3)
        .group(green_dim3.group())
        .transitionDuration(500)
        .colors(GREEN_COLORS[3])
        .x(d3.scaleBand())
        .elasticX(true)
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));

    greenChart4
        .useViewBoxResizing(true)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 5})
        .dimension(green_dim4)
        .group(green_dim4.group())
        .transitionDuration(500)
        .colors(GREEN_COLORS[3])
        .x(d3.scaleBand())
        .elasticX(true)
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    greenChart5
        .useViewBoxResizing(true)
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
        .on('postRender', (chart) => {
            chart.selectAll(".x text")
                .call(wrap, 120);
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .elasticY(false)
        .yAxis();

    greenChart6
        .useViewBoxResizing(true)
        // .width(150)
        .height(350)
        .margins({top: 10, right: 0, bottom: 10, left: 20})
        .dimension(green_dim6)
        .group(filteredGroup(green_dim6.group()))
        .ordering(function (d) {
            return d.key === 'None' ? 999 : 1;
        })
        .colors(GREEN_COLOR)
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('postRender', function (chart) {
            chart.selectAll(".x text")
                .call(wrap, 120);
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scaleBand())
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


    $('#green-reset').on('click', function (e) {
        dc.filterAll("green");
        dc.redrawAll("green");
    });

    let greenMapLegend = d3.select("#green-map-legend");
    greenMapLegend.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(20,20)");
    updateLegend(returnScale(green_province.group(), GREEN_COLORS), greenMapLegend, d3.format(",.0f"));
    green_data.onChange(() => {
        greenMap.colors(returnScale(green_province.group(), GREEN_COLORS));
        // mapDistrictChart.colors(returnScale(current_group[1], colors));
        updateLegend(returnScale(green_province.group(), GREEN_COLORS), greenMapLegend, d3.format(",.0f"));
    });


    $('#green-measure-toggle')
        .checkbox({
            onChecked: () => {

                greenMap.group(green_province.group().reduceSum(dc.pluck("total_funding")));
                updateLegend(returnScale(green_province.group().reduceSum(dc.pluck("total_funding")), GREEN_COLORS), greenMapLegend, d3.format(",.0f"));
                // greenPartners.render();
                // greenCount.render();
                // greenFunding.render();
                // greenChart1.render();
                // greenChart2.render();
                // greenChart3.render();
                // greenChart4.render();
                // greenChart5.render();
                // greenChart6.render();
                dc.renderAll("green");
            },
            onUnchecked: () => {
                greenMap.group(green_province.group());
                updateLegend(returnScale(green_province.group(), GREEN_COLORS), greenMapLegend, d3.format(",.0f"));
                dc.renderAll("green");
            }
        });
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

    // Groups for Dimensions
    let count_by_province = province.group()
        .reduceCount(function (d) {
            return d["project_title"];
        });

    let funding_by_province = province.group()
        .reduce(
            (p, v) => {
                p += getFundingByPartners(v)
                return p;
            },
            (p, v) => {
                p -= getFundingByPartners(v)
                return p;
            },
            () => 0
        );
    // .reduceCount(d => d['total_funding']);
    // .reduceSum(function (d) {
    //     return Math.round(getFundingByPartners(d) / d.locations.length);
    // });

    function getFundingByPartners(d) {
        let partners = partnersChart.filters();
        if (partners.length > 0) {
            console.log(partners);
            if (d.id === 345) {
                console.log(partners);
                console.log(d);
            }
            console.log(d.total_funding);

            console.log(d.partners.map(p => p.planed_amount).filter(p => partners.includes(p['partner'])).reduce((a, b) => a + b, 0));
            console.log(partner.group().reduceSum(d => d.partners.map(p => p.planed_amount).filter(p => p['partner'] === d.key).reduce((a, b) => a + b, 0)).top(100))


            return 0;
            // return d.partners
            //     .filter(p => partners.includes(p['partner']))
            //     .map(p => p['planed_amount'])
            //     .reduce((a, b) => a + b, 0);
        } else {
            return d['total_funding'];
        }
    }

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
        .useViewBoxResizing(true)
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

    mapChart
        .height(600)
        .useViewBoxResizing(true)
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
        .useViewBoxResizing(true)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 0, bottom: 35, left: 5})
        .dimension(ip_category_dim)
        .group(ip_category_dim.group())
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scaleBand())
        .elasticX(true)
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    partnersChart
        .useViewBoxResizing(true)
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
        .x(d3.scaleBand())
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
    nsedcChart
        .useViewBoxResizing(true)
        .height(400)
        .margins({top: 10, right: 0, bottom: 60, left: 0})
        .dimension(nsedc_dim)
        .group(nsedc_dim.group())
        .colors(CHART_COLOR)
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('postRender', (chart) => {
            chart.selectAll(".x text")
                .call(wrap, 60);
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scaleBand())
        .elasticY(true)
        .xUnits(dc.units.ordinal);

    const cciContainer = document.getElementById("cci-chart-container");
    issuesChart
        .useViewBoxResizing(true)
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
        .x(d3.scaleBand())
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
        .useViewBoxResizing(true)
        .height(400)
        .gap(10)
        .margins({top: 10, right: 0, bottom: 35, left: 0})
        .dimension(sdg_dim1)
        .group(sdg_dim1.group())
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scaleBand())
        .elasticX(true)
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .colorAccessor(d => d.key)
        .ordinalColors(sdg_colors)
        // .colors(d3.scaleOrdinal().range(sdg_colors))
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    const priorityChartContainer = document.getElementById("priority-chart-container");
    priorityChart
        .title(d => d.key + ': ' + d.value)
        .useViewBoxResizing(true)
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
        .useViewBoxResizing(true)
        .height(200)
        .innerRadius(50)
        .radius(80)
        .cx(80)
        .dimension(modality_dim)
        .group(modality_dim.group())
        .renderLabel(false)
        .legend(dc.legend().x(200).y(60).gap(5));


    sectorChart
        .useViewBoxResizing(true)
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
        .on('postRender', (chart) => {
            chart.selectAll(".x text")
                .call(wrap, 60);
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxis();
    // .yAxisLabel('Number of Projects')
    // .tickFormat(d3.format("d"));

    totalCount
        .crossfilter(cf)
        .groupAll(cf.groupAll());


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


    var tpl = _.template("<tr>\n" +
        "                <td>Environment fund</td>\n" +
        "                <td>Ongoing</td>\n" +
        "                <td>Environment and Natural resources</td>\n" +
        "                <td>France</td>\n" +
        "                <td>65,000,000</td>\n" +
        "            </tr>");

    projectsDataGrid
        .dimension(partner)
        .section(d => d.id)
        .showSections(false)
        .columns([
            d => d.project_title,
            d => d.status,
            d => d.sector.sector_name,
            d => d.partners.map(p => p.partner).join('; '),
            d => d.total_funding

        ]);

    // .dimension(partner)
    // .section(function (d) {
    //     return d.id;
    // })
    // .size(1000)
    // .html(function (d) {
    //     return '<div>' + d.project_title + '</div>'
    //         + '<div>' + d.status + '</div>'
    //         + '<div>' + d.sector + '</div>'
    //         + '<div>' + d.partners + '</div>'
    //         + '<div>' + d.total_funding + '</div>';
    // })
    // .htmlSection(d => "")
    // // .sortBy(function (d) {
    // //     return d.last_name;
    // // })
    // .order(d3.ascending)
    // .on('renderlet', function (grid) {
    //     // $("img.lazy-load").lazyload({
    //     //     effect: "fadeIn"
    //     // })
    //     //     .removeClass("lazy-load");
    // });

    renderCharts(projectCharts);


    // Initialize legend container with .legendQuant class
    let mapLegend = d3.select("#legend");

    mapLegend.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(20,20)");


    updateLegend(returnScale(count_by_province, colors), mapLegend, f);

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
        updateLegend(returnScale(groups[config.level][config.measure], colors), mapLegend, d3.format(",.0f"));
    });


    function changeChoropleth(chart, group, colors, type) {
        chart.group(group)
            .colors(colors);
    }

    function changeFormat(format) {
        partnersChart.xAxis().tickFormat(d3.format(format));
        sectorChart.yAxis().tickFormat(d3.format(format));
    }

    const funding = d => {
        return d['total_funding'];
    };

    $('#measure-toggle')
        .checkbox({
            onChecked: () => {
                let geoLevel = config.level;
                config.measure = 'funding';
                changeChoropleth(mapChart, funding_by_province, returnScale(funding_by_province, colors), 'f');
                changeChoropleth(mapDistrictChart, funding_by_district, returnScale(funding_by_district, colors), 'f');
                updateLegend(returnScale(geoLevel === 'province' ? funding_by_province : funding_by_district, colors), mapLegend, f);
                partnersChart.group(funding_by_partner);
                sectorChart.group(sector.group().reduceSum(funding));
                nsedcChart.group(nsedc_dim.group().reduceSum(funding));
                issuesChart.group(cci_dim.group().reduceSum(funding));
                sdgChart1.group(sdg_dim1.group().reduceSum(funding));
                priorityChart.group(priority_area_dim.group().reduceSum(funding));
                modalityChart.group(modality_dim.group().reduceSum(funding));
                ipCategory.group(ip_category_dim.group().reduceSum(funding));
                changeFormat('.2s');
                renderCharts(projectCharts);
            },
            onUnchecked: () => {
                let geolevel = config.level;
                config.measure = 'count';
                changeChoropleth(mapChart, count_by_province, returnScale(count_by_province, colors), 'c');
                changeChoropleth(mapDistrictChart, count_by_district, returnScale(count_by_district, colors), 'c');
                updateLegend(returnScale(geolevel === 'province' ? count_by_province : count_by_district, colors), mapLegend, f);
                partnersChart.group(count_by_partner);
                sectorChart.group(count_by_sector);
                nsedcChart.group(nsedc_dim.group());
                issuesChart.group(cci_dim.group());
                sdgChart1.group(sdg_dim1.group());
                priorityChart.group(priority_area_dim.group());
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
        updateLegend(chart.colors(), mapLegend, f);
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


    $('#download').on('click', function (e) {
        downloadData(partner, districtsNames);
    });

    $('#reset').on('click', function (e) {
        dc.filterAll("projects");
        dc.redrawAll("projects");
    });


}

function downloadData(dimension, districtsNames) {

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

    let data = dimension.top(Infinity)
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
    let result = d3.csvFormatRows(data);
    let blob = new Blob([result], {type: "text/csv;charset=utf-8"});
    saveAs(blob, 'jp-projects-laos-dataset-' + (new Date()).getTime() + '.csv')

}

function renderPipelines(data, sectors) {

    const priority_areas = Object.fromEntries(
        sectors.map(e => [e.sector_name, e.priority_area])
    )

    const cf = crossfilter(data);
    const partner_dim = cf.dimension(d => d['partner']);
    const sector_dim = cf.dimension(d => d['sector']);

    var total = cf.groupAll()
        .reduceSum(dc.pluck("total_funding"));

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
            })
        .order(p => priority_areas[p.key]);

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

    pipelineFilter
        .dimension(partner_dim)
        .group(partner_dim.group())
        .on('renderlet', (chart) => {
            chart.selectAll(".dc-cbox-group")
                .classed("grouped", true)
                .classed("fields", true)
            chart.selectAll(".dc-cbox-item")
                .classed("ui", true)
                .classed("checkbox", true);
        });

    const percentageFormat = d3.format(".0%");

    pipelineTable
        .dimension(reversible_group(sector_group))
        .section(d => priority_areas[d['sector']])
        .showSections(false)
        .columns([
            d => priority_areas[d.key],
            d => d.key,
            d => percentageFormat(d.value.total_amount / total.value()),
            d => d.value.planed_amount_2021,
            d => d.value.planed_amount_2022,
            d => d.value.planed_amount_2023,
            d => d.value.planed_amount_2024,
            d => d.value.planed_amount_2025,
            d => d.value.planed_amount_2026,
            d => d.value.planed_amount_2027

        ])
        .on('renderlet', (chart) => {
            console.log(sector_group.top(Infinity));
            const pa_count = sector_group.top(Infinity)
                .map(d => d.key)
                .reduce((total, sector) => {

                    total[priority_areas[sector]] = total[priority_areas[sector]] || 0;
                    ++total[priority_areas[sector]];
                    return total;
                }, {});
            console.log(pa_count)
        })
        .sortBy(d => priority_areas[d['sector']]);


    pipelineFilter.render();
    pipelineTable.render();
}

function loadData(geodata, data, districts_list, provinces_list, districts, pipelines, sectors) {

    dc.config.defaultColors(d3.schemeBlues[10]);


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
                    renderPipelines(pipelines, sectors);
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