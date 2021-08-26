const CHART_COLOR = "#026CB6";

const f = d3.format(",.0f");

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
// const PROJECTION = d3.geoMercator().center([106, 19]).scale(3600);


const addDistinctProject = (p, d) => {
    if (d.project in p.projects)
        p.projects[d.project]++;
    else p.projects[d.project] = 1;
    return p;
};

const removeDistinctProject = (p, d) => {
    p.projects[d.project]--;
    if (p.projects[d.project] === 0)
        delete p.projects[d.project];
    return p;
};

const initDistinctProjects = function () {
    return {projects: {}};
};

const fundingTitle = p => {
    return p.key + ': ' + f(p.value);
};

const defaultTitle = p => {
    return p.key + ': ' + Object.keys(p.value.projects).length;
};

const fundingAccessor = d => d['planed_amount'];

const fundingFunction = d => Math.round(d['planed_amount']);
const distinctCountAccessor = d => {
    return Object.keys(d.value.projects).length;
};

function getProjection(selector) {
    let mapContainer = document.getElementById(selector);
    let width = mapContainer.clientWidth - 28;
    return d3.geoMercator()
        .center([100 - 0.0101 * width + 14.5, 19]).scale(3.17 * width + 1400);
}

function returnScale(group, colors, accessor) {
    let breaks = [0].concat(group.all().map(accessor));
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
// const totalCount = dc.dataCount("#count")
//     .chartGroup("projects");
const totalCount = dc.numberDisplay("#count")
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
// const greenCount = dc.dataCount('#green-count')
//     .chartGroup("green");
const greenCount = dc.numberDisplay('#green-count')
    .chartGroup("green");
const greenFunding = dc.numberDisplay("#green-funding")
    .chartGroup("green");

const pipelineTable = dc.dataTable("#pipeline-table")
    .chartGroup("pipeline");
const pipelineFilter = dc.cboxMenu("#pipeline-partner-filter")
    .multiple(true)
    .chartGroup("pipeline");

const projectCharts = [
    totalCount,
    totalFunding,
    mapChart,
    mapDistrictChart,
    partnersChart,
    sectorChart,
    nsedcChart,
    issuesChart,
    sdgChart1,
    priorityChart,
    modalityChart,
    ipCategory,
    projectsDataGrid
];

function renderCharts(charts) {
    charts.forEach((chart) => chart.render());
}


const GREEN_COLOR = "#31a354";
const GREEN_COLORS = ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476",
    "#31a354", "#006d2c"];
const colors = ['#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#034e7b'];


