const CHART_COLOR = "#026CB6";
// const PROJECTION = d3.geo.mercator().center([107.5, 19]).scale(3600);

const mapContainer = document.getElementById("map-container");
const width = mapContainer.clientWidth - 28;
const PROJECTION = d3.geo.mercator().center([100 -0.0101 * width + 14.5, 19]).scale(3.17 * width + 1400);

// const PROJECTION = d3.geoMercator().center([106, 19]).scale(3600);


let mapChart = dc.geoChoroplethChart("#map"),
    mapDistrictChart = dc.geoChoroplethChart("#map-district"),
    // provinceChart = dc.rowChart("#provinces"),
    districtChart = dc.rowChart("#districts"),
    partnersChart = dc.rowChart("#partners"),
    sectorChart = dc.barChart("#sector"),

    nsedcChart = dc.rowChart("#nsedc"),
    issuesChart = dc.rowChart("#cross_cutting_issues"),
    sdgChart = dc.barChart("#sdg"),

    sdgChart1 = dc.rowChart("#sdg1"),
    sdgChart2 = dc.rowChart("#sdg2"),
    sdgChart3 = dc.rowChart("#sdg3"),

    priorityChart = dc.pieChart('#priority_chart');

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

function loadData(err, geodata, data, districts_list, provinces_list, districts) {

    if (!data) {
        $('#loader').toggleClass('active');
        return;
    }

    let districtsDict = {};
    let provincesDict = {};
    let districtsNames = {};
    let f = d3.format(",.0f");


    data.forEach(datum => {
        datum.districts = [].concat.apply([], datum.locations.map(function (d) {
            return d.districts;
        }));
    });

    districts_list.forEach(function (e, i, arr) {
        districtsDict[e['dcode']] = e.province;
        districtsNames[e['dcode']] = e.name;
    });

    provinces_list.forEach(function (e, i, arr) {
        provincesDict[e.name] = e.districts;
    });


    let config = {
        level: 'province',
        measure: 'count'
    };

    $('#loader').toggleClass('active');
    $('#dashboard').css('visibility', 'visible');
    $('#footer').css('visibility', 'visible');

    const cf = crossfilter(data);

    let province = cf.dimension(d => d['locations'].map(d => d.province), true);

    let district = cf.dimension(d => {
        let districts = d['districts'].map(d => d);
        return districts ? districts : 'No district';
    }, true);

    let sector = cf.dimension(retrieveSectorField);

    let partner = cf.dimension(function (d) {
        return d["partner"];
    });


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
                return Math.round(d["planed_amount"]);
            })
    }

    const nsedc_dim = cf.dimension(d => d['sector']['outputs'].map(o => o['outcome']).filter((v, i, a) => a.indexOf(v) === i), true)
    const sdg_dim = cf.dimension(d => d['sector']['sdg']
        .map(d => d), true)
    const cci_dim = cf.dimension(d => d['cross_cutting_issues'].map(d => d), true)

    // Groups for Dimensions
    let count_by_province = province.group()
        .reduceCount(function (d) {
            return d["project_title"];
        });

    let funding_by_province = province.group()
        .reduceSum(function (d) {
            return Math.round(d["planed_amount"] / d.locations.length);
        });

    let count_by_district = district.group()
        .reduceCount(function (d) {
            return d["project_title"];
        });

    let funding_by_district = district.group()
        .reduceSum(function (d) {
            return Math.round(d["planed_amount"] / d.districts.length);
        });

    let count_by_sector = sector.group()
        .reduceCount(retrieveSectorField);

    let funding_by_sector = sector.group()
        .reduceSum(function (d) {
            return Math.round(d['planed_amount']);
        });

    let count_by_implementing_partner = implementing_partner.group()
        .reduceCount(function (d) {
            return d["implementing_partner"];
        });

    let funding_by_implementing_partner = implementing_partner.group()
        .reduceSum(function (d) {
            return Math.round(d['planed_amount'] / d.implementing_partner.length);
        });

    let count_by_partner = partner.group()
        .reduceCount(function (d) {
            return d["partner"];
        });

    let funding_by_partner = partner.group()
        .reduceSum(function (d) {
            return Math.round(d['planed_amount']);
        });


    function returnScale(group) {

        let breaks = [0].concat(group.all().map(function (d) {
            return d.value;
        }));

        let colors = ['#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#034e7b'];
        // https://github.com/schnerd/d3-scale-cluster

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


    mapDistrictChart
        .width(700)
        .height(600)
        .dimension(district)
        .group(count_by_district)
        .colors(returnScale(count_by_district))
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
        .projection(PROJECTION);

    const mapContainer = document.getElementById("map-container");
    mapChart
        .width(mapContainer.clientWidth - 28)
        .height(600)
        .dimension(province)
        .group(province.group())
        // funding_by_province
        .colors(returnScale(province.group()))
        .overlayGeoJson(
            geodata.features
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
        .projection(PROJECTION);

    // provinceChart
    //     .width(400)
    //     .height(650)
    //     .margins({top: 10, right: 40, bottom: 35, left: 40})
    //     .dimension(province)
    //     .group(province.group())
    //     .ordering(function (d) {
    //         return -d.value;
    //     })
    //     .transitionDuration(500)
    //     .gap(10)
    //     .colors(CHART_COLOR)
    //     .elasticX(true)
    //     .title(function (p) {
    //         return p.key + ': ' + f(p.value);
    //     })
    //     .on('filtered', function (chart, filter) {
    //         chart.filters();
    //     })
    //     .xAxis()
    //     .ticks(5)
    //     .tickFormat(d3.format('d'));


    districtChart
        .width(400)
        .height(2800)
        .margins({top: 10, right: 40, bottom: 35, left: 40})
        .dimension(district)
        .group(district.group())
        .ordering(function (d) {
            return -d.value;
        })
        .transitionDuration(500)
        .gap(10)
        .colors(CHART_COLOR)
        .elasticX(true)
        .on('filtered', function (chart, filter) {
            chart.filters();
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5);


    partnersChart
        .width(350)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 40, bottom: 35, left: 40})
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


    nsedcChart
        .width(350)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 40, bottom: 35, left: 40})
        .dimension(nsedc_dim)
        .group(nsedc_dim.group())
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

    issuesChart
        .width(350)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 40, bottom: 35, left: 40})
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

    const sdgSubContainer = document.getElementById("sdg-sub-container");
    sdgChart1
        .width(sdgSubContainer.clientWidth - 28)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 40, bottom: 35, left: 40})
        .dimension(sdg_dim)
        .group(sdg_dim.group())
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scale.ordinal())
        .elasticX(true)
        .on('filtered', function (chart, filter) {

        })
        .colors(d3.scale.ordinal().range([
            '#da3737',
            '#caa041',
            '#4c9851',
            '#b43136',
            '#dc4e38',
            '#4aabd3']))
        .ordering(function (d) {
            return -d.value;
        })
        .data(function (group) { return group.top(6); })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    // var group = reductio().count(true)
    //     .filter(function(d) { return d.action === "C1"; })(dim.group());
    //
    // .dimension(d => d['sector']['sdg'].)

    sdgChart2
        .width(sdgSubContainer.clientWidth - 28)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 40, bottom: 35, left: 40})
        .dimension(sdg_dim)
        .group(sdg_dim.group(), "count")
        .ordering(function (d) {
            return -d.value;
        })
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scale.ordinal())
        .elasticX(true)
        .on('filtered', function (chart, filter) {

        })
        .data((group) => { return group.top(6); })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));

    sdgChart3
        .width(sdgSubContainer.clientWidth - 28)
        .height(380)
        .gap(10)
        .margins({top: 10, right: 40, bottom: 35, left: 40})
        .dimension(sdg_dim)
        .group(sdg_dim.group())
        .transitionDuration(500)
        .colors(CHART_COLOR)
        .x(d3.scale.ordinal())
        .elasticX(true)
        .on('filtered', function (chart, filter) {

        })
        // .takeFront(false)
        .data(function (group) { return group.top(6); })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));

    const sdgContainer = document.getElementById("sdg-container");
    sdgChart.width(sdgContainer.clientWidth - 28)
        .height(350)
        .margins({top: 10, right: 10, bottom: 60, left: 50})
        .dimension(sdg_dim)
        .group(sdg_dim.group())
        .ordering(function (d) {
            return d.key === 'Other' ? 999 : 1;
        })
        .colors(CHART_COLOR)
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('filtered', function (chart, filter) {

        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxisLabel('Number of Projects')
        .yAxis()
        .tickFormat(d3.format("d"));

        sdgChart.on('renderlet', function (chart) {
            chart.selectAll(".x text")
                .call(wrap, 60);
        });


    priorityChart
        .title(d => d.key + ': ' + d.value)
        .width(600)
        .height(200)
        // .cx(160)
        // .cy(0)
        .dimension(priority_area.dim)
        .group(priority_area.count)
        .innerRadius(50)
        .radius(80)
        .renderLabel(false)
        .legend(dc.legend().gap(5));


    const sectorContainer = document.getElementById("sectorContainer");
    sectorChart.width(sectorContainer.clientWidth - 28)
        .height(350)
        .margins({top: 10, right: 10, bottom: 60, left: 50})
        .dimension(sector)
        .group(count_by_sector)
        .ordering(function (d) {
            return d.key === 'Other' ? 999 : 1;
        })
        .colors(CHART_COLOR)
        .gap(10)
        .transitionDuration(500)
        .centerBar(false)
        .on('filtered', function (chart, filter) {

        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxisLabel('Number of Projects')
        .yAxis()
        .tickFormat(d3.format("d"));

    sectorChart.on('renderlet', function (chart) {
        chart.selectAll(".x text")
            .call(wrap, 60);
    });

    let all = cf.groupAll();

    dc.dataCount("#count")
        .dimension(cf)
        .group(all);


    let total_funding = cf.groupAll().reduceSum(function (d) {
        return d["planed_amount"];
    });

    dc.numberDisplay("#funding-total")
        .valueAccessor(function (d) {
            return Math.round(d);
        })
        .group(total_funding);

    dc.renderAll();


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

    updateLegend(returnScale(count_by_province), f);


    // mapChart.onClick = function (datum, layerIndex) {
    //     let selectedRegion = mapChart.geoJsons()[layerIndex].keyAccessor(datum);
    //     provinceChart.filter(selectedRegion);
    //     mapChart.redrawGroup()
    // };

    mapDistrictChart.onClick = function (datum, layerIndex) {
        let selectedRegion = mapDistrictChart.geoJsons()[layerIndex].keyAccessor(datum);
        // let filters = provinceChart.filters();
        //
        // if (filters.indexOf(districtsDict[selectedRegion]) === -1) {
        //     provinceChart.filter(districtsDict[selectedRegion]);
        // }
        districtChart.filter(selectedRegion);
        mapDistrictChart.redrawGroup();
    };


    // provinceChart.onClick = function (datum) {
    //
    //     let selectedRegion = datum.key;
    //
    //     provinceChart.filter(selectedRegion);
    //
    //     if (config.level === 'district') {
    //         provincesDict[selectedRegion].forEach(function (e, i) {
    //             districtChart.filter(e.toString());
    //         });
    //     }
    //
    //     provinceChart.redrawGroup()
    //
    // };


    // mapChart.hasFilter = function (filter) {
    //     let filters = provinceChart.filters();
    //     if (!filter) {
    //         return filters.length > 0
    //     }
    //     return filters.indexOf(filter) !== -1
    // };


    mapDistrictChart.hasFilter = function (filter) {
        let filters = districtChart.filters();

        if (!filter) {
            return filters.length > 0
        }
        return filters.indexOf(filter) !== -1

    };

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

        mapChart.colors(returnScale(current_group[0]));
        mapDistrictChart.colors(returnScale(current_group[1]));
        updateLegend(returnScale(groups[config.level][config.measure]), d3.format(",.0f"));


    });


    function changeChoropleth(chart, group, colors, type) {
        chart.group(group)
            .colors(colors);
    }

    function changeFormat(format) {

        // provinceChart.xAxis().tickFormat(d3.format(format));
        partnersChart.xAxis().tickFormat(d3.format(format));
        sectorChart.yAxis().tickFormat(d3.format(format));

    }

    $('#measure-toggle')
        .checkbox({
            onChecked: () => {
                let geolevel = config.level;
                config.measure = 'funding';
                changeChoropleth(mapChart, funding_by_province, returnScale(funding_by_province), 'f');
                changeChoropleth(mapDistrictChart, funding_by_district, returnScale(funding_by_district), 'f');
                updateLegend(returnScale(geolevel === 'province' ? funding_by_province : funding_by_district), f);
                partnersChart.group(funding_by_partner);
                sectorChart.group(funding_by_sector);
                changeFormat('.2s');
                dc.renderAll();
            },
            onUnchecked: () => {
                let geolevel = config.level;
                config.measure = 'count';
                changeChoropleth(mapChart, count_by_province, returnScale(count_by_province), 'c');
                changeChoropleth(mapDistrictChart, count_by_district, returnScale(count_by_district), 'c');
                updateLegend(returnScale(geolevel === 'province' ? count_by_province : count_by_district), f);
                partnersChart.group(count_by_partner);
                sectorChart.group(count_by_sector);
                changeFormat('d');
                dc.renderAll();
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
            'planed_amount',
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
                    record['planed_amount'],
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