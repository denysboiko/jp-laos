const CHART_COLOR = "#026CB6";
// const CHART_COLOR = "#569ae9";
// const CHART_COLOR = "#9BB1DC";
let CURRENT_STATUSES = new Set(['ongoing'])
const NEW_STATUSES = new Set(CURRENT_STATUSES)

let DISTRICTS_GEO,
    PROVINCES_GEO;

let allLocations;
let districtsNames = {};
let projects_by_id;
const SDGs = {};
// Initialize legend container with .legendQuant class
const mapLegend = d3.select("#legend");
mapLegend.append("g")
    .attr("class", "legendQuant")
    .attr("transform", "translate(20,20)");

const fundingFormat = d3.format(",.0f");
const fundingTickFormat = d3.format('.2s');
const countFormat = d3.format('d');

let cf,
    green_data_cf;

function reversible_group(group, predicate) {
    return {
        top: function (N) {
            return group.top(N).filter(predicate);
        },
        bottom: function (N) {
            return group.top(Infinity).slice(-N).filter(predicate).reverse();
        }
    };
}

function changeFormat(group, format) {

    dc.chartRegistry
        .list(group)
        .forEach(chart => {
            if (chart instanceof dc.RowChart) {
                chart.xAxis().tickFormat(format);
            } else if (chart instanceof dc.BarChart) {
                chart.yAxis().tickFormat(format);
            }
        })
}

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
    return p.key + ': ' + fundingFormat(p.value);
};

const defaultTitle = p => {
    if (p.value.projects === undefined) {
        return;
    }
    return p.key + ': ' + Object.keys(p.value.projects).length;
};

const distinctCountAccessor = d => {
    return Object.keys(d.value.projects).length;
};

function getProjection(selector) {
    let mapContainer = document.getElementById(selector);
    let width = mapContainer.clientWidth - 28;
    let h = 600;
    return d3.geoMercator()
        .fitSize([width * 0.75, h], PROVINCES_GEO);
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

// dc.config.defaultColors(d3.scaleOrdinal(d3.schemeBlues[10]));
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
const regionChart = dc.pieChart('#region-chart')
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
// const greenChart1 = dc.barChart("#green-chart-1")
//     .chartGroup("green");
// const greenChart2 = dc.barChart("#green-chart-2")
//     .chartGroup("green");
const greenChart3 = dc.rowChart("#green-chart-3")
    .chartGroup("green");
const greenChart4 = dc.rowChart("#green-chart-4")
    .chartGroup("green");
const greenCategoryChart = dc.pieChart("#green-chart-5")
    .chartGroup("green");
const greenRegionChart = dc.pieChart('#green-region-chart')
    .chartGroup("green");
// const greenChart6 = dc.barChart("#green-chart-6")
//     .chartGroup("green");
// const greenCount = dc.dataCount('#green-count')
//     .chartGroup("green");
const greenCount = dc.numberDisplay('#green-count')
    .chartGroup("green");
const greenFunding = dc.numberDisplay("#green-funding")
    .chartGroup("green");
const greenDataGrid = dc.dataTable("#green-projects-data-grid")
    .chartGroup("green");
// green-projects-data-grid


// const pipelineTable = dc.dataTable("#pipeline-table")
//     .chartGroup("pipeline");
// const pipelineFilter = dc.cboxMenu("#pipeline-partner-filter")
//     .multiple(true)
//     .chartGroup("pipeline");

const GREEN_COLORS = ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476",
    "#31a354", "#006d2c"];
// const colors = ['#003399', '#2b56ac', '#5477bd', '#7d98cf', '#a7bae0', '#d2dcef'];
// '#bccadd', '#dde5df', '#ffffe0'];
const colors = ['#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0',
    '#0570b0', '#034e7b'];


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