function wrap(text, width) {
    text.each(function () {
        let text = d3.select(this),
            tspans = text.selectAll('tspan'),
            words;

        if (tspans[0] !== undefined && tspans[0].length > 0) {
            let tss = [];
            tspans[0].map(function (d) {
                tss = tss.concat(d3.select(d).text().split(" "));
            }).reverse();
            words = tss.reverse();
        } else {
            words = text.text().split(" ").reverse();
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

function renderGreenDashboard(geo_data, data, districts_list, provinces_list, districts, projects, green_data) {

    let districtsNames = {}
    districts_list.forEach(function (e, i, arr) {
        districtsNames[e['dcode']] = e.name;
    });

    let current_measure = "count"
    const projects_by_id = {}
    projects.filter(project => project['has_green_category'] === true)
        .forEach(project => {
            projects_by_id[project.id] = project
        });

    const green_data_cf = crossfilter(green_data);
    const green_province = green_data_cf.dimension(d => projects_by_id[d.project]['locations'].map(d => d.province), true);
    const distinctCount = green_data_cf.groupAll()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);

    const phakhao_lao_sub = green_data_cf.dimension(d => {
        if (d["category"] === 'Phakhao Lao') {
            return d["sub_category"]
        } else {
            return 'None'
        }
    });

    const forest_partnership_sub = green_data_cf.dimension(d => {
        if (d["category"] === 'Forest Partnership') {
            return d["sub_category"]
        } else {
            return 'None'
        }
    });

    const complementary_areas = green_data_cf.dimension(d => {
        return projects_by_id[d.project]['complementary_area_categories'].map(d => d);
    }, true);

    const green_catalyzers = green_data_cf.dimension(d => {
        return projects_by_id[d.project]['green_catalyzers_categories'].map(d => d);
    }, true);

    const phakhao_lao = green_data_cf.dimension(d => {
        if (d["category"] === 'Phakhao Lao') {
            return d["category"]
        } else {
            return 'None'
        }
    });

    const forest_partnership = green_data_cf.dimension(d => {
        if (d["category"] === 'Forest Partnership') {
            return d["category"]
        } else {
            return 'None'
        }
    });


    const green_partner = green_data_cf.dimension(d => d['partner']);

    let filteredGroup = (group) => {
        return {
            all: () => {
                return group.all().filter((d) => {
                    return d.key !== "None";
                });
            }
        };
    };

    const fp_sub_count = forest_partnership_sub.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const ca_count = complementary_areas.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const gc_count = green_catalyzers.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const fp_count = forest_partnership.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const pl_count = phakhao_lao.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const pl_sub_count = phakhao_lao_sub.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const partner_count = green_partner.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const gp_count = green_province.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);

    const fp_sub_funding = forest_partnership_sub.group()
        .reduceSum(d => d["planed_amount"]);
    const ca_funding = complementary_areas.group()
        .reduceSum(d => d["planed_amount"]);
    const gc_funding = green_catalyzers.group()
        .reduceSum(d => d["planed_amount"]);
    const fp_funding = forest_partnership.group()
        .reduceSum(d => d["planed_amount"]);
    const pl_funding = phakhao_lao.group()
        .reduceSum(d => d["planed_amount"]);
    const pl_sub_funding = phakhao_lao_sub.group()
        .reduceSum(d => d["planed_amount"]);
    const partner_funding = green_partner.group()
        .reduceSum(d => d["planed_amount"]);
    const gp_funding = green_province.group()
        .reduceSum(d => d["planed_amount"]);

    greenMap
        .useViewBoxResizing(true)
        .height(600)
        .dimension(green_province)
        .group(gp_count)
        .valueAccessor(distinctCountAccessor)
        .colors(returnScale(gp_count, GREEN_COLORS, distinctCountAccessor))
        .overlayGeoJson(
            geo_data.features
            , "state"
            , function (d) {
                return d.properties['pr_name2'];
            }
        )
        .title(fundingTitle)
        .projection(getProjection("green-map-container"));



    greenPartners
        .useViewBoxResizing(true)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 5})
        .dimension(green_partner)
        .group(partner_count)
        .valueAccessor(distinctCountAccessor)
        .ordering(function (d) {
            return -d.value;
        })
        .transitionDuration(500)
        .colors(GREEN_COLORS[3])
        .x(d3.scaleBand())
        .elasticX(true)
        .title(defaultTitle)
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    greenCount
        .group(distinctCount)
        .valueAccessor(d => {
            return Object.keys(d.projects).length;
        })
        .ariaLiveRegion(true)
        .formatNumber(d3.format(""));
    // .dimension(green_data_cf)
    // .group(green_data_cf.groupAll());

    greenFunding
        .valueAccessor(function (d) {
            return Math.round(d);
        })
        .group(green_data_cf.groupAll().reduceSum((d) => {
            return d["planed_amount"];
        }));


    greenChart1
        .useViewBoxResizing(true)
        .height(300)
        .margins({top: 10, right: 0, bottom: 50, left: 20})
        .dimension(phakhao_lao_sub)
        .group(filteredGroup(pl_sub_count))
        .valueAccessor(distinctCountAccessor)
        .colors(GREEN_COLORS[3])
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('postRender', function (chart) {
            console.log("Rendered")
            chart.selectAll(".x text")
                .call(wrap, 120);
        })
        .title(defaultTitle)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxis();


    greenChart2
        .useViewBoxResizing(true)
        .height(300)
        .margins({top: 10, right: 0, bottom: 50, left: 20})
        .dimension(forest_partnership_sub)
        .group(filteredGroup(fp_sub_count))
        .valueAccessor(distinctCountAccessor)
        .colors(GREEN_COLORS[3])
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('postRender', function (chart) {
            chart.selectAll(".x text")
                .call(wrap, 120);
        })
        .title(defaultTitle)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxis();


    greenChart3
        .useViewBoxResizing(true)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 5})
        .dimension(complementary_areas)
        .group(ca_count)
        .valueAccessor(distinctCountAccessor)
        .transitionDuration(500)
        .colors(GREEN_COLORS[3])
        .x(d3.scaleBand())
        .elasticX(true)
        .title(defaultTitle)
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    greenChart4
        .useViewBoxResizing(true)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 5})
        .dimension(green_catalyzers)
        .group(gc_count)
        .valueAccessor(distinctCountAccessor)
        .transitionDuration(500)
        .colors(GREEN_COLORS[3])
        .x(d3.scaleBand())
        .elasticX(true)
        .title(defaultTitle)
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    greenChart5
        // .useViewBoxResizing(true)
        .width(150)
        .height(350)
        .margins({top: 10, right: 0, bottom: 50, left: 20})
        .dimension(phakhao_lao)
        .group(filteredGroup(pl_count))
        .valueAccessor(distinctCountAccessor)
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
        .title(defaultTitle)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxis();


    greenChart6
        // .useViewBoxResizing(true)
        .width(150)
        .height(350)
        .margins({top: 10, right: 0, bottom: 50, left: 20})
        .dimension(forest_partnership)
        .group(filteredGroup(fp_count))
        .valueAccessor(distinctCountAccessor)
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
        .title(defaultTitle)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxis();


    $('#green-reset').on('click', function (e) {
        dc.filterAll("green");
        dc.redrawAll("green");
    });

    let greenMapLegend = d3.select("#green-map-legend");
    greenMapLegend.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(20,20)");
    updateLegend(returnScale(gp_count, GREEN_COLORS, distinctCountAccessor), greenMapLegend, d3.format(",.0f"));

    green_data_cf.onChange(() => {
        if (current_measure === "funding") {
            greenMap.colors(returnScale(gp_funding, GREEN_COLORS, d => d.value));
            // mapDistrictChart.colors(returnScale(current_group[1], colors));
            updateLegend(returnScale(gp_funding, GREEN_COLORS, d => d.value), greenMapLegend, d3.format(",.0f"));
        } else {
            greenMap.colors(returnScale(gp_count, GREEN_COLORS, distinctCountAccessor));
            updateLegend(returnScale(gp_count, GREEN_COLORS, distinctCountAccessor), greenMapLegend, d3.format(",.0f"));
        }
    });

    $('#green-measure-toggle')
        .checkbox({
            onChecked: () => {
                current_measure = "funding"
                greenMap
                    .group(gp_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                updateLegend(returnScale(gp_funding, GREEN_COLORS, d => d.value), greenMapLegend, d3.format(",.0f"));
                greenPartners
                    .group(partner_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                greenChart1
                    .group(filteredGroup(pl_sub_funding))
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                greenChart2
                    .group(filteredGroup(fp_sub_funding))
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                greenChart3
                    .group(ca_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                greenChart4
                    .group(gc_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                greenChart5
                    .group(filteredGroup(pl_funding))
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                greenChart6
                    .group(filteredGroup(fp_funding))
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);

                dc.renderAll("green");
            },
            onUnchecked: () => {
                current_measure = "count"
                greenMap
                    .group(gp_count)
                    .valueAccessor(distinctCountAccessor)
                    .title(fundingTitle);
                updateLegend(returnScale(gp_count, GREEN_COLORS, distinctCountAccessor), greenMapLegend, d3.format(",.0f"));
                greenPartners
                    .group(partner_count)
                    .valueAccessor(distinctCountAccessor)
                    .title(defaultTitle);
                greenChart1
                    .group(filteredGroup(pl_sub_count))
                    .valueAccessor(distinctCountAccessor)
                    .title(defaultTitle);
                greenChart2
                    .group(filteredGroup(fp_sub_count))
                    .valueAccessor(distinctCountAccessor)
                    .title(defaultTitle);
                greenChart3
                    .group(ca_count)
                    .valueAccessor(distinctCountAccessor)
                    .title(defaultTitle);
                greenChart4
                    .group(gc_count)
                    .valueAccessor(distinctCountAccessor)
                    .title(defaultTitle);
                greenChart5
                    .group(filteredGroup(pl_count))
                    .valueAccessor(distinctCountAccessor)
                    .title(defaultTitle);
                greenChart6
                    .group(filteredGroup(fp_count))
                    .valueAccessor(distinctCountAccessor)
                    .title(defaultTitle);
                dc.renderAll("green");
            }
        });

    $('#green-download').on('click', function (e) {
        downloadData(green_partner, districtsNames, projects_by_id);
    });

}

function renderProjectsDashboard(geo_data, data, districts_list, provinces_list, districts, projects) {


    const projects_by_id = {}
    projects.forEach(project => {
        projects_by_id[project.id] = project
    });

    const retrieveSectorField = d => projects_by_id[d.project]['sector']['sector_name']
    const retrievePriorityArea = d => projects_by_id[d.project]['sector']['priority_area'];

    let districtsNames = {};


    data.forEach(d => {
        // projects_by_id[d.project]
        projects_by_id[d.project].districts = [].concat.apply([], projects_by_id[d.project].locations.map(function (d) {
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
    const distinctCount = cf.groupAll()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const province = cf.dimension(d => projects_by_id[d.project]['locations'].map(d => d.province), true);
    const count_by_province = province.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const funding_by_province = province.group()
        .reduceSum(function (d) {
            return Math.round(d.planed_amount / projects_by_id[d.project].locations.length);
        });

    const district = cf.dimension(d => {
        let districts = projects_by_id[d.project]['districts'].map(d => d);
        return districts ? districts : 'No district';
    }, true);
    const count_by_district = district.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const funding_by_district = district.group()
        .reduceSum(function (d) {
            return Math.round(d["planed_amount"] / projects_by_id[d.project].districts.length);
        });

    let sector = cf.dimension(retrieveSectorField);
    let partner = cf.dimension(d => d['partner']);


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

    const modality_dim = cf.dimension(d => d.modality);

    const nsedc_dim = cf.dimension(d => projects_by_id[d.project]['sector']['outputs'].map(o => o['outcome']).filter((v, i, a) => a.indexOf(v) === i), true)

    const sdg_dim1 = cf.dimension(d => projects_by_id[d.project]['sector']['sdg']
        .map(d => d), true);

    const cci_dim = cf.dimension(d => projects_by_id[d.project]['cross_cutting_issues'].map(d => d), true);


    let funding_by_implementing_partner = implementing_partner.group()
        .reduceSum(function (d) {
            return Math.round(d['planed_amount'] / d.implementing_partner.length);
        });


    const ip_category_dim = cf.dimension((d) => {
        return [...new Set(projects_by_id[d.project]['implementing_partner'].map(d => d['category']).map(d => d))];
    }, true);

    const partner_funding = partner.group().reduceSum(fundingFunction);
    const sector_funding = sector.group().reduceSum(fundingFunction);
    const nsedc_funding = nsedc_dim.group().reduceSum(fundingFunction);
    const cci_funding = cci_dim.group().reduceSum(fundingFunction);
    const sdg_funding = sdg_dim1.group().reduceSum(fundingFunction);
    const priority_area_funding = priority_area_dim.group().reduceSum(fundingFunction);
    const modality_funding = modality_dim.group().reduceSum(fundingFunction);
    const ip_category_funding = ip_category_dim.group().reduceSum(fundingFunction);

    const partner_count = partner.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const sector_count = sector.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const nsedc_count = nsedc_dim.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const cci_count = cci_dim.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const sdg_count = sdg_dim1.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const pa_count = priority_area_dim.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const modality_count = modality_dim.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const ipc_count = ip_category_dim.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);

    mapDistrictChart
        .useViewBoxResizing(true)
        .height(600)
        .dimension(district)
        .group(count_by_district)
        .valueAccessor(distinctCountAccessor)
        .colors(returnScale(count_by_district, colors, distinctCountAccessor))
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
        .group(count_by_province)
        .valueAccessor(distinctCountAccessor)
        .colors(returnScale(count_by_province, colors, distinctCountAccessor))
        .overlayGeoJson(
            geo_data.features
            , "state"
            , function (d) {
                return d.properties['pr_name2'];
            }
        )
        .title(fundingTitle)
        .projection(getProjection("map-container"));


    ipCategory
        .useViewBoxResizing(true)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 0, bottom: 35, left: 5})
        .dimension(ip_category_dim)
        .group(ipc_count)
        .valueAccessor(distinctCountAccessor)
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scaleBand())
        .elasticX(true)
        .title(defaultTitle)
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    partnersChart
        .useViewBoxResizing(true)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 5})
        .dimension(partner)
        .group(partner_count)
        .valueAccessor(distinctCountAccessor)
        .ordering(function (d) {
            return -d.value;
        })
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scaleBand())
        .elasticX(true)
        .on('filtered', function (chart, filter) {

        })
        .title(defaultTitle)
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    nsedcChart
        .useViewBoxResizing(true)
        .height(400)
        .margins({top: 10, right: 0, bottom: 60, left: 0})
        .dimension(nsedc_dim)
        .group(nsedc_count)
        .valueAccessor(distinctCountAccessor)
        .colors(CHART_COLOR)
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('postRender', (chart) => {
            chart.selectAll(".x text")
                .call(wrap, 60);
        })
        .title(defaultTitle)
        .x(d3.scaleBand())
        .elasticY(true)
        .xUnits(dc.units.ordinal);

    issuesChart
        .useViewBoxResizing(true)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 0, bottom: 35, left: 0})
        .dimension(cci_dim)
        .group(cci_count)
        .valueAccessor(distinctCountAccessor)
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scaleBand())
        .elasticX(true)
        .on('filtered', function (chart, filter) {

        })
        .title(defaultTitle)
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));

    sdgChart1
        .useViewBoxResizing(true)
        .height(400)
        .gap(10)
        .margins({top: 10, right: 0, bottom: 35, left: 0})
        .dimension(sdg_dim1)
        .group(sdg_count)
        .valueAccessor(distinctCountAccessor)
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scaleBand())
        .elasticX(true)
        .title(defaultTitle)
        // .colorAccessor(d => d.key)
        .ordinalColors(sdg_colors)
        // .colors(d3.scaleOrdinal().range(sdg_colors))
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));

    priorityChart
        .title(defaultTitle)
        .useViewBoxResizing(true)
        .height(200)
        .dimension(priority_area.dim)
        .group(pa_count)
        .valueAccessor(distinctCountAccessor)
        .innerRadius(50)
        .radius(80)
        .cx(80)
        .renderLabel(false)
        .legend(dc.legend().x(200).y(60).gap(5));

    modalityChart
        .title(defaultTitle)
        .useViewBoxResizing(true)
        .height(200)
        .innerRadius(50)
        .radius(80)
        .cx(80)
        .dimension(modality_dim)
        .group(modality_count)
        .valueAccessor(distinctCountAccessor)
        .renderLabel(false)
        .legend(dc.legend().x(200).y(60).gap(5));

    sectorChart
        .useViewBoxResizing(true)
        .height(350)
        .margins({top: 10, right: 0, bottom: 60, left: 20})
        .dimension(sector)
        .group(sector_count)
        .valueAccessor(distinctCountAccessor)
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
        .title(defaultTitle)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxis();


    totalFunding
        .group(cf.groupAll().reduceSum(fundingAccessor))
        .valueAccessor(function (d) {
            return Math.round(d);
        });

    totalCount
        .group(distinctCount)
        .valueAccessor(d => {
            return Object.keys(d.projects).length;
        })
        .ariaLiveRegion(true)
        .formatNumber(d3.format(""));


    // let project = cf.dimension(d => d.id);
    projectsDataGrid
        .dimension(partner)
        .section(d => d.id)
        .showSections(false)
        .columns([
            d => projects_by_id[d.project].project_title,
            d => projects_by_id[d.project].status,
            d => projects_by_id[d.project].sector.sector_name,
            d => projects_by_id[d.project].partners.map(p => p.partner).join('; '),
            d => projects_by_id[d.project].total_funding

        ]);

    renderCharts(projectCharts);

    // Initialize legend container with .legendQuant class
    let mapLegend = d3.select("#legend");

    mapLegend.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(20,20)");

    updateLegend(returnScale(count_by_province, colors, distinctCountAccessor), mapLegend, f);

    cf.onChange(() => {
        let groups = {
            'count': {
                'province': count_by_province,
                'district': count_by_district,
                'accessor': distinctCountAccessor
            },
            'funding': {
                'province': funding_by_province,
                'district': funding_by_district,
                'accessor': d => d.value
            }
        }
        mapChart.colors(returnScale(groups[config.measure]['province'], colors, groups[config.measure]['accessor']));
        mapDistrictChart.colors(returnScale(groups[config.measure]['district'], colors, groups[config.measure]['accessor']));
        updateLegend(returnScale(groups[config.measure][config.level], colors, groups[config.measure]['accessor']), mapLegend, d3.format(",.0f"));
    });

    function changeFormat(format) {
        partnersChart.xAxis().tickFormat(d3.format(format));
        sectorChart.yAxis().tickFormat(d3.format(format));
    }


    $('#measure-toggle')
        .checkbox({
            onChecked: () => {
                let geoLevel = config.level;
                config.measure = 'funding';

                mapChart
                    .group(funding_by_province)
                    .valueAccessor(d => d.value)
                    .colors(returnScale(funding_by_province, colors, d => d.value))
                    .title(fundingTitle);
                mapDistrictChart
                    .group(funding_by_district)
                    .valueAccessor(d => d.value)
                    .colors(returnScale(funding_by_district, colors, d => d.value))
                    .title(fundingTitle);
                partnersChart
                    .group(partner_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                sectorChart
                    .group(sector_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                nsedcChart
                    .group(nsedc_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                issuesChart
                    .group(cci_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                sdgChart1
                    .group(sdg_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                modalityChart
                    .group(modality_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                priorityChart
                    .group(priority_area_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                ipCategory
                    .group(ip_category_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);

                updateLegend(returnScale(geoLevel === 'province' ? funding_by_province : funding_by_district, colors, d => d.value), mapLegend, f);
                changeFormat('.2s');
                renderCharts(projectCharts);
            },
            onUnchecked: () => {
                let geolevel = config.level;
                config.measure = 'count';
                mapChart
                    .group(count_by_province)
                    .valueAccessor(distinctCountAccessor)
                    .colors(returnScale(count_by_province, colors, distinctCountAccessor))
                    .title(fundingTitle);
                mapDistrictChart
                    .group(count_by_district)
                    .valueAccessor(distinctCountAccessor)
                    .colors(returnScale(count_by_district, colors, distinctCountAccessor))
                    .title(fundingTitle);

                partnersChart
                    .valueAccessor(distinctCountAccessor)
                    .group(partner_count)
                    .title(defaultTitle);
                sectorChart
                    .valueAccessor(distinctCountAccessor)
                    .group(sector_count)
                    .title(defaultTitle);
                nsedcChart
                    .valueAccessor(distinctCountAccessor)
                    .group(nsedc_count)
                    .title(defaultTitle);
                issuesChart
                    .valueAccessor(distinctCountAccessor)
                    .group(cci_count)
                    .title(defaultTitle);
                sdgChart1
                    .valueAccessor(distinctCountAccessor)
                    .group(sdg_count)
                    .title(defaultTitle);
                priorityChart
                    .valueAccessor(distinctCountAccessor)
                    .group(pa_count)
                    .title(defaultTitle);
                modalityChart
                    .valueAccessor(distinctCountAccessor)
                    .group(modality_count)
                    .title(defaultTitle);
                ipCategory
                    .valueAccessor(distinctCountAccessor)
                    .group(ipc_count)
                    .title(defaultTitle);

                updateLegend(returnScale(geolevel === 'province' ? count_by_province : count_by_district, colors, distinctCountAccessor), mapLegend, f);
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
        downloadData(partner, districtsNames, projects_by_id);
    });

    $('#reset').on('click', function (e) {
        dc.filterAll("projects");
        dc.redrawAll("projects");
    });

    const regional = cf.dimension(d => projects_by_id[d.project]['is_regional']);
    const co_founded = cf.dimension(d => projects_by_id[d.project]['is_cofounded']);
    $('#regional-toggle')
        .checkbox({
            onChecked: () => {
                regional.filter(true)
                dc.renderAll("projects");
            },
            onUnchecked: () => {
                regional.filterAll()
                dc.renderAll("projects");
            }
        });

    $('#cofounded-toggle')
        .checkbox({
            onChecked: () => {
                co_founded.filter(true)
                dc.renderAll("projects");
            },
            onUnchecked: () => {
                co_founded.filterAll()
                dc.renderAll("projects");
            }
        });
}

function downloadData(dimension, districtsNames, projects) {
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
    let ids = [...new Set(dimension.top(Infinity).map(d => d.project))];
    let data = ids.map(function (id) {
        return [
            id,
            projects[id]['project_code'],
            projects[id]['project_title'],
            projects[id]['status'],
            projects[id]['sector']['sector_name'],
            projects[id]['partner'],
            projects[id]['total_funding'],
            projects[id]['locations'].map(function (d) {
                return d.province
            }).join('; '),
            projects[id]['districts'].map(function (d) {
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
        // .section(d => priority_areas[d['sector']])
        .section(d => d['sector'])
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
            const pa_count = sector_group.top(Infinity)
                .map(d => d.key)
                .reduce((total, sector) => {

                    total[priority_areas[sector]] = total[priority_areas[sector]] || 0;
                    ++total[priority_areas[sector]];
                    return total;
                }, {});
        })
        .sortBy(d => priority_areas[d['sector']] + d['sector']);


    pipelineFilter.render();
    pipelineTable.render();
}

function loadData(geodata, data, districts_list, provinces_list, districts, pipelines, sectors, projects, green_data) {

    dc.config.defaultColors(d3.schemeBlues[10]);

    $('#loader').toggleClass('active');

    $('#dashboard').css('visibility', 'visible');
    $('#footer').css('visibility', 'visible');

    renderProjectsDashboard(geodata, data, districts_list, provinces_list, districts, projects);

    $('.menu .item').tab({
        'onFirstLoad': (path) => {
            switch (path) {
                case 'projects':
                    renderProjectsDashboard(geodata, data, districts_list, provinces_list, districts, projects);
                    break
                case 'team-europe':
                    renderGreenDashboard(geodata, data, districts_list, provinces_list, districts, projects, green_data);
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