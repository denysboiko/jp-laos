var mapChart = dc.geoChoroplethChart("#map"),
    mapDistrictChart = dc.geoChoroplethChart("#map-district"),
    provinceChart = dc.rowChart("#provinces"),
    districtChart = dc.rowChart("#districts"),
    impPartnersChart = dc.rowChart("#implementing_partners"),
    partnersChart = dc.rowChart("#partners"),
    sectorChart = dc.barChart("#sector"),
    subsectorChart = dc.rowChart("#subsector"),
    statusChart = dc.rowChart("#status");


function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            tspans = text.selectAll('tspan'),
            words = [];

        if (tspans[0].length > 0) {
            tss = [];
            tspans[0].map(function (d) {
                tss = tss.concat(d3.select(d).text().split(/\s+/));
            }).reverse();

            words = tss.reverse();
        } else {
            words = text.text().split(/\s+/).reverse();
        }


        var word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
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
                // console.log(line)
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

    var districtsDict = {};
    var provincesDict = {};
    var districtsNames = {};
    var f = d3.format(",.0f");


    data.forEach(function (datum, index, arr) {
        datum.districts = [].concat.apply([], datum.locations.map(function (d) {
            return d.districts;
        }));
    });

    districts_list.forEach(function (e, i, arr) {
        districtsDict[e.dcode] = e.province;
        districtsNames[e.dcode] = e.name;
    });

    provinces_list.forEach(function (e, i, arr) {
        provincesDict[e.name] = e.districts;
    });


    var config = {
        level: 'province',
        measure: 'count'
    };

    $('#loader').toggleClass('active');

    var cf = crossfilter(data);

    var province = cf.dimension(function (d) {
        return d['locations'].map(function (d) {
            return d.province
        })
    }, true);


    // var location = cf.dimension(function (d) {
    //     return d['locations']
    // }, true);

    // function mergeArrays(arrays) {
    //     var result = [];
    //     arrays.forEach(function (d, i) {
    //         result.concat(d)
    //     });
    //
    //     return result;
    // }

    var district = cf.dimension(function (d) {

        var districts = d['districts'].map(function (d) {
            return d;
        });

        return districts ? districts : 'No district';

    }, true);

    // console.log(district.group().all())

    var sector = cf.dimension(function (d) {
        return d['sector'];
    });

    var partner = cf.dimension(function (d) {
        return d["partner"];
    });

    var status = cf.dimension(function (d) {
        return d['status'];
    });

    var implementing_partner = cf.dimension(function (d) {
        return d['implementing_partner'] ? d['implementing_partner'] : 'No implementing partner';
    }, true);

    var other_subsector = cf.dimension(function (d) {
        return d['other_subsector'] ? d['other_subsector'] : 'No subsector';
    });

    // Groups for Dimensions

    var count_by_province = province.group()
        .reduceCount(function (d) {
            return d["project_title"];
        });

    var funding_by_province = province.group()
        .reduceSum(function (d) {
            return Math.round(d["planed_amount"] / d.locations.length);
        });

    var count_by_district = district.group()
        .reduceCount(function (d) {
            return d["project_title"];
        });

    var funding_by_district = district.group()
        .reduceSum(function (d) {
            return Math.round(d["planed_amount"] / d.districts.length);
        });

    var count_by_sector = sector.group()
        .reduceCount(function (d) {
            return d['sector']
        });

    var funding_by_sector = sector.group()
        .reduceSum(function (d) {
            return Math.round(d['planed_amount']);
        });

    var count_by_other_subsector = other_subsector.group()
        .reduceCount(function (d) {
            return d["other_subsector"];
        });

    var funding_by_other_subsector = other_subsector.group()
        .reduceSum(function (d) {
            return Math.round(d['planed_amount']);
        });
    var count_by_implementing_partner = implementing_partner.group()
        .reduceCount(function (d) {
            return d["implementing_partner"];
        });

    var funding_by_implementing_partner = implementing_partner.group()
        .reduceSum(function (d) {
            return Math.round(d['planed_amount'] / d.implementing_partner.length);
        });


    var count_by_status = status.group()
        .reduceCount(function (d) {
            return d["status"];
        });

    var funding_by_status = status.group()
        .reduceSum(function (d) {
            return Math.round(d['planed_amount']);
        });

    var count_by_partner = partner.group()
        .reduceCount(function (d) {
            return d["partner"];
        });

    var funding_by_partner = partner.group()
        .reduceSum(function (d) {
            return Math.round(d['planed_amount']);
        });

    function reduceAdd(p, v) {
        ++p.count;
        p.total += d3.format('.0f')(v["planed_amount"] / p.count);
        return p;
    }

    function reduceRemove(p, v) {
        --p.count;
        p.total -= v["planed_amount"] / p.count;
        return p;
    }

    function reduceInitial() {
        return {
            count: 0,
            total: 0
        };
    }

    var by_province = province.group()
        .reduce(reduceAdd, reduceRemove, reduceInitial);


    var projection = d3.geo.mercator().center([106, 19]).scale(3600);

    function returnScale(group) {

        var breaks = [0].concat(group.all().map(function (d) {
            return d.value;
        }));

        var colors = ['#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#034e7b'];
        // https://github.com/schnerd/d3-scale-cluster

        var scale = d3.scaleCluster()
            .domain(breaks)
            .range(colors);

        var clusters = scale.clusters();


        if (clusters.length < colors.length) {

            var ranges = clusters.length > 1 ? clusters.length + 1 : 3;
            // if (clusters.length > 1) {
            colors = colors.slice(0, ranges);
            // }

            //    colors.length - clusters.length - 1


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
            // + '\n'
            // + 'Funding: ' + p.value;
            // d3.format('.3s')()
            // + 'Index Gain in Percentage: ' + numberFormat(p.value.percentageGain) + '%\n';
        })
        .projection(projection);


    mapChart
        .width(700)
        .height(600)
        .dimension(province)
        .group(province.group())

        // funding_by_province
        .colors(returnScale(province.group()))
        // d3.scale.quantize().range(['#fff7fb','#ece7f2','#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0','#034e7b']))
        // ["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]
        .overlayGeoJson(
            // districts.features
            geodata.features
            , "state"
            , function (d) {
                return d.properties['pr_name2'];
                // return d.properties['DName'];

            }
        )
        // .valueAccessor(function (d) {
        //     return d.value.count;
        // })
        // .keyAccessor(function (d) {
        //     return d.key.province;
        // })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
            // + '\n'
            // + 'Funding: ' + p.value;
            // + 'Index Gain in Percentage: ' + numberFormat(p.value.percentageGain) + '%\n';
        })
        .on('filtered', function (chart, filter) {

        })
        .projection(projection);


    // mapChart.on('renderlet', function (chart) {
    //     console.log($('#geolevel').val())
    //     mapChart.colors(returnScale(count_by_province))
    // })

    provinceChart
        .width(400)
        .height(650)
        .margins({top: 10, right: 40, bottom: 35, left: 40})
        .dimension(province)
        .group(province.group())
        .ordering(function (d) {
            return -d.value;
        })
        .transitionDuration(500)
        // .xAxisLabel('Provinces')
        .gap(10)
        .colors("#026CB6")
        .elasticX(true)
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .on('filtered', function (chart, filter) {

            chart.filters();
            // if ($('#geolevel').val() === 'district') {
            //     console.log(filter);
            //     mapChart.filter(['Bualapha District'])
            // }
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


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
        // .xAxisLabel('Provinces')
        .gap(10)
        .colors("#026CB6")
        .elasticX(true)
        .on('filtered', function (chart, filter) {

            chart.filters();
            // if ($('#geolevel').val() === 'district') {
            //     console.log(filter);
            //     mapChart.filter(['Bualapha District'])
            // }
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5);


    impPartnersChart
        .width(700)
        .height(750)
        .margins({top: 10, right: 40, bottom: 35, left: 40})
        .dimension(implementing_partner)
        .group(count_by_implementing_partner)
        .data(function (group) {
            // console.log(group.top(25))

            return group.top(25).filter(function (d) {
                return d.key !== 'No implementing partner'
            });
            // return group.top(25);
        })
        .ordering(function (d) {
            return -d.value;
        })
        .transitionDuration(500)
        // .xAxisLabel('Provinces')
        .gap(10)
        .colors("#026CB6")
        .elasticX(true)
        .on('filtered', function (chart, filter) {
        })
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


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
        .colors("#026CB6")
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


    sectorChart.width(700)
        .height(350)
        .margins({top: 10, right: 10, bottom: 60, left: 50})
        .dimension(sector)
        .group(count_by_sector)
        .ordering(function (d) {
            return d.key === 'Other' ? 999 : 1;
        })
        .colors("#026CB6")
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

    var subsector_height = (other_subsector.group().all().length) * (20 + 10) + 25

    subsectorChart
        .width(350)
        .height(subsector_height)
        .fixedBarHeight(20)
        .margins({top: 10, right: 40, bottom: 35, left: 40})
        .dimension(other_subsector)
        .group(other_subsector.group())
        .data(function (group) {
            // TODO: REPLACE TO ALL OR TOP(INFINITY)
            return group.top(25).filter(function (d) {
                return d.key !== 'No subsector'
            });
        })
        .ordering(function (d) {
            return -d.value;
        })
        .transitionDuration(500)
        // .xAxisLabel('Provinces')
        .gap(10)
        .colors("#026CB6")
        .elasticX(true)
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .on('filtered', function (chart, filter) {
        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    statusChart
        .width(350)
        // .height(400)
        .margins({top: 10, right: 40, bottom: 35, left: 40})
        .dimension(status)
        .group(count_by_status)
        .ordering(function (d) {
            return -d.value;
        })
        .transitionDuration(500)
        // .gap(5) // 65 = norm
        .colors("#026CB6")
        .title(function (p) {
            return p.key + ': ' + f(p.value);
        })
        .x(d3.scale.ordinal())
        .elasticX(true)
        .on('filtered', function (chart, filter) {

        })
        .xAxis()
        .ticks(5)
        .tickFormat(d3.format('d'));


    var all = cf.groupAll();

    dc.dataCount("#count")
        .dimension(cf)
        .group(all);


    var total_funding = cf.groupAll().reduceSum(function (d) {
        return d["planed_amount"];
    });

    dc.numberDisplay("#funding-total")
        .valueAccessor(function (d) {
            return Math.round(d);
        })
        .group(total_funding);


    // dc.numberDisplay("#funding-province")
    //     .valueAccessor(function (d) {
    //         return Math.round(d.value);
    //     })
    //     .group(funding_by_province);

    dc.renderAll();


    // Initialize legend container with .legendQuant class
    var svg = d3.select("#legend");
    svg.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(20,20)");


    function updateLegend(scale, format) {

        // Aplly colorscale and number format to the legend

        var legend = d3.legend.color()
            .scale(scale)
            .labelFormat(format);

        svg.select(".legendQuant")
            .call(legend);

        function clearLabel(labels) {
            labels.each(function () {
                var label = d3.select(this);
                label.text(label.text().replace('to NaN', 'and more'));
            });
        }

        svg.selectAll("text.label")
            .call(clearLabel)
    }

    updateLegend(returnScale(count_by_province), f);


    // fix interactions between map and oblast charts
    mapChart.onClick = function (datum, layerIndex) {
        var selectedRegion = mapChart.geoJsons()[layerIndex].keyAccessor(datum);
        provinceChart.filter(selectedRegion);
        // districtChart.filter(provincesDict[selectedRegion])
        mapChart.redrawGroup()
    };

    var districtFilters = [];

    mapDistrictChart.onClick = function (datum, layerIndex) {
        var selectedRegion = mapDistrictChart.geoJsons()[layerIndex].keyAccessor(datum);
        var filters = provinceChart.filters();
        districtFilters.push(selectedRegion);
        if (filters.indexOf(districtsDict[selectedRegion]) == -1) {
            provinceChart.filter(districtsDict[selectedRegion]);
        }
        districtChart.filter(selectedRegion);
        mapDistrictChart.redrawGroup();
    };


    provinceChart.onClick = function (datum) {

        var selectedRegion = datum.key;

        provinceChart.filter(selectedRegion);

        if (config.level == 'district') {
            provincesDict[selectedRegion].forEach(function (e, i) {
                districtChart.filter(e.toString());
            });
        }

        provinceChart.redrawGroup()

    };


    mapChart.hasFilter = function (filter) {
        var filters = provinceChart.filters();

        if (!filter) {
            return filters.length > 0
        }

        return filters.indexOf(filter) != -1
    };


    mapDistrictChart.hasFilter = function (filter) {
        // var groups = {
        //
        //     'district': {
        //         'count': count_by_district,
        //         'funding': funding_by_district
        //     }
        // };
        // var current_group = groups['district'][config.measure]
        // mapDistrictChart.colors(returnScale(current_group))
        // updateLegend(returnScale(current_group), d3.format(".0f"))
        //
        var filters = districtChart.filters();

        // var filters = [];
        // provinceFilters.forEach(function (e, i) {
        //     filters.concat(provincesDict[e]);
        // });

        if (!filter) {
            return filters.length > 0
        }

        x = parseInt(filter)
        return filters.indexOf(filter) != -1

    };

    cf.onChange(function (e) {

        var groups = {
            'province': {
                'count': count_by_province,
                'funding': funding_by_province
            },
            'district': {
                'count': count_by_district,
                'funding': funding_by_district
            }
        };

        var current_group = [
            groups['province'][config.measure],
            groups['district'][config.measure]
        ];

        mapChart.colors(returnScale(current_group[0]));
        mapDistrictChart.colors(returnScale(current_group[1]));
        updateLegend(returnScale(groups[config.level][config.measure]), d3.format(",.0f"));


    });


    function changeChoropleth(chart, group, colors, type) {

        var format = {
            c: ".0f",
            f: ",.3s"
        };

        chart
            .group(group)
            // .valueAccessor(group)
            .colors(colors);

        // format[type]

    }

    function projects(d) {
        return d.value.count;
    }

    function funding(d) {
        return d.value.total;
    }

    function changeFormat(format) {

        provinceChart.xAxis().tickFormat(d3.format(format));
        impPartnersChart.xAxis().tickFormat(d3.format(format));
        partnersChart.xAxis().tickFormat(d3.format(format));
        sectorChart.yAxis().tickFormat(d3.format(format));
        subsectorChart.xAxis().tickFormat(d3.format(format));
        statusChart.xAxis().tickFormat(d3.format(format));

    }

    $("#projects").on('click', function (e) {

        var geolevel = config.level;
        config.measure = 'count';
        changeChoropleth(mapChart, count_by_province, returnScale(count_by_province), 'c');
        changeChoropleth(mapDistrictChart, count_by_district, returnScale(count_by_district), 'c');
        updateLegend(returnScale(geolevel === 'province' ? count_by_province : count_by_district), f);
        provinceChart.group(count_by_province);
        partnersChart.group(count_by_partner);
        subsectorChart.group(count_by_other_subsector);
        impPartnersChart.group(count_by_implementing_partner);
        sectorChart.group(count_by_sector);
        statusChart.group(count_by_status);
        changeFormat('d');
        dc.renderAll();

    });

    $("#funding").on('click', function (e) {

        var geolevel = config.level;
        config.measure = 'funding';
        changeChoropleth(mapChart, funding_by_province, returnScale(funding_by_province), 'f');
        changeChoropleth(mapDistrictChart, funding_by_district, returnScale(funding_by_district), 'f');
        updateLegend(returnScale(geolevel === 'province' ? funding_by_province : funding_by_district), f);
        provinceChart.group(funding_by_province);
        partnersChart.group(funding_by_partner);
        subsectorChart.group(funding_by_other_subsector);
        impPartnersChart.group(funding_by_implementing_partner);
        sectorChart.group(funding_by_sector);
        statusChart.group(funding_by_status);
        changeFormat('.2s');
        dc.renderAll();

    });

    function show(container, chart) {
        document.getElementById('map').style.display = 'none';
        document.getElementById('map-district').style.display = 'none';
        document.getElementById(container).style.display = 'block';
        updateLegend(chart.colors(), f);
        chart.render();
    }

    $('#geolevel').on('change', function (e) {

        var geolevel = $(this).val();
        config.level = geolevel;

        if (geolevel == 'province') {
            show('map', mapChart);
        } else {
            show('map-district', mapDistrictChart);
        }

        $('#geolabel').html(geolevel);
    });


    function downloadData() {

        var header = [
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

        var data = partner.top(Infinity)
            .map(function (record) {
                return [
                    record['id'],
                    record['project_code'],
                    record['project_title'],
                    record['status'],
                    record['sector'],
                    record['partner'],
                    record['planed_amount'],
                    record['locations'].map(function (d) {
                        return d.province
                    }).join('; '),
                    record['districts'].map(function (d) {
                        return districtsNames[d]
                    }).join('; ')

                ];


                // header.map(function (field) {
                //     return (record[field] instanceof Array ? record[field].join(';') : record[field])
                //
                // })


            });

        data.unshift(header);
        var result = d3.csv.formatRows(data);
        var blob = new Blob([result], {type: "text/csv;charset=utf-8"});
        saveAs(blob, 'jp-projects-laos-dataset-' + (new Date()).getTime() + '.csv')

    }

    $('#download').on('click', function (e) {
        downloadData();
    });

}