function renderGreenDashboard(projects, green_data) {

    let current_measure = "count"

    green_data_cf = crossfilter(green_data);
    const green_province = green_data_cf.dimension(d => projects_by_id[d.project]['locations'].map(d => d.province), true);
    const distinctCount = green_data_cf.groupAll()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);

    const complementary_areas = green_data_cf.dimension(d => {
        return projects_by_id[d.project]['complementary_area_categories'].map(d => d);
    }, true);

    const green_catalyzers = green_data_cf.dimension(d => {
        return projects_by_id[d.project]['green_catalyzers_categories'].map(d => d);
    }, true);

    const green_category_dim = green_data_cf.dimension(d => d["category"]);

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

    // const fp_sub_count = forest_partnership_sub.group()
    //     .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const ca_count = complementary_areas.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const gc_count = green_catalyzers.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    // const fp_count = forest_partnership.group()
    //     .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const pl_count = green_category_dim.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    // const pl_sub_count = phakhao_lao_sub.group()
    //     .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const partner_count = green_partner.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const gp_count = green_province.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);

    // const fp_sub_funding = forest_partnership_sub.group()
    //     .reduceSum(d => d["planed_amount"]);
    const ca_funding = complementary_areas.group()
        .reduceSum(d => d["planed_amount"]);
    const gc_funding = green_catalyzers.group()
        .reduceSum(d => d["planed_amount"]);
    // const fp_funding = forest_partnership.group()
    //     .reduceSum(d => d["planed_amount"]);
    const pl_funding = green_category_dim.group()
        .reduceSum(d => d["planed_amount"]);
    // const pl_sub_funding = phakhao_lao_sub.group()
    //     .reduceSum(d => d["planed_amount"]);
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
            PROVINCES_GEO.features
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
        .margins({top: 10, right: 5, bottom: 35, left: 10})
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
        .tickFormat(countFormat);


    greenCount
        .group(distinctCount)
        .valueAccessor(d => {
            return Object.keys(d.projects).length;
        })
        .ariaLiveRegion(true)
        .formatNumber(countFormat);
    // .dimension(green_data_cf)
    // .group(green_data_cf.groupAll());

    greenFunding
        .valueAccessor(function (d) {
            return Math.round(d);
        })
        .group(green_data_cf.groupAll().reduceSum((d) => {
            return d["planed_amount"];
        }));

    greenChart3
        .useViewBoxResizing(true)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 10})
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
        .tickFormat(countFormat);

    greenChart4
        .useViewBoxResizing(true)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 10})
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
        .tickFormat(countFormat);

    greenCategoryChart
        .title(defaultTitle)
        .useViewBoxResizing(true)
        .height(200)
        .dimension(green_category_dim)
        .group(filteredGroup(pl_count))
        .valueAccessor(distinctCountAccessor)
        .innerRadius(50)
        .radius(80)
        .ordinalColors(["#74c476", "#a1d99b"])
        .cx(80)
        .renderLabel(false)
        .legend(dc.legend().x(200).y(60).gap(5));

    const region_dim = green_data_cf.dimension(d => projects_by_id[d.project]['scope']);
    const region_funding = region_dim.group().reduceSum(d => Math.round(d['planed_amount']));
    const region_count = region_dim.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    greenRegionChart
        .title(defaultTitle)
        .useViewBoxResizing(true)
        .height(200)
        .dimension(green_category_dim)
        .group(region_count)
        .valueAccessor(distinctCountAccessor)
        .innerRadius(50)
        .radius(80)
        .ordinalColors(["#74c476", "#a1d99b"])
        .cx(80)
        .renderLabel(false)
        .legend(dc.legend().x(200).y(60).gap(5));

    const project = green_data_cf.dimension(d => d.project);

    let groupedDimension = project.group().reduce(
        function (p, v) {
            ++p.number;
            p.project = v.project;
            return p;
        },
        function (p, v) {
            --p.number;
            p.project = v.project;
            return p;
        },
        function () {
            return {number: 0, project: {}}
        });

    greenDataGrid
        .dimension(reversible_group(groupedDimension, d => d.value.number > 0))
        .section(d => d.value.project)
        .showSections(false)
        .size(1000)
        .columns([
            d => projects_by_id[d.value.project].project_title,
            d => projects_by_id[d.value.project].status,
            d => projects_by_id[d.value.project].sector,
            d => projects_by_id[d.value.project].partners.map(p => p.partner).join('; '),
            d => fundingFormat(projects_by_id[d.value.project].total_funding)
        ]);


    $('#green-reset').on('click', function (e) {
        dc.filterAll("green");
        dc.redrawAll("green");
    });

    let greenMapLegend = d3.select("#green-map-legend");
    greenMapLegend.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(20,20)");
    updateLegend(returnScale(gp_count, GREEN_COLORS, distinctCountAccessor), greenMapLegend, fundingFormat);

    green_data_cf.onChange(() => {
        if (current_measure === "funding") {
            greenMap.colors(returnScale(gp_funding, GREEN_COLORS, d => d.value));
            // mapDistrictChart.colors(returnScale(current_group[1], colors));
            updateLegend(returnScale(gp_funding, GREEN_COLORS, d => d.value), greenMapLegend, fundingFormat);
        } else {
            greenMap.colors(returnScale(gp_count, GREEN_COLORS, distinctCountAccessor));
            updateLegend(returnScale(gp_count, GREEN_COLORS, distinctCountAccessor), greenMapLegend, fundingFormat);
        }
    });

    const regional = green_data_cf.dimension(d => projects_by_id[d.project]['is_regional']);
    const co_founded = green_data_cf.dimension(d => projects_by_id[d.project]['is_cofounded']);
    $('#green-regional-toggle')
        .checkbox({
            onChecked: () => {
                regional.filter(true)
                dc.renderAll("green");
            },
            onUnchecked: () => {
                regional.filterAll()
                dc.renderAll("green");
            }
        });

    $('#green-cofounded-toggle')
        .checkbox({
            onChecked: () => {
                co_founded.filter(true)
                dc.renderAll("green");
            },
            onUnchecked: () => {
                co_founded.filterAll()
                dc.renderAll("green");
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
                updateLegend(returnScale(gp_funding, GREEN_COLORS, d => d.value), greenMapLegend, fundingFormat);
                greenPartners
                    .group(partner_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                // greenChart1
                //     .group(filteredGroup(pl_sub_funding))
                //     .valueAccessor(d => d.value)
                //     .title(fundingTitle);
                // greenChart2
                //     .group(filteredGroup(fp_sub_funding))
                //     .valueAccessor(d => d.value)
                //     .title(fundingTitle);
                greenChart3
                    .group(ca_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                greenChart4
                    .group(gc_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                greenCategoryChart
                    .group(filteredGroup(pl_funding))
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                greenRegionChart
                    .group(region_funding)
                    .valueAccessor(d => d.value)
                    .title(fundingTitle);
                changeFormat("green", fundingTickFormat);
                dc.renderAll("green");
            },
            onUnchecked: () => {
                current_measure = "count"
                greenMap
                    .group(gp_count)
                    .valueAccessor(distinctCountAccessor)
                    .title(fundingTitle);
                updateLegend(returnScale(gp_count, GREEN_COLORS, distinctCountAccessor), greenMapLegend, fundingFormat);
                greenPartners
                    .group(partner_count)
                    .valueAccessor(distinctCountAccessor)
                    .title(defaultTitle);
                // greenChart1
                //     .group(filteredGroup(pl_sub_count))
                //     .valueAccessor(distinctCountAccessor)
                //     .title(defaultTitle);
                // greenChart2
                //     .group(filteredGroup(fp_sub_count))
                //     .valueAccessor(distinctCountAccessor)
                //     .title(defaultTitle);
                greenChart3
                    .group(ca_count)
                    .valueAccessor(distinctCountAccessor)
                    .title(defaultTitle);
                greenChart4
                    .group(gc_count)
                    .valueAccessor(distinctCountAccessor)
                    .title(defaultTitle);
                greenCategoryChart
                    .group(filteredGroup(pl_count))
                    .valueAccessor(distinctCountAccessor)
                    .title(defaultTitle);
                greenRegionChart
                    .group(region_count)
                    .valueAccessor(distinctCountAccessor)
                    .title(defaultTitle);
                changeFormat("green", countFormat);
                dc.renderAll("green");
            }
        });

    $('#green-download').on('click', function (e) {
        downloadData(green_partner, projects_by_id);
    });

}

function renderProjectsDashboard(data) {
    const retrieveSectorField = d => projects_by_id[d.project]['sector']
    const retrievePriorityArea = d => projects_by_id[d.project]['priority_area']['priority_area'];

    let config = {
        level: 'province',
        measure: 'count'
    };

    cf = crossfilter(data);
    const distinctCount = cf.groupAll()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const province = cf.dimension(d => projects_by_id[d.project]['locations'].map(d => d.province), true);
    const count_by_province = province.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const funding_by_province = province.group()
        .reduceSum(d => Math.round(d.planed_amount / projects_by_id[d.project].locations.length));

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

    const region_dim = cf.dimension(d => projects_by_id[d.project]['scope']);
    const region_funding = region_dim.group().reduceSum(d => Math.round(d['planed_amount']));
    const region_count = region_dim.group()
        .reduce(addDistinctProject, removeDistinctProject, initDistinctProjects);
    const nsedc_dim = cf.dimension(d => projects_by_id[d.project]['priority_area']['outcomes'].map(o => o), true)

    const sdg_dim1 = cf.dimension(d => projects_by_id[d.project]['priority_area']['sdg'], true);

    const cci_dim = cf.dimension(d => projects_by_id[d.project]['cross_cutting_issues'].map(d => d), true);

    const ip_category_dim = cf.dimension(d => projects_by_id[d.project]['implementing_partner_categories'], true);

    const partner_funding = partner.group().reduceSum(d => Math.round(d['planed_amount']));
    const sector_funding = sector.group().reduceSum(d => Math.round(d['planed_amount']));
    const nsedc_funding = nsedc_dim.group().reduceSum(d => Math.round(d['planed_amount'] / projects_by_id[d.project]['priority_area']['outcomes'].length));
    const cci_funding = cci_dim.group().reduceSum(d => Math.round(d['planed_amount'] / projects_by_id[d.project]['cross_cutting_issues'].length));
    const sdg_funding = sdg_dim1.group().reduceSum(d => Math.round(d['planed_amount'] / projects_by_id[d.project]['priority_area']['sdg'].length));
    const priority_area_funding = priority_area_dim.group().reduceSum(d => Math.round(d['planed_amount']));
    const ip_category_funding = ip_category_dim.group().reduceSum(d => Math.round(d['planed_amount']));

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
            DISTRICTS_GEO.features
            , "state"
            , d => d.properties['DCode'].toString() // Code

        )
        .title(p => districtsNames[p.key] + ': ' + fundingFormat(p.value))
        .projection(getProjection("map-container"));

    mapChart
        .height(600)
        .useViewBoxResizing(true)
        .dimension(province)
        .group(count_by_province)
        .valueAccessor(distinctCountAccessor)
        .colors(returnScale(count_by_province, colors, distinctCountAccessor))
        .overlayGeoJson(
            PROVINCES_GEO.features
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
        .margins({top: 10, right: 0, bottom: 35, left: 10})
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
        .tickFormat(countFormat);


    partnersChart
        .useViewBoxResizing(true)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 10})
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
        .tickFormat(countFormat);


    nsedcChart
        .useViewBoxResizing(true)
        .height(400)
        .margins({top: 10, right: 0, bottom: 60, left: 50})
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
        .margins({top: 10, right: 5, bottom: 35, left: 10})
        .dimension(cci_dim)
        .group(cci_count)
        .valueAccessor(distinctCountAccessor)
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scaleBand())
        .elasticX(true)
        .title(defaultTitle)
        .xAxis()
        .ticks(5)
        .tickFormat(countFormat);

    sdgChart1
        .useViewBoxResizing(true)
        .height(400)
        .gap(10)
        .margins({top: 10, right: 0, bottom: 35, left: 10})
        .dimension(sdg_dim1)
        .group(sdg_count)
        .valueAccessor(distinctCountAccessor)
        .keyAccessor(d => SDGs[d.key])
        .transitionDuration(500)
        .ordering(d => d.key)
        .colorCalculator(d => sdg_colors[d.key - 1])
        .title(defaultTitle)
        .x(d3.scaleBand())
        .elasticX(true)
        .xAxis()
        .tickFormat(countFormat);

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

    regionChart
        .title(defaultTitle)
        .useViewBoxResizing(true)
        .height(200)
        .innerRadius(50)
        .radius(80)
        .cx(80)
        .dimension(region_dim)
        .group(region_count)
        .valueAccessor(distinctCountAccessor)
        .renderLabel(false)
        .legend(dc.legend().x(200).y(60).gap(5));

    sectorChart
        .useViewBoxResizing(true)
        .height(350)
        .margins({top: 10, right: 0, bottom: 60, left: 50})
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
        .group(cf.groupAll().reduceSum(d => d['planed_amount']))
        .valueAccessor(function (d) {
            return Math.round(d);
        });

    totalCount
        .group(distinctCount)
        .valueAccessor(d => {
            return Object.keys(d.projects).length;
        })
        .ariaLiveRegion(true)
        .formatNumber(countFormat);


    let project = cf.dimension(d => d.project).group().reduce(
        function (p, v) {
            ++p.number;
            p.project = v.project;
            return p;
        },
        function (p, v) {
            --p.number;
            p.project = v.project;
            return p;
        },
        function () {
            return {number: 0, project: {}}
        });

    projectsDataGrid
        .dimension(reversible_group(project, d => d.value.number > 0))
        .section(d => d.key)
        .showSections(false)
        .size(1000)
        .columns([
            d => projects_by_id[d.value.project].project_title,
            d => projects_by_id[d.value.project].status,
            d => projects_by_id[d.value.project].sector,
            d => projects_by_id[d.value.project].partners.map(p => p.partner).join('; '),
            d => fundingFormat(projects_by_id[d.value.project].total_funding)
        ]);

    dc.renderAll("projects");

    updateLegend(returnScale(count_by_province, colors, distinctCountAccessor), mapLegend, fundingFormat);

    cf.onChange(() => {
        if (cf.size() > 0) {
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
            updateLegend(returnScale(groups[config.measure][config.level], colors, groups[config.measure]['accessor']), mapLegend, fundingFormat);
        }
    });

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
                // .title(fundingTitle);
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
                regionChart
                    .group(region_funding)
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

                updateLegend(returnScale(geoLevel === 'province' ? funding_by_province : funding_by_district, colors, d => d.value), mapLegend, fundingFormat);
                changeFormat("projects", fundingTickFormat);
                dc.renderAll("projects");
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
                // .title(fundingTitle);

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
                regionChart
                    .valueAccessor(distinctCountAccessor)
                    .group(region_count)
                    .title(defaultTitle);
                ipCategory
                    .valueAccessor(distinctCountAccessor)
                    .group(ipc_count)
                    .title(defaultTitle);

                updateLegend(returnScale(geolevel === 'province' ? count_by_province : count_by_district, colors, distinctCountAccessor), mapLegend, fundingFormat);
                changeFormat("projects", countFormat);
                dc.renderAll("projects");
            }
        });


    function show(container, chart) {
        document.getElementById('map').style.display = 'none';
        document.getElementById('map-district').style.display = 'none';
        document.getElementById(container).style.display = 'block';
        updateLegend(chart.colors(), mapLegend, fundingFormat);
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
        downloadData(partner, projects_by_id);
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


    $('.statuses .checkbox')
        .checkbox({
            onChecked: () => {

                let $checkbox = $('.statuses .checkbox');
                $checkbox.each(function () {
                    if ($(this).checkbox('is checked')) {
                        const status = $(this).children('input').attr("name");
                        if (!NEW_STATUSES.has(status)) {
                            NEW_STATUSES.add(status)
                        }
                    }
                });
                if (!setsEqual(CURRENT_STATUSES, NEW_STATUSES)) {
                    $('#reload').removeClass("disabled");
                } else {
                    $('#reload').addClass("disabled");
                }
            },
            onUnchecked: () => {
                let $checkbox = $('.statuses .checkbox');
                $checkbox.each(function () {
                    if ($(this).checkbox('is unchecked')) {
                        const status = $(this).children('input').attr("name");
                        if (NEW_STATUSES.has(status)) {
                            NEW_STATUSES.delete(status)
                        }
                    }
                });
                if (!setsEqual(CURRENT_STATUSES, NEW_STATUSES)) {
                    $('#reload').removeClass("disabled");
                } else {
                    $('#reload').addClass("disabled");
                }
            }
        })

    $('#reload').on('click', () => {
        reloadData();
    });
}

function setsEqual(as, bs) {
    if (as.size !== bs.size) return false;
    for (var a of as) if (!bs.has(a)) return false;
    return true;
}

function reloadData() {
    const projectsUrl = "/projects";
    const statusesParam = "?status=";
    $('#loader').toggleClass('active');
    const statuses = [...NEW_STATUSES];
    let urlFilter = statuses.length > 0 ? statusesParam + statuses.join(",") : "";
    let urls = [
        'data/' + urlFilter,
        projectsUrl + urlFilter
    ]
    let promises = [];
    urls.forEach(url => promises.push(d3.json(url)));
    Promise.all(promises).then(data => {
        CURRENT_STATUSES = new Set(NEW_STATUSES);
        $('#reload').addClass("disabled");
        transformData(data[1]);
        cf.remove(() => true);
        cf.add(data[0]);

        dc.redrawAll("projects");
        $('#loader').toggleClass('active');
    });
}


function downloadData(dimension, projects) {
    let header = [
        'ID',
        'Project Code',
        'Project Title',
        'Status',
        'Start Date',
        'End Date',
        'Sector',
        'Funding by Partner',
        'Total Funding',
        'Provinces',
        'Districts',
        'Funding by Green Category',
        'Complementary Areas',
        'Green Catalyzers',
        'Additional Info'
    ];

    let ids = [...new Set(dimension.top(Infinity).map(d => d.project))];

    let data = ids.map(function (id) {
        return [
            id,
            projects[id]['project_code'],
            projects[id]['project_title'],
            projects[id]['status'],
            projects[id]['start_date'],
            projects[id]['end_date'],
            projects[id]['sector'],
            projects[id]['partners'].map(d => {
                return d.partner + ': ' + fundingFormat(d.planed_amount)
            }).join('; '),
            fundingFormat(projects[id]['total_funding']),
            projects[id]['locations'].map(function (d) {
                return d.province
            }).join('; '),
            projects[id]['districts'].map(function (d) {
                return districtsNames[d]
            })
                // .join('\n'),
                .join('; '),
            projects[id]['funding_by_green_category'].map(d => {
                return d.category + ': ' + fundingFormat(d.allocation * projects[id]['total_funding'])
            }).join('; '),
            projects[id]['complementary_area_categories'].join('; '),
            projects[id]['green_catalyzers_categories'].join('; '),
            projects[id]['additional_info']
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

    cf = crossfilter(data);
    const partner_dim = cf.dimension(d => d['partner']);
    const sector_dim = cf.dimension(d => d['sector']);
    const priorityArea = cf.dimension(d => d['priority_area']);

    var total = cf.groupAll()
        .reduceSum(dc.pluck("amount"));

    // let sector_group = sector_dim.group()
    //     .reduce(
    //         function (p, v) {
    //             p.amount += +v.amount;
    //             return p;
    //         },
    //         function (p, v) {
    //             p.amount -= +v.amount;
    //             return p;
    //         },
    //         function () {
    //             return {
    //                 amount: 0
    //             }
    //         })
    //     .order(p => priority_areas[p.key]);

    // pipelineFilter
    //     .dimension(partner_dim)
    //     .group(partner_dim.group())
    //     .on('renderlet', (chart) => {
    //         chart.selectAll(".dc-cbox-group")
    //             .classed("grouped", true)
    //             .classed("fields", true)
    //         chart.selectAll(".dc-cbox-item")
    //             .classed("ui", true)
    //             .classed("checkbox", true);
    //     });

    // const percentageFormat = d3.format(".0%");

    // pipelineTable
    //     .dimension(reversible_group(sector_group, () => true))
    //     .section(d => d['sector'])
    //     .showSections(false)
    //     .columns([
    //         d => priority_areas[d.key],
    //         d => d.key,
    //         d => percentageFormat(d.value.amount / total.value()),
    //         d => d.value.amount,
    //         d => d.value.amount,
    //         d => d.value.amount,
    //         d => d.value.amount,
    //         d => d.value.amount,
    //         d => d.value.amount,
    //         d => d.value.amount
    //
    //     ])
    //     .on('renderlet', (chart) => {
    //         const pa_count = sector_group.top(Infinity)
    //             .map(d => d.key)
    //             .reduce((total, sector) => {
    //
    //                 total[priority_areas[sector]] = total[priority_areas[sector]] || 0;
    //                 ++total[priority_areas[sector]];
    //                 return total;
    //             }, {});
    //     })
    //     .sortBy(d => priority_areas[d['sector']] + d['sector']);
    const pieChart = dc.pieChart('#pipeline-priority-area');
    pieChart
        .group("pipelines")
        .useViewBoxResizing(true)
        .height(200)
        .dimension(priorityArea)
        .group(priorityArea.group().reduceSum(d => d.amount))
        .innerRadius(50)
        .radius(80)
        .cx(80)
        .renderLabel(false)
        .legend(dc.legend().x(200).y(60).gap(5));

    const barChart = dc.barChart('#pipeline-sector');
    barChart
        .group("pipelines")
        .useViewBoxResizing(true)
        .height(350)
        .margins({top: 10, right: 0, bottom: 60, left: 50})
        .dimension(sector_dim)
        .group(sector_dim.group().reduceSum(d => d.amount))
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
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxis();
    const rowChart = dc.rowChart('#pipeline-partner');
    rowChart
        .useViewBoxResizing(true)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 5, bottom: 35, left: 10})
        .dimension(partner_dim)
        // .reduceSum(function(d) { return d.total; })
        .group(partner_dim.group().reduceSum(d => d.amount))
        .ordering(function (d) {
            return -d.value;
        })
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scaleBand())
        .elasticX(true)
        .xAxis()
        .ticks(5)
        .tickFormat(countFormat);
    var utils = $.pivotUtilities;
    var sumOverSum = utils.aggregators["Sum"];

    $("#pipeline-table").pivot(
        cf.all(), {
            rows: ["partner"],
            cols: ["priority_area", "sector"],
            aggregator: sumOverSum(["amount"])
        });


    d3.select(".pvtTable")
        .select('thead')
        .selectAll('.pvtAxisLabel')
        .remove();
    d3.select(".pvtTable")
        .select('thead')
        .select('tr')
        .select('th')
        .attr("rowspan", 3)
        .attr("colspan", 2)
        .text('Partners');
    const headerRows = d3.select(".pvtTable")
        .select('thead')
        .selectAll('tr');
    headerRows.nodes()[headerRows.size() - 1].remove()

    $('.pvtTable')
        .addClass('ui')
        .addClass('celled')
        .addClass('structured')
        .addClass('table');
    cf.onChange(() => {
        // console.log(sector_dim.group());
        // console.log(sector_dim.group().all());
        console.log(sector_dim.top(Infinity));
        // console.log(partner_dim.top(Infinity));
        $("#pipeline-table").pivot(
            sector_dim.top(Infinity), {
                rows: ["partner"],
                cols: ["priority_area", "sector"],
                aggregator: sumOverSum(["amount"])
            });
        $('.pvtTable')
            .addClass('ui')
            .addClass('celled')
            .addClass('structured')
            .addClass('table');
        d3.select(".pvtTable")
            .select('thead')
            .selectAll('.pvtAxisLabel')
            .remove();
        d3.select(".pvtTable")
            .select('thead')
            .select('tr')
            .select('th')
            .attr("rowspan", 3)
            .attr("colspan", 2)
            .text('Partners');
        const headerRows = d3.select(".pvtTable")
            .select('thead')
            .selectAll('tr');
        headerRows.nodes()[headerRows.size() - 1].remove()
    });
    pieChart.render();
    rowChart.render();
    barChart.render();
    // dc.renderAll("pipelines");

}

function transformData(projects) {
    projects_by_id = {}
    projects.forEach(project => {
        if (project.locations.length === 0) {
            project.locations = allLocations
            project.scope = "National"
        } else {
            project.scope = "Subnational"
        }
        project.districts = [].concat.apply([], project.locations.map(d => d.districts))
        projects_by_id[project.id] = project
    });
}

function loadData(geodata, data, districts_list, provinces_list, districts, pipelines, sectors, projects, green_data, sdgs) {

    sdgs.forEach(sdg => SDGs[sdg.id] = sdg.short_name + ': ' + sdg.goal)

    allLocations = provinces_list.map(d => {
        return {
            province: d.name,
            districts: d.districts
        }
    });
    districts_list.forEach(function (district) {
        districtsNames[district['dcode']] = district.name;
    });
    DISTRICTS_GEO = districts;
    PROVINCES_GEO = geodata;
    transformData(projects);

    $('#loader').toggleClass('active');

    $('#dashboard').css('visibility', 'visible');
    $('#footer').css('visibility', 'visible');

    renderProjectsDashboard(data);

    $('.menu .item').tab({
        'onFirstLoad': (path) => {
            switch (path) {
                case 'team-europe':
                    renderGreenDashboard(projects, green_data);
                    break
                case 'pipeline':
                    renderPipelines(pipelines, sectors);
                    break
            }
        },
        'onLoad': (path) => {
            switch (path) {
                case 'projects':
                    dc.renderAll("projects");
                    break
                case 'team-europe':
                    dc.renderAll("green");
                    break
                case 'pipeline':
                    break
            }
        }
    });


}