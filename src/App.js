import React from 'react';
import './App.css';
import * as d3 from "d3";
import $ from "jquery";

class Encompasser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: "",
      activeData: "",
      graphs: {},
      dBoardStatus: "display",
      graphEditing: "",
      graphEditingSS: "copy",
      opt: "",
      sticky: "sticky-top",
      colors: [
        "#4BC080",
        "#4BC0B2",
        "#4BA4C0",
        "#4B76C0",
        "#4E4BC0",
        "#7E4BC0",
        "#B94BC0",
        "#C04B86",
        "#C04B4B",
        "#C07B4B",
        "#C0B54B",
        "#84C04B",
        "#50C04B"
      ],
      colorPairs: [
        [1,10],
        [5,11],
        [9,0],
        [4,12],
        [1,6],
        [4,1],
        [8,1],
        [4,8],
        [8,4],
        [8,0],
        [8,2],
        [5,12],
        [9,2],
        [4,9],
        [12,6],
        [6,0],
        [3,10],
        [4,10],
        [5,10],
        [7,1],
        [12,7]
      ],
      addGraph: {
        stage: "",
        product: ""
      },
      deleteStage: {
        stage: "",
        product: "",
        prodGraphIndex: ""
      },
      date: {
        possibleRange: [],
        displayedRange: [],
        stage: ""
      }
    };
    this.changeClient = this.changeClient.bind(this);
    this.editGraph = this.editGraph.bind(this);
    this.editGraphIndexing = this.editGraphIndexing.bind(this);
    this.editGraphOpt = this.editGraphOpt.bind(this);
    this.editOpt = this.editOpt.bind(this);
    this.saveGraph = this.saveGraph.bind(this);
    this.add = this.add.bind(this);
    this.deleteGraph = this.deleteGraph.bind(this);
    this.changeDate = this.changeDate.bind(this);
  }

  changeDate(e) {

    var months = {
      Jan: "1",
      Feb: "2",
      Mar: "3",
      Apr: "4",
      May: "5",
      Jun: "6",
      Jul: "7",
      Aug: "8",
      Sep: "9",
      Oct: "10",
      Nov: "11",
      Dec: "12"
    };

    var getDateString = function(dateObj) {
      dateObj = dateObj.toString().split(" ");
      var m = months[dateObj[1]];
      var d = dateObj[2];
      var y = dateObj[3];
      return m + "/" + d + "/" + y;
    }

    var data = this.state.data.slice();
    var myChosenDate = e.currentTarget.dataset.id.split("/");
    myChosenDate[2] = "20".concat(myChosenDate[2]);
    myChosenDate = myChosenDate.join("/");
    var dateChop = e.currentTarget.parentElement.getAttribute("class").split(" ")[1];

    var possibleRange = this.state.date.possibleRange.slice().map(getDateString);
    var displayedRange;

    for (var k = 0; k < data.length; k++) {
      if (data[k].company === this.state.activeData) {
        displayedRange = data[k].displayedDateRange.slice();
        break;
      }
    }

    displayedRange = displayedRange.map(getDateString);

    var newPossibleRange;

    if (dateChop === "min-date") {
      newPossibleRange = possibleRange.slice(0,possibleRange.indexOf(displayedRange[displayedRange.length-1])+1);
      if (!newPossibleRange.includes(myChosenDate)) {
        return;
      } else {
        displayedRange = newPossibleRange.slice(newPossibleRange.indexOf(myChosenDate), newPossibleRange.length);
      }
    } else if (dateChop === "max-date") {
      newPossibleRange = possibleRange.slice(possibleRange.indexOf(displayedRange[0]),possibleRange.length);
      if (!newPossibleRange.includes(myChosenDate)) {
        return;
      } else {
        displayedRange = newPossibleRange.slice(0, newPossibleRange.indexOf(myChosenDate)+1);
      }
    }

    var getDateObj = (myDateString) => {
      var arr = myDateString.split("/");
      return new Date(arr[2], arr[0]/1-1, arr[1]);
    };

    data[k].displayedDateRange = displayedRange.map(getDateObj);

    $(".dash-navs-cont").removeClass("sticky-top");

    this.setState({ data: data });

  }

  deleteGraph(e) {

    if (this.state.deleteStage.stage === "") {

      var graphToDelete = Object.assign({}, this.editGraphIndexing(e.currentTarget.dataset.id).slice()[0]);

      $(".dash-navs-cont").removeClass("sticky-top");

      this.setState({
        deleteStage: {
          stage: "confirm",
          product: graphToDelete.product,
          prodGraphIndex: graphToDelete.prodGraphIndex
        }
      });

    } else if (this.state.deleteStage.stage === "confirm") {
      var choice = e.currentTarget.getAttribute("class").split(" ")[2];
      if (choice === "keep-graph") {
        this.setState({
          deleteStage: {
            stage: "",
            product: "",
            prodGraphIndex: ""
          }
        });
      } else if (choice === "remove-graph") {

        var product = this.state.deleteStage.product;
        var prodGraphIndex = this.state.deleteStage.prodGraphIndex;
        var allGraphs = Object.assign({}, this.state.graphs);
        var prodGraphArr = (allGraphs[product]).slice();

        prodGraphArr.splice(prodGraphIndex, 1);
        allGraphs[product] = prodGraphArr;

        var data = this.state.data.slice();
        var currentClient = this.state.activeData;

        data = data.map((clientData) => {
          if (clientData.company === currentClient) {
            clientData.graphs[product] = prodGraphArr;
            return clientData;
          } else {
            return clientData;
          }
        });

        this.setState({ data: data });


        this.setState({ graphs: allGraphs });
        this.setState({
          deleteStage: {
            stage: "",
            product: "",
            prodGraphIndex: ""
          }
        });
      }
    }

  }

  add(e) {

    var addGraph = Object.assign({}, this.state.addGraph);

    var getGraphTypes = (myProd) => {
      this.setState({
        addGraph: {
          stage: "chooseGraph",
          product: myProd
        }
      });
    }

    if (e.currentTarget.dataset.id === "cancel-graph-type") {
      this.setState({ graphEditing: "" });
      this.setState({ graphEditingSS: "copy" });
      this.setState({ dBoardStatus: "display" });
      this.setState({
        addGraph: {
          stage: "",
          product: ""
        }
      });
    } else if (addGraph.stage === "") {

      getGraphTypes(e.currentTarget.dataset.id);

    } else if (addGraph.stage === "chooseGraph") {

      var allGraphTypes = ["Line Graph", "Bar Graph", "Pie Graph"];

      if (!allGraphTypes.includes(e.currentTarget.dataset.id)) {
        getGraphTypes(e.currentTarget.dataset.id);
        return;
      }

      var graphType = e.currentTarget.dataset.id.toLowerCase().split(" ")[0];
      var nonVid = ["clicks", "imps", "ctr", "cpc", "cost"];
      var vid = ["completeViews", "imps", "cvtr", "cpcv", "cost"];
      var pie = ["clicks", "imps", "cost"];
      var product = this.state.addGraph.product;
      var graph = { type: graphType, product: product, prodGraphIndex: "push" };

      var rand = (arr) => {
        return arr[Math.floor(Math.random()*arr.length)];
      }

      if (graph.type === "bar" || graph.type === "line") {
        if (product.includes("Video")) {
          graph.x_axis = "date";
          graph.y_axis_one = rand(vid);
          graph.y_axis_two = rand(vid);
        } else {
          graph.y_axis_one = rand(nonVid);
          graph.y_axis_two = rand(nonVid);
        }
        graph.x_axis = "date";
        graph.color_one = rand(this.state.colors);
        graph.color_two = rand(this.state.colors);
      } else if (graph.type === "pie") {

        graph.value = rand(pie);

        var data = this.state.data.slice();
        var colors = this.state.colors.slice();

        var i;
        for (i = 0; i < data.length; i++) {
          if (data[i].company === this.state.activeData) {
            break;
          }
        }

        var keyLength;
        if (product === "SEM") {
          graph.key = "keywordStats";
          keyLength = data[i].keywords.length;
        } else if (product === "Programmatic Display" || product === "Display Retargeting") {
          graph.key = "adSizeStats";
          keyLength = data[i].adSizes.length;
        }


        var pieColors = [];
        if (keyLength <= colors.length) {
          var randColorStarter = Math.floor(Math.random() * colors.length);
          for (var colorsInd = 0; colorsInd < keyLength; colorsInd++) {
            randColorStarter++;
            if (randColorStarter >= colors.length) {
              randColorStarter = 0;
            }
            pieColors.push(colors[randColorStarter]);
          }
        } else {
          for (colorsInd = 0; colorsInd < keyLength; colorsInd++) {
            var randomColor = Math.floor(Math.random() * colors.length);
            pieColors.push(colors[randomColor]);
          }
        }
        graph.pie_colors = pieColors.slice();



      }



      $(".dash-navs-cont").removeClass("sticky-top");
      this.setState({ graphEditing: [graph] });
      this.setState({ graphEditingSS: "no previous copy" });
      this.setState({ dBoardStatus: "editingGraph" });
      this.setState({
        addGraph: {
          stage: "",
          product: ""
        }
      });
    }

  }

  saveGraph(e) {
    // alert(e.target.dataset.id);

    var saveStates = () => {
      $(".dash-navs-cont").addClass("sticky-top");
      this.setState({ graphEditing: "" });
      this.setState({ graphEditingSS: "copy" });
      this.setState({ opt: "" });
      this.setState({ dBoardStatus: "display" });
    }

    if (e.currentTarget.dataset.id === "save") {

      var graphs = Object.assign({}, this.state.graphs);
      var newGraphArr = this.state.graphEditing.slice();
      var product = newGraphArr[0].product;
      var prodGraphIndex = newGraphArr[0].prodGraphIndex;
      var prodGraphsArr = graphs[product].slice();

      if (prodGraphIndex === "push") {
        prodGraphsArr.push(newGraphArr[0]);
      } else {
        prodGraphsArr[prodGraphIndex] = newGraphArr[0];
      }

      graphs[product] = prodGraphsArr;

      var data = this.state.data.slice();
      var currentClient = this.state.activeData;

      data = data.map((clientData) => {
        if (clientData.company === currentClient) {
          clientData.graphs[product] = prodGraphsArr;
          return clientData;
        } else {
          return clientData;
        }
      });

      this.setState({ graphs: graphs });
      this.setState({ data: data });

    }

    saveStates();

  };

  editOpt(e) {

    var opt = e.currentTarget.dataset.id.split(" ").slice(0,1)[0];
    var optVal = e.currentTarget.dataset.id.split(" ").slice(1,2)[0];
    var graph = Object.assign({}, this.state.graphEditing.slice(0,1)[0]);

    if (optVal === "none") {
      delete graph.y_axis_two;
      delete graph.color_two;
    } else {
      graph[opt] = optVal;
      if (!graph.color_two) {
        var colors = this.state.colors.slice();
        var randColor = function() {
          return colors[Math.floor(Math.random()*colors.length)];
        }
        var colorTwo = randColor();
        while (colorTwo === graph.color_one) {
          colorTwo = randColor();
        }
        graph.color_two = colorTwo;
      }
    }

    this.setState({
      graphEditing: [graph]
    });

  };

  editGraphOpt(e) {
    var option = e.currentTarget.dataset.id;
    var graph = Object.assign({}, this.state.graphEditing.slice(0,1)[0]);
    var product = graph.product;
    var colors = this.state.colors.slice();
    var opts;
    var optsObj;

    if (graph.type === "bar" || graph.type === "line") {

      if (option === "y_axis_one") {

        if (product.includes("Video")) {
          opts = ["completeViews", "imps", "cvtr", "cpcv", "cost"];
        } else {
          opts = ["clicks", "imps", "ctr", "cpc", "cost"];
        }

      } else if (option === "color_one") {

        opts = colors;

      } else if (option === "y_axis_two") {

        if (product.includes("Video")) {
          opts = ["completeViews", "imps", "cvtr", "cpcv", "cost", "none"];
        } else {
          opts = ["clicks", "imps", "ctr", "cpc", "cost", "none"];
        }

      } else if (option === "color_two") {

        opts = colors;

      }

      optsObj = {
        optionEditing: option,
        optionOptions: opts
      }

      this.setState({
        opt: optsObj
      });

    } else if (graph.type === "pie") {

      if (option === "value") {
        opts = ["clicks", "imps", "cost"];
      }

      optsObj = {
        optionEditing: option,
        optionOptions: opts
      }

      this.setState({
        opt: optsObj
      });

    }



  }

  editGraphIndexing(ind) {

    var graphs = Object.assign({}, this.state.graphs);
    var products = Object.keys(graphs).slice();
    var graphsFlattened = [];
    var productsFlattened = [];

    products.forEach((product) => {
      var productGraphs = graphs[product].slice();
      for (var i = 0; i < productGraphs.length; i++) {
        graphsFlattened.push(Object.assign({}, productGraphs[i]));
        productsFlattened.push(product);
      }
      return;
    });

    var theProduct = productsFlattened[ind];
    var prodGraphIndex;
     for (var j = (ind/1); j >= 0; j--) {
     if (productsFlattened[j] !== theProduct) {
        prodGraphIndex = ind - (j + 1);
        break;
      } else if (j === 0) {
        prodGraphIndex = ind;
        break;
      }
    }

    graphsFlattened[ind].product = productsFlattened[ind];
    graphsFlattened[ind].index = ind;
    graphsFlattened[ind].prodGraphIndex = prodGraphIndex;
    return [graphsFlattened[ind]];
  }

  editGraph(e) {

    if (this.state.dBoardStatus === "display") {
      var graph = this.editGraphIndexing(e.currentTarget.dataset.id).slice();

      $(".dash-navs-cont").removeClass("sticky-top");

      this.setState({
        graphEditing: graph
      });
      this.setState({
        graphEditingSS: graph
      });
      this.setState({
        dBoardStatus: "editingGraph"
      });
    }

  }

  changeClient(e) {

    var data = this.state.data.slice();
    var index = e.currentTarget.dataset.id;
    var newClient = data[index].company;
    var cGraphsToUse = Object.assign({}, data[index].graphs);
    var chosenClientProducts = Object.keys(data[index].productStats);
    var clientGraphs = {};

    chosenClientProducts.forEach((prod) => {
      var prodGraphLength = cGraphsToUse[prod].length;
      clientGraphs[prod] = [];
      for (var i = 0; i < prodGraphLength; i++) {
        clientGraphs[prod].push(Object.assign({}, cGraphsToUse[prod][i]));
      }
    });

    this.setState({
      activeData: newClient
    });
    this.setState({
      graphs: clientGraphs
    });
    this.setState({
      addGraph: {
        stage: "",
        product: ""
      }
    });

  }

  componentWillMount() {
    var colors = this.state.colors.slice();
    var data = [
      {
        company: "Mallard Creek Remodeling",
        keywords: [
          "home remodeling near me",
          "home remodeling",
          "kitchen remodeling",
          "bathroom remodeling",
          "home renovation",
          "bathtub remodel",
          "home improvement",
          "home improvement store",
          "residential contractors",
          "mallard creek remodeling"
        ]
      },
      {
        company: "Swift Auto Center",
        keywords: [
          "auto center near me",
          "auto center",
          "collision center",
          "car repair",
          "auto repair",
          "dent repair",
          "dent repair cost",
          "swift auto center",
          "body shop",
          "body shop near me"
        ]
      },
      {
        company: "St. Peters Catholic Church",
        keywords: [
          "church near me",
          "churches near me",
          "episcopal church",
          "protestant church",
          "nearest church location",
          "catholic church near me",
          "where to go to church",
          "churches open every day",
          "best church to join",
          "catholic church"
        ]
      },
      {
        company: "WestSide Credit Union",
        keywords: [
          "credit union",
          "credit union open today",
          "credit union open late",
          "credit union near me",
          "best credit union",
          "credit union perks"
        ]
      },
      {
        company: "City Health Arthritis Clinic",
        keywords: [
          "city health arthritis clinic",
          "arthritis clinic",
          "arthritis relief",
          "arthritis management",
          "arthritis help"
        ]
      },
      {
        company: "Crown Software Systems",
        keywords: [
          "web developer",
          "front end developers",
          "front end programmer",
          "programming company",
          "b2b programming company",
          "crown software",
          "crown software systems",
          "crown software reviews"
        ]
      },
      {
        company: "Johnson & Associates",
        keywords: [
          "divorce lawyers",
          "best divorce lawyer",
          "family lawyer",
          "best family lawyer",
          "cheap family lawyer",
          "top divorce lawyers near me",
          "top divorce lawyers",
          "johnson and associates"
        ]
      },
      {
        company: "RWMHP Education Board",
        keywords: [
          "private school",
          "k-12 private school",
          "charter school",
          "public school alternatives"
        ]
      },
      {
        company: "JX Designs, LLC",
        keywords: [
          "home design",
          "new home design",
          "new home construction",
          "home builders",
          "new home builders",
          "custom home design",
          "custom house design",
          "house design",
          "home design near me",
          "jx designs"
        ]
      },
      {
        company: "McCahill & Associates",
        keywords: [
          "injury lawyer",
          "injury attorney",
          "accident attorney",
          "auto accident attorney",
          "motorcycle injury lawyer",
          "motorcycle injury attorney",
          "mccahill and associates",
          "workers comp lawyer",
          "slip and fall lawyer",
          "slip and fall attorney"
        ]
      }
    ];

    data.forEach(function(client) {

      var availableAdSizes = [
        "300x600",
        "300x250",
        "320x50",
        "728x90",
        "320x100",
        "300x300",
        "320x480",
        "300x300",
        "980x250"
      ];
      var myAdSizes = availableAdSizes.slice().filter(function(adSize) {
        var randAdSizeProb = Math.random();
        if (randAdSizeProb < 0.8) { return adSize; }
      });
      if (myAdSizes.length < 1) {
        myAdSizes = [availableAdSizes[Math.random()*availableAdSizes.length]];
      }
      client.adSizes = myAdSizes.slice();

    });

    var geos = [
      "Dallas, TX",
      "New York, NY",
      "Seattle, WA",
      "Detroit, MI",
      "St. Louis, MO",
      "Phoenix, AZ",
      "Tampa, FL",
      "Denver, CO",
      "Portland, OR",
      "Minneapolis, MN"
    ];
    var productsAvailable = [
      "SEM",
      "Social Media",
      "Programmatic Display",
      "Programmatic Video"
    ];
    var months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12"
    };
    var productRanges = {
      SEM: { cpc: [0.6, 7.6], ctr: [0.011, 0.047] },
      Social_Media: { cpc: [0.3, 1.8], ctr: [0.001, 0.004] },
      Programmatic_Display: { cpc: [0.3, 1.8], ctr: [0.001, 0.004] },
      Programmatic_Video: { cpcv: [0.05, 0.25], cvtr: [0.9, 0.99] },
      Social_Media_Retargeting: { cpc: [0.15, 1.6], ctr: [0.003, 0.012] },
      Display_Retargeting: { cpc: [0.15, 1.6], ctr: [0.003, 0.012] }
    };
    var daysReportingOn = 30;
    for (var i = 0; i < data.length; i++) {
      var geoIndex = Math.floor(Math.random() * geos.length);
      data[i].geo = geos[geoIndex];
      geos.splice(geoIndex, 1);

      var numOfProductsChosen =
        Math.floor(Math.random() * productsAvailable.length) + 1;
      var largestBudget = Math.floor(Math.random() * 100) * 100;
      if (largestBudget < 500) {
        largestBudget = 500;
      }
      var productsChosen = {};
      for (var j = 0; j < numOfProductsChosen; j++) {
        var productChoosing =
          productsAvailable[
            Math.floor(Math.random() * productsAvailable.length)
          ];
        var productChoosingBudget =
          Math.floor(Math.random() * (largestBudget / 100)) * 100;
        if (productChoosingBudget < 500) {
          productChoosingBudget = 500;
        }
        if (productsChosen.hasOwnProperty(productChoosing)) {
          productsChosen[productChoosing] += productChoosingBudget;
        } else {
          productsChosen[productChoosing] = productChoosingBudget;
        }
      }
      var retargetingChance = Math.random();
      if (retargetingChance > 0.6667) {
        var retargetingBudget = Math.floor(largestBudget / 100 * 0.1) * 100;
        if (retargetingBudget < 100) {
          retargetingBudget = 100;
        }
        var retargetingTypeChance = Math.random();
        if (retargetingTypeChance > 0.6667) {
          productsChosen["Social Media Retargeting"] = retargetingBudget;
        } else if (retargetingTypeChance <= 0.6666) {
          productsChosen["Display Retargeting"] = retargetingBudget;
        }
      }
      data[i].productBudgets = productsChosen;
      var myProducts = Object.keys(data[i].productBudgets);
      var productStats = {};
      for (var k = 0; k < myProducts.length; k++) {
        var dailyStats = [];
        var productAllTimeCpc;
        var productAllTimeCtr;
        var productAllTimeCpcv;
        var productAllTimeCvtr;
        var productUnderscored = myProducts[k].replace(/[ ]/g, "_");
        if (productUnderscored.includes("Video")) {
          productAllTimeCpcv =
            Math.random() *
              (productRanges[productUnderscored].cpcv[1] -
                productRanges[productUnderscored].cpcv[0]) +
            productRanges[productUnderscored].cpcv[0];
          productAllTimeCvtr =
            Math.random() *
              (productRanges[productUnderscored].cvtr[1] -
                productRanges[productUnderscored].cvtr[0]) +
            productRanges[productUnderscored].cvtr[0];
        } else {
          productAllTimeCpc =
            Math.random() *
              (productRanges[productUnderscored].cpc[1] -
                productRanges[productUnderscored].cpc[0]) +
            productRanges[productUnderscored].cpc[0];
          productAllTimeCtr =
            Math.random() *
              (productRanges[productUnderscored].ctr[1] -
                productRanges[productUnderscored].ctr[0]) +
            productRanges[productUnderscored].ctr[0];
        }
        for (var l = daysReportingOn; l > 0; l--) {
          var todayStats = {};
          var date = new Date(new Date().setDate(new Date().getDate() - l));
          date = date.toString().split(" ");
          var month = months[date[1]];
          var day = date[2];
          var year = date[3];
          todayStats.date = new Date(year + "," + month + "," + day);
          var currentProductBudget = data[i].productBudgets[myProducts[k]];
          var dailyBudget = currentProductBudget / daysReportingOn;
          var dailySpendVariationLimit = dailyBudget * 0.15;
          var todaySpend =
            (dailyBudget +
              (Math.random() * dailySpendVariationLimit -
                dailySpendVariationLimit / 2)
            ).toFixed(2) / 1;
          todayStats.cost = todaySpend;
          if (myProducts[k].includes("Video")) {
            var todayCpcvVariationLimit = productAllTimeCpcv * 0.15;
            var todayCpcv =
              (productAllTimeCpcv +
                (Math.random() * todayCpcvVariationLimit -
                  todayCpcvVariationLimit / 2)
              ).toFixed(2) / 1;
            var todayCompleteViews = (todaySpend / todayCpcv).toFixed(0) / 1;
            var todayCvtrVariationLimit = productAllTimeCvtr * 0.15;
            var todayCvtr =
              (productAllTimeCvtr +
                (Math.random() * todayCvtrVariationLimit -
                  todayCvtrVariationLimit / 2)
              ).toFixed(4) / 1;
            var todayImps = (todayCompleteViews / todayCvtr).toFixed(0) / 1;
            todayStats.imps = todayImps;
            todayStats.completeViews = todayCompleteViews;
            todayStats.cvtr = todayCvtr;
            todayStats.cpcv = todayCpcv;
          } else {
            var todayCpcVariationLimit = productAllTimeCpc * 0.15;
            var todayCpc =
              (productAllTimeCpc +
                (Math.random() * todayCpcVariationLimit -
                  todayCpcVariationLimit / 2)
              ).toFixed(2) / 1;
            var todayClicks = (todaySpend / todayCpc).toFixed(0) / 1;
            var todayCtrVariationLimit = productAllTimeCtr * 0.15;
            var todayCtr =
              (productAllTimeCtr +
                (Math.random() * todayCtrVariationLimit -
                  todayCtrVariationLimit / 2)
              ).toFixed(4) / 1;
            todayImps = (todayClicks / todayCtr).toFixed(0) / 1;
            todayStats.imps = todayImps;
            todayStats.clicks = todayClicks;
            todayStats.ctr = todayCtr;
            todayStats.cpc = todayCpc;
          }

          if (myProducts[k] === "SEM" || myProducts[k] === "Programmatic Display" || myProducts[k] === "Display Retargeting") {

            var mySpecStats;
            var todaySpecStats = [];

            if (myProducts[k] === "SEM") {
              mySpecStats = data[i].keywords.slice();
            } else if (myProducts[k] === "Programmatic Display" || myProducts[k] === "Display Retargeting") {
              mySpecStats = data[i].adSizes.slice();
            }

            var dailyStatMultGen = function(spec) {

              var multiplier = {};
              var leftOfOne = 1;
              for (var ab = 0; ab < spec.length; ab++) {
                if (ab !== spec.length-1) {
                  var myMult = Math.random()*(leftOfOne*0.7);
                  multiplier[spec[ab]] = myMult;
                  leftOfOne = leftOfOne - myMult;
                } else if (ab === spec.length-1) {
                  multiplier[spec[ab]] = leftOfOne;
                }
              }
              return multiplier;

            }

            var clickMultipliers = dailyStatMultGen(mySpecStats);
            var impMultipliers = dailyStatMultGen(mySpecStats);
            var spendMultipliers = dailyStatMultGen(mySpecStats);
            var tSSTodayObj;

            for (var ab = 0; ab < mySpecStats.length; ab++) {

              var tSSTodayClicks = todayClicks*clickMultipliers[mySpecStats[ab]]/1;
              var tSSTodayImps = todayImps*impMultipliers[mySpecStats[ab]]/1;
              var tSSTodaySpend = todaySpend*spendMultipliers[mySpecStats[ab]]/1;

              if (tSSTodayClicks < 0) { (tSSTodayClicks = 0); }
              if (tSSTodayImps < 0) { tSSTodayImps = 0; }
              if (tSSTodaySpend < 0) { tSSTodaySpend = 0; }

              if (tSSTodayClicks === 0 || tSSTodayImps === 0) {
                var tSSTodayCtr = 0;
              } else {
                tSSTodayCtr = (tSSTodayClicks/tSSTodayImps)/1;
              }
              if (tSSTodaySpend === 0 || tSSTodayClicks === 0) {
                var tSSTodayCpc = 0;
              } else {
                tSSTodayCpc = (tSSTodaySpend/tSSTodayClicks)/1;
              }

              tSSTodayObj = {
                clicks: tSSTodayClicks,
                imps: tSSTodayImps,
                ctr: tSSTodayCtr,
                cpc: tSSTodayCpc,
                cost: tSSTodaySpend
              };

              if (myProducts[k] === "SEM") {
                tSSTodayObj.keyword = mySpecStats[ab];
              } else if (myProducts[k] === "Programmatic Display" || myProducts[k] === "Display Retargeting") {
                tSSTodayObj.adSize = mySpecStats[ab];
              }
              todaySpecStats.push(Object.assign({}, tSSTodayObj));

            }

            if (myProducts[k] === "SEM") {
              todayStats.keywordStats = todaySpecStats;
            } else if (myProducts[k] === "Programmatic Display" || myProducts[k] === "Display Retargeting") {
              todayStats.adSizeStats = todaySpecStats;
            }
          }
          dailyStats.push(todayStats);
        }
        productStats[myProducts[k]] = dailyStats;
      }

      var displayD3Stuff = [
        { type: "bar", x_axis: "date", y_axis_one: "clicks", y_axis_two: "imps", color_one: colors[7], color_two: colors[4] },
        { type: "line", x_axis: "date", y_axis_one: "ctr", y_axis_two: "cpc", color_one: colors[4], color_two: colors[0] }
      ];
      var dynamicDisplayD3Stuff = [
        { type: "bar", x_axis: "date", y_axis_one: "clicks", y_axis_two: "imps", color_one: colors[7], color_two: colors[4] },
        { type: "line", x_axis: "date", y_axis_one: "ctr", y_axis_two: "cpc", color_one: colors[4], color_two: colors[0] },
        { type: "pie", key: "adSizeStats", value: "clicks" }
      ];
      var semD3Stuff = [
        { type: "bar", x_axis: "date", y_axis_one: "clicks", y_axis_two: "imps", color_one: colors[7], color_two: colors[4] },
        { type: "line", x_axis: "date", y_axis_one: "ctr", y_axis_two: "cpc", color_one: colors[4], color_two: colors[0] },
        { type: "pie", key: "keywordStats", value: "clicks" }
      ];
      var videoD3Stuff = [
        {
          type: "bar",
          x_axis: "date",
          y_axis_one: "completeViews",
          y_axis_two: "imps",
          color_one: colors[7],
          color_two: colors[4]
        },
        {
          type: "line",
          x_axis: "date",
          y_axis_one: "cvtr",
          y_axis_two: "cpcv",
          color_one: colors[4],
          color_two: colors[0]
        }
      ];

      var thisClientProducts = Object.keys(productStats);
      var thisClientGraphs = {};
      var colorPairs = this.state.colorPairs.slice();
      var myPair;

      var randColorPair = (graphsArr) => {
        var newGraphs = graphsArr.slice().map((graph) => {
          var myGraph = Object.assign({}, graph);
          if (myGraph.type === "bar" || myGraph.type === "line") {
            myPair = colorPairs[Math.floor(Math.random()*colorPairs.length)];
            myGraph.color_one = colors[myPair[0]];
            myGraph.color_two = colors[myPair[1]];
            if (myGraph.type === "bar") {
              var randRemove = Math.random();
              if (randRemove < 0.3333) {
                  delete myGraph.y_axis_two;
                  delete myGraph.color_two;
              }
            }
            return myGraph;
          } else if (myGraph.type === "pie") {

            var keyLength;

            if (graph.key === "keywordStats") {
              keyLength = data[i].keywords.length;
            } else if (graph.key === "adSizeStats") {
              keyLength = data[i].adSizes.length;
            }

            var pieColors = [];
            if (keyLength <= colors.length) {
              var randColorStarter = Math.floor(Math.random() * colors.length);
              for (var colorsInd = 0; colorsInd < keyLength; colorsInd++) {
                randColorStarter++;
                if (randColorStarter >= colors.length) {
                  randColorStarter = 0;
                }
                pieColors.push(colors[randColorStarter]);
              }
            } else {
              for (colorsInd = 0; colorsInd < keyLength; colorsInd++) {
                var randomColor = Math.floor(Math.random() * colors.length);
                pieColors.push(colors[randomColor]);
              }
            }
            myGraph.pie_colors = pieColors.slice();
            return myGraph;
          }
        });
        return newGraphs.slice();
      }

      for (var p = 0; p < thisClientProducts.length; p++) {
        if (thisClientProducts[p].includes("Video")) {
          videoD3Stuff = randColorPair(videoD3Stuff);
          thisClientGraphs[thisClientProducts[p]] = videoD3Stuff;
        } else if (thisClientProducts[p] === "SEM") {
          semD3Stuff = randColorPair(semD3Stuff);
          thisClientGraphs[thisClientProducts[p]] = semD3Stuff;
        } else if (thisClientProducts[p] === "Programmatic Display" || thisClientProducts[p] === "Display Retargeting") {
          dynamicDisplayD3Stuff = randColorPair(dynamicDisplayD3Stuff);
          thisClientGraphs[thisClientProducts[p]] = dynamicDisplayD3Stuff;
        } else {
          displayD3Stuff = randColorPair(displayD3Stuff);
          thisClientGraphs[thisClientProducts[p]] = displayD3Stuff;
        }
      }

      data[i].graphs = thisClientGraphs;
      data[i].productStats = productStats;

    }

    var randomClientIndex = Math.floor(Math.random() * data.length);
    var randomClient = data[randomClientIndex].company;

    //below, may have to assign & slice more
    var randomClientGraphs = Object.assign({}, data[randomClientIndex].graphs);

    var possibleDates = [];
    var miloLimit = 86400000*daysReportingOn;
    for (var milo = 86400000; milo <= miloLimit; milo = milo + 86400000) {
      var todaysDate = new Date(Date.parse(new Date()) - milo);
      possibleDates.unshift(todaysDate);
    }

    var getDeeps = (currDate) => {
      return new Date(JSON.parse(JSON.stringify(currDate)));
    };
    data.map((clientData) => {
      var myDates = possibleDates.map(getDeeps);
      clientData.displayedDateRange = myDates;
      return;
    });

    this.setState({
      date: {
        possibleRange: possibleDates,
        displayedRange: possibleDates,
        stage: ""
      }
    });
    this.setState({
      data: data
    });
    this.setState({
      activeData: randomClient
    });
    this.setState({
      graphs: randomClientGraphs
    });

  }

  render() {
    return (
      <div className="container-fluid px-0">
        <DeleteGraph
          deleteStage={this.state.deleteStage}
          deleteGraph={this.deleteGraph}
        />
        <EditGraph
          dBoardStatus={this.state.dBoardStatus}
          colors={this.state.colors}
          data={this.state.data}
          activeData={this.state.activeData}
          graphs={this.state.graphs}
          graphCreator={this.state.graphCreator}
          editGraph={this.state.editGraph}
          graphEditing={this.state.graphEditing}
          graphEditingSS={this.state.graphEditingSS}
          editGraphOpt={this.editGraphOpt}
          opt={this.state.opt}
          editOpt={this.editOpt}
          saveGraph={this.saveGraph}
          deleteGraph={this.deleteGraph}
          date={this.state.date}
        />
        <Nav
          data={this.state.data}
          activeData={this.state.activeData}
          changeClient={this.changeClient}
        />
        <div className="row no-gutters">
          <div className="client-panel col-md-2 col-sm-3">
            <Panel
              data={this.state.data}
              activeData={this.state.activeData}
              changeClient={this.changeClient}
            />
          </div>
          <div className="dashboard col">
            <Dashboard
              data={this.state.data}
              activeData={this.state.activeData}
              graphs={this.state.graphs}
              graphCreator={this.graphCreator}
              dBoardStatus={this.state.dBoardStatus}
              editGraph={this.editGraph}
              colors={this.state.colors}
              add={this.add}
              addGraph={this.state.addGraph}
              deleteGraph={this.deleteGraph}
              changeDate={this.changeDate}
              date={this.state.date}
            />
          </div>
        </div>
      </div>
    );
  }
}

class DeleteGraph extends React.Component {
  render() {
    if (this.props.deleteStage.stage === "confirm") {
      return(
        <div className="delete-graph-cont">
          <div className="delete-graph col-11 col-md-7 col-lg-3">
            <div className="text-center">Are you sure you want to delete this graph?</div>
            <div className="row justify-content-center">
              <div className="col text-center" style={{ marginTop: "4px", marginBottom: "4px" }}>
                <button type="button" className="btn btn-success keep-graph" onClick={this.props.deleteGraph.bind(this)}>Keep</button>
              </div>
              <div className="col text-center" style={{ marginTop: "4px", marginBottom: "4px" }}>
                <button type="button" className="btn btn-danger remove-graph" onClick={this.props.deleteGraph.bind(this)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      );
    } else return null;
  }
}

class EditGraph extends React.Component {
  render() {
    if (this.props.dBoardStatus === "editingGraph") {
      return(
        <div className="edit-graph-cont">
          <div className="edit-graph">
            <GraphOptions
              graphEditing={this.props.graphEditing}
              graphEditingSS={this.props.graphEditingSS}
              colors={this.props.colors}
              editGraphOpt={this.props.editGraphOpt}
              opt={this.props.opt}
              editOpt={this.props.editOpt}
              saveGraph={this.props.saveGraph}
            />
            <Graphs
              data={this.props.data}
              activeData={this.props.activeData}
              graphs={this.props.graphs}
              graphCreator={this.props.graphCreator}
              dBoardStatus={this.props.dBoardStatus}
              editGraph={this.props.editGraph}
              graphEditing={this.props.graphEditing}
              colors={this.props.colors}
              parent={this.constructor.name}
              deleteGraph={this.props.deleteGraph}
              date={this.props.date}
            />
          </div>
        </div>
      );
    } else return null;
  }
};

class GraphOptions extends React.Component {
  render() {
    // var graphOpts = this.props.graphEditing.slice()[0];
    var graphOpts = Object.assign({}, this.props.graphEditing.slice(0,1)[0]);
    // var Display_Retargeting = ["clicks", "imps", "ctr", "cpc", "cost"];
    // var Programmatic_Video = ["completeViews", "imps", "cvtr", "cpcv", "cost"];

    var optCatFormatter = (optCat) => {
      var formatted = {
        y_axis_one: "Editing: Left Y Value",
        color_one: "Editing: Left Y Color",
        y_axis_two: "Editing: Right Y Value",
        color_two: "Editing: Right Y Color",
        value: "Editing: Arc Value"
      };
      if (formatted[optCat]) {
        return formatted[optCat];
      } else {
        return optCat;
      }
    };

      if (graphOpts.type === "bar" || graphOpts.type === "line") {

        return(
          <div>
            <nav className="navbar navbar-expand-sm navbar-light bg-light edit-nav-tree-top">
              <div className="navbar-item edit-nav-tree-top-product">{this.props.graphEditing[0].product}</div>

              <div className="nav-item dropdown">

                <div className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown">
                  {
                    this.props.opt.optionEditing ?
                      <span className="opt-cat">{optCatFormatter(this.props.opt.optionEditing)}</span>
                    : <span className="opt-cat-beg">Edit</span>
                  }
                </div>

                <div className="dropdown-menu">
                  <div
                    className="dropdown-item"
                    data-id="y_axis_one"
                    onClick={this.props.editGraphOpt.bind(this)}
                  >
                    Left Y Axis Value
                  </div>
                  <div
                    className="dropdown-item"
                    data-id="color_one"
                    onClick={this.props.editGraphOpt.bind(this)}
                  >
                    Left Y Axis Color
                  </div>

                  {
                    !graphOpts.y_axis_two ?
                    <div
                      className="dropdown-item"
                      data-id="y_axis_two"
                      onClick={this.props.editGraphOpt.bind(this)}
                    >
                      Add Right Y Axis
                    </div>:
                    <div><div
                      className="dropdown-item"
                      data-id="y_axis_two"
                      onClick={this.props.editGraphOpt.bind(this)}
                    >
                      Right Y Axis Value
                    </div>
                    <div
                      className="dropdown-item"
                      data-id="color_two"
                      onClick={this.props.editGraphOpt.bind(this)}
                    >
                      Right Y Axis Color
                    </div></div>
                  }

                </div>
              </div>
              <SaveGraph
                graphEditing={this.props.graphEditing}
                graphEditingSS={this.props.graphEditingSS}
                saveGraph={this.props.saveGraph}
              />
            </nav>
            <GraphOptChooser
              opt={this.props.opt}
              graphEditing={this.props.graphEditing}
              colors={this.props.colors}
              editOpt={this.props.editOpt}
            />
          </div>
        );

      } else if (graphOpts.type === "pie") {
        return(
          <div>
            <nav className="navbar navbar-expand-sm navbar-light bg-light edit-nav-tree-top">

            <div className="navbar-item edit-nav-tree-top-product">{this.props.graphEditing[0].product}</div>

            <div className="nav-item dropdown">

              <div className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown">
                {
                  this.props.opt.optionEditing ?
                    <span className="opt-cat">{optCatFormatter(this.props.opt.optionEditing)}</span>
                  : <span className="opt-cat-beg">Edit</span>
                }
              </div>

              <div className="dropdown-menu">

                <div
                  className="dropdown-item"
                  data-id="value"
                  onClick={this.props.editGraphOpt.bind(this)}
                >Arc Value</div>

              </div>
            </div>

            <SaveGraph
              graphEditing={this.props.graphEditing}
              graphEditingSS={this.props.graphEditingSS}
              saveGraph={this.props.saveGraph}
            />

            </nav>
            <GraphOptChooser
              opt={this.props.opt}
              graphEditing={this.props.graphEditing}
              colors={this.props.colors}
              editOpt={this.props.editOpt}
            />
          </div>
        );
      }

  }
};

class GraphOptChooser extends React.Component {
  render() {
    var graphOpts = Object.assign({}, this.props.graphEditing.slice(0,1)[0]);
    var formatter = (opt) => {
      var formatted = {
        clicks: "Clicks",
        imps: "Impressions",
        ctr: "Click-Through Rate",
        cpc: "Cost Per Click",
        cost: "Cost",
        completeViews: "Complete Views",
        cvtr: "Complete View Rate",
        cpcv: "Cost Per Complete View",
        none: "None"
      };
      if (formatted[opt]) {
        return formatted[opt];
      } else {
        return opt;
      }
    };
    if (this.props.opt === "") {
      return null;
    } else {
      // navClasses.push("show");
      // colorNavClasses.push("show");
      var opt = Object.assign({}, this.props.opt);
      if (opt.optionEditing === "y_axis_one" || opt.optionEditing === "y_axis_two") {

        var mapped = opt.optionOptions.map((option) => {

          if (graphOpts[opt.optionEditing] === option) {
            return(
              <div
                className="nav-link nav-item active edit-nav-choose-opt edit-nav-graph-div"
                onClick={this.props.editOpt.bind(this)}
                data-id={opt.optionEditing + " " + option}
              >{formatter(option)}</div>
            );
          } else {
            return(
              <div
                className="nav-link nav-item edit-nav-choose-opt edit-nav-graph-div"
                onClick={this.props.editOpt.bind(this)}
                data-id={opt.optionEditing + " " + option}
              >{formatter(option)}</div>
            );
          }
        });

        return (
          <nav className="navbar navbar-expand-lg navbar-light bg-light edit-nav-tree-two">
            <div className="navbar-nav">
              {mapped}
            </div>
          </nav>
        );

      } else if (opt.optionEditing === "color_one" || opt.optionEditing === "color_two") {

        mapped = opt.optionOptions.map((option) => {

          if (graphOpts[opt.optionEditing] === option) {
            return(
              <div
                className="active col color-wheel"
                onClick={this.props.editOpt.bind(this)}
                data-id={opt.optionEditing + " " + option}
                style={{
                  background: option,
                  height: 30,
                  borderBottom: "2px solid black"
                }}
              >
              </div>
            );
          } else {
            return(
              <div
                className="col color-wheel"
                onClick={this.props.editOpt.bind(this)}
                data-id={opt.optionEditing + " " + option}
                style={{
                  background: option,
                  height: 30
                }}
              >
              </div>
            );
          }
        });
        return (
          <div className="row no-gutters opts-two edit-nav-opts">
            {mapped}
          </div>
        );
      } else if (opt.optionEditing === "value") {

        mapped = opt.optionOptions.map((option) => {

          if (graphOpts[opt.optionEditing] === option) {
            return(
              <div
                className="nav-link nav-item active edit-nav-choose-opt edit-nav-graph-div"
                onClick={this.props.editOpt.bind(this)}
                data-id={opt.optionEditing + " " + option}
              >{formatter(option)}</div>
            );
          } else {
            return(
              <div
                className="nav-link nav-item edit-nav-choose-opt edit-nav-graph-div"
                onClick={this.props.editOpt.bind(this)}
                data-id={opt.optionEditing + " " + option}
              >{formatter(option)}</div>
            );
          }

        });

        return (
          <nav className="navbar navbar-expand-lg navbar-light bg-light edit-nav-tree-two">
            <div className="navbar-nav">
              {mapped}
            </div>
          </nav>
        );

      }

    }
  }
}

class SaveGraph extends React.Component {
  render() {
    if (JSON.stringify(this.props.graphEditing[0]) !== JSON.stringify(this.props.graphEditingSS[0])) {
      return(
        <div className="navbar-nav">
          <div className="nav-item">
            <button
              className="btn btn-outline-success btn-sm edit-graph-save-btn"
              data-id="save"
              onClick={this.props.saveGraph.bind(this)}
            >Save</button>
          </div>
          <div className="nav-item">
            <button
              className="btn btn-outline-danger btn-sm edit-graph-cancel-btn"
              data-id="cancel"
              onClick={this.props.saveGraph.bind(this)}
            >Cancel</button>
          </div>
        </div>
      );
    } else {
      return(
        <div className="navbar-nav">
          <div className="nav-item">
            <button
              className="btn btn-outline-danger btn-sm edit-graph-cancel-btn"
              data-id="cancel"
              onClick={this.props.saveGraph.bind(this)}
            >Cancel</button>
          </div>
        </div>
      );
    }
  }
};

class Dashboard extends React.Component {
  render() {
    return (
      <div>
        <DashNav
          add={this.props.add}
          data={this.props.data}
          activeData={this.props.activeData}
          graphs={this.props.graphs}
          addGraph={this.props.addGraph}
          changeDate={this.props.changeDate}
          date={this.props.date}
        />
        <div className="graphs">
          <Graphs
            data={this.props.data}
            activeData={this.props.activeData}
            graphs={this.props.graphs}
            graphCreator={this.props.graphCreator}
            dBoardStatus={this.props.dBoardStatus}
            editGraph={this.props.editGraph}
            graphEditing={this.props.graphEditing}
            colors={this.props.colors}
            parent={this.constructor.name}
            deleteGraph={this.props.deleteGraph}
            date={this.props.date}
          />
        </div>
      </div>
    );
  }
}

class DashNav extends React.Component {

  render() {
    var clientInd;
    for (var i = 0; i < this.props.data.length; i++) {
      if (this.props.data[i].company === this.props.activeData) {
        clientInd = i;
        break;
      }
    }
    var products = (Object.keys(this.props.graphs)).map((prod) => {
      return(
        <div className="dropdown-item prod-drop-item" data-id={prod} onClick={this.props.add.bind(this)}>{prod}</div>
      );
    });
    var parseDate = (date) => {
      var months = {
        Jan: "1",
        Feb: "2",
        Mar: "3",
        Apr: "4",
        May: "5",
        Jun: "6",
        Jul: "7",
        Aug: "8",
        Sep: "9",
        Oct: "10",
        Nov: "11",
        Dec: "12"
      };
      var deepDate = new Date(JSON.parse(JSON.stringify(date))).toString().split(" ");
      var month = months[deepDate[1]];
      var day = function(myDay) {
        if (myDay[0] === 0) {
          return myDay[1];
        } else return myDay;
      }
      var year = deepDate[3].slice(2,4);
      return month + "/" + day(deepDate[2]) + "/" + year;
    };
    var date = Object.assign({}, this.props.date);
    var possibleRange = date.possibleRange.slice();
    possibleRange = possibleRange.map(function(date) {
      return new Date(JSON.parse(JSON.stringify(date)));
    });

    var dateRange = possibleRange.map((myDate) => {
      var parsedDate = parseDate(myDate);
      return(
        <div className="dropdown-item date-drop-item" data-id={parsedDate} onClick={this.props.changeDate.bind(this)}>{parsedDate}</div>
      );
    });
    return (
      <div className="dash-navs-cont sticky-top">
        <nav className="navbar navbar-expand-md navbar-light dash-nav">
          <div className="navbar-brand">{this.props.activeData}</div>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarSupportedContent"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">

            <div className="navbar-nav">
              <div className="nav-item dropdown">
                <div
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  data-toggle="dropdown"
                >
                  Add Graph
                </div>
                <div className="dropdown-menu">
                  {products}
                </div>
              </div>
              <div className="navbar-nav">
                <div className="nav-item dropdown">
                  <div className="nav-link dropdown-toggle" href="#" id="navbarDropdown" data-toggle="dropdown">
                    Start: {parseDate(this.props.data[clientInd].displayedDateRange[0])}
                  </div>
                  <div className="dropdown-menu min-date">
                    {dateRange}
                  </div>
                </div>
              </div>
              <div className="navbar-nav">
                <div className="nav-item dropdown">
                  <div className="nav-link dropdown-toggle" href="#" id="navbarDropdown" data-toggle="dropdown">
                    End: {parseDate(this.props.data[clientInd].displayedDateRange[this.props.data[clientInd].displayedDateRange.length-1])}
                  </div>
                  <div className="dropdown-menu max-date">
                    {dateRange}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </nav>
        <AddChooseGraph
          graphs={this.props.graphs}
          addGraph={this.props.addGraph}
          add={this.props.add}
        />
      </div>
    );
  }
}

class AddChooseGraph extends React.Component {
  render() {
    var graphOpts;
    if (this.props.addGraph.stage === "chooseGraph") {
      if (
        this.props.addGraph.product === "SEM" ||
        this.props.addGraph.product === "Programmatic Display" ||
        this.props.addGraph.product === "Display Retargeting"
      ) {
        graphOpts = ["Bar Graph", "Line Graph", "Pie Graph"];
      } else {
        graphOpts = ["Bar Graph", "Line Graph"];
      }
      const graphsMapped = graphOpts.map((graph) => {
        return (
          <div
            className="nav-link edit-nav-graph-div"
            data-id={graph}
            onClick={this.props.add.bind(this)}
          >
            {graph}
          </div>
        );
      });
      return (
        <nav className="navbar navbar-expand-sm navbar-light edit-nav">
          <div className="nav-link edit-nav-add-div" style={{ fontWeight: "bold" }}>Add: </div>
          {graphsMapped}
          <div className="nav-item">
            <button
              className="btn btn-outline-danger btn-sm edit-graph-cancel-btn"
              data-id="cancel-graph-type"
              onClick={this.props.add.bind(this)}
            >Cancel</button>
          </div>
        </nav>
      );
    } else return null;
  }
}

class Graphs extends React.Component {
  constructor(props) {
    super(props);
    this.graphCreator = this.graphCreator.bind(this);
  }

  componentDidMount() {
   this.graphCreator();
  }

  componentDidUpdate(prevProps) {
    if (this.props.dBoardStatus === "display") {
      this.graphCreator();
    } else if (this.props.dBoardStatus === "editingGraph") {
      if (this.props.parent !== "Dashboard") {
        this.graphCreator();
      }
    }
  }

  graphCreator() {

    d3.selectAll(".svg-cont").remove();
    d3.selectAll(".product-charts-title").remove();

    var w = 750;
    var h = 500;

    var pad = { top: 30, right: 130, bottom: 100, left: 130 };
    var data = this.props.data.slice();
    var currentClient;
    var currentClientProducts;
    var graphs;

    if (this.props.dBoardStatus === "editingGraph") {
      currentClientProducts = [this.props.graphEditing.slice(0,1)[0].product];
      graphs = {};
      graphs[currentClientProducts] = this.props.graphEditing.slice();
    } else if (this.props.dBoardStatus === "display") {
      graphs = Object.assign({}, this.props.graphs);
    }

    var i;
    for (i = 0; i < data.length; i++) {
      if (data[i].company === this.props.activeData) {
        currentClient = data[i].company;
        if (this.props.dBoardStatus === "display") {
          currentClientProducts = Object.keys(data[i].productStats);
        }
        break;
      }
    }

    // var dateObj = Object.assign({}, this.props.date);
    // var displayedDates = dateObj.displayedRange.slice();
    //var displayedDates = this.props.date.displayedRange.slice();

    var getDateString = function(dateObj) {
      var months = {
        Jan: "1",
        Feb: "2",
        Mar: "3",
        Apr: "4",
        May: "5",
        Jun: "6",
        Jul: "7",
        Aug: "8",
        Sep: "9",
        Oct: "10",
        Nov: "11",
        Dec: "12"
      };
      dateObj = dateObj.toString().split(" ");
      var m = months[dateObj[1]];
      var d = dateObj[2];
      var y = dateObj[3];
      return m + "/" + d + "/" + y;
    }

    var displayedDates = data[i].displayedDateRange.slice().map(getDateString);

    var statsToDisplay = Object.assign({}, data[i].productStats);
    currentClientProducts.forEach(function(myProd) {
      var currProdStats = statsToDisplay[myProd].slice();
      currProdStats = currProdStats.filter(function(dayStats) {
        var currDateString = getDateString(dayStats.date);
        return displayedDates.includes(currDateString);
      });
      statsToDisplay[myProd] = currProdStats.slice();
    });


    var labeler = function(str) {
      var labels = {
        clicks: "Clicks",
        imps: "Impressions",
        date: "Date",
        completeViews: "Complete Views",
        cpc: "Cost Per Click",
        ctr: "Click-Through Rate",
        cpcv: "Cost Per Complete View",
        cvtr: "Complete View Rate",
        keywordStats: "Keyword",
        adSizeStats: "Ad Size",
        cost: "Cost"
      };
      if (labels.hasOwnProperty(str)) {
        str = labels[str];
        return str;
      } else {
        return str;
      }
    }
    var ttFormatted = function(d, toChange) {
      if (toChange === "ctr" || toChange === "cvtr") {
        return (d * 100).toFixed(2) + "%";
      } else if (toChange === "cpc" || toChange === "cpcv" || toChange === "cost") {
        return "$" + d.toFixed(2);
      } else if (toChange === "imps" || toChange === "clicks" || toChange === "completeViews") {
        d = d.toFixed(0)/1;
        if (d.toString().length > 3) {
          d = d.toString();
          var com = 0;
          for (var i = d.length-1; i >= 0; i--) {
          	com++;
          	if (com % 3 === 0) {
          		if (i !== 0) {
          			var left = d.slice(0, i);
          			var right = d.slice(i, d.length);
          			d = (left + "," + right).toString();
          		}
          	}
          }
          return d;
        } else {
          return d;
        }
      } else {
        return d;
      }
    };
    var dateFormatted = function(d, format) {

      var month = d.toString().split(" ")[1];
      var day = d.toString().split(" ")[2];
      if (day[0] === 0) {
        day = day.split(0)[1];
      }
      var year = d.toString().split(" ")[3];

      if (format === "mdy") {
        return month + " " + day + ", " + year;
      }
      return month + " " + day;

    };
    var tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("visibility", "hidden");
    function mousemove() {
      tooltip
        .style("top", d3.event.pageY - 50 + "px")
        .style("left", d3.event.pageX - 80 + "px");
    }
    function mouseout() {
      tooltip
        .style("visibility", "hidden")
        .selectAll("div")
        .remove();
    }

// All functions, outside of loop. Many used multiple times.
    var dXV = (d) => {
      return d[xValue]
    };
    var dYOneV = (d) => {
      return d[yValueOne];
    };
    var dYTwoV = (d) => {
      return d[yValueTwo];
    };
    var xScDX = (d) => {
      return xScale(d[xValue]);
    };
    var yOneScDYOne = (d) => {
      return yScaleOne(d[yValueOne]);
    };
    var yOneScDYTwo = (d) => {
      return yScaleTwo(d[yValueTwo]);
    };

    var yOneTick = (d) => {
      var myValue = yValueOne;
      return ttFormatted(d, myValue);
    };

    var yTwoTick = (d) => {
      var myValue = yValueTwo;
      return ttFormatted(d, myValue);
    };
    var barOneXVals = (d, ind) => {
      return (
        pad.left +
        (w - pad.right - pad.left) /
        statsToDisplay[product].length *
        ind +
        2
      );
    };
    var barOneWidths = (d, ind) => {
      return (
        (w - pad.right - pad.left) /
        statsToDisplay[product].length /
        2 -
        2
      );
    };
    var barOnlyOneWidths = (d, ind) => {
      return (
        (w - pad.right - pad.left) / statsToDisplay[product].length - 4
      );
    };
    var barOneHeights = (d) => {
      return h - yScaleOne(d[yValueOne]) - pad.bottom;
    };
    var barTwoXVals = (d, ind) => {
      return (
        pad.left +
        (w - pad.right - pad.left) /
        statsToDisplay[product].length *
        ind +
        (w - pad.right - pad.left) /
        statsToDisplay[product].length /
        2
      );
    };
    var barTwoWidths = (d, ind) => {
      return (
        (w - pad.right - pad.left) /
        statsToDisplay[product].length /
        2 -
        2
      );
    };
    var barTwoHeights = (d) => {
      return h - yScaleTwo(d[yValueTwo]) - pad.bottom;
    };

    var barMouseover = function(d) {
      var myValue = this.getAttribute("data-id").split(" ")[1];
      tooltip
        .style("top", d3.event.pageY - 50 + "px")
        .style("left", d3.event.pageX - 80 + "px");

      tooltip
        .style("visibility", "visible")
        .append("div")
        .text(
          labeler(d3.select(this).attr("class").split(" ")[1]) +
          ": " +
          ttFormatted(d[d3.select(this).attr("class").split(" ")[1]],myValue)
        );
      tooltip.append("div").text(
        labeler(
          d3
            .select(this)
            .attr("class")
            .split(" ")[0]
        ) +
          ": " +
          dateFormatted(
            d[
              d3
                .select(this)
                .attr("class")
                .split(" ")[0]
            ],
            "mdy"
          )
      );
    };

    var lineMouseover = function(d) {
      var color = this.getAttribute("data-id").split(" ")[3];
      var myValue = this.getAttribute("data-id").split(" ")[1];
      // alert(this.getAttribute("data-id"));
      d3
        .select(this)
        .transition()
        .duration(300)
        .attr("r", 7)
        .style("fill", color);
      tooltip
        .style("top", d3.event.pageY - 50 + "px")
        .style("left", d3.event.pageX - 80 + "px");

      tooltip
        .style("visibility", "visible")
        .append("div")
        .text(
          labeler(d3.select(this).attr("class").split(" ")[1]) +
          ": " +
          ttFormatted(d[d3.select(this).attr("class").split(" ")[1]],myValue)
        );
      tooltip.append("div").text(
        labeler(
          d3
            .select(this)
            .attr("class")
            .split(" ")[0]
        ) +
          ": " +
          dateFormatted(
            d[
              d3
                .select(this)
                .attr("class")
                .split(" ")[0]
            ],
            "mdy"
          )
      );
    };

    var pieMouseover = function(d,i) {
      var myKey = d.data.key;
      var myValue = this.getAttribute("class").split(" ")[1];
      tooltip
        .style("top", d3.event.pageY - 50 + "px")
        .style("left", d3.event.pageX - 80 + "px");

      tooltip
        .style("visibility", "visible")
        .append("div")
        .text(
          labeler(
            d3
              .select(this)
              .attr("class")
              .split(" ")[0]
          ) +
            ": " +
            //arrayForPie[i].key
            myKey
        );
      tooltip.append("div").text(
        labeler(
          d3
            .select(this)
            .attr("class")
            .split(" ")[1]
        ) +
          ": " +
          //d.value
          ttFormatted(d.value,myValue)
      );
    }

    var lineMouseout = function() {
      mouseout();
      d3
        .select(this)
        .transition()
        .duration(300)
        .attr("r", 4)
        .style("fill", "#fff");
    }
    var arcFill = (d, ind) => {
      return arrayForPie[ind].color;
    }
    var arcText = function(d, ind) {
      var myValue = d.value;
      var totalPieValue = this.getAttribute("class").split(" ")[2];
      if ((myValue/1)/(totalPieValue/1) < 0.04) {
       return;
      } else {
        return ttFormatted(arrayForPie[ind].value,this.getAttribute("class").split(" ")[1]);
      }
    }

    var arcPlacement = (d) => {
      return "translate(" + arc.centroid(d) + ")";
    }
    //switched from arrow func when making on y axis possible
    var axesAndLabels = function() {
      svg
        .append("g")
        .call(xAxis)
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (h - pad.bottom) + ")")
        .selectAll("text")
        .attr(
          "transform",
          "rotate(" + 270 + ") translate(" + -10 + "," + -12 + ")"
        )
        .attr("text-anchor", "end");
      svg
        .append("g")
        .call(yAxisOne)
        .attr("class", "left-y-axis")
        .attr("transform", "translate(" + pad.left + ",0)");

      if (arguments[0] !== "no") {
        svg
          .append("g")
          .call(yAxisTwo)
          .attr("class", "right-y-axis")
          .attr("transform", "translate(" + (w - pad.right) + ",0)");
      }

      svg
        .append("text")
        .text(labeler(xValue))
        .attr("class", "x-axis-label")
        .attr("transform", "translate(" + w / 2 + "," + h + ")");
      svg
        .append("text")
        .text(labeler(yValueOne))
        .attr("class", "left-y-axis-label")
        .attr(
          "transform",
          "translate(" + pad.left / 4 + "," + h / 2 + ") rotate(270)"
        );

      if (arguments[0] !== "no") {
        svg
          .append("text")
          .text(labeler(yValueTwo))
          .attr("class", "right-y-axis-label")
          .attr(
            "transform",
            "translate(" + (w - pad.right / 4) + "," + h / 2 + ") rotate(90)"
          );
      }

    }

    var editG = (type) => {

      if (this.props.dBoardStatus === "editingGraph") {
        return;
      } else if (this.props.dBoardStatus === "display") {

        var xAlignStart = 130;

        var editGCont = svg
          .append("svg")
          .attr("class", "edit-g-cont")
          .attr("data-id", document.getElementsByClassName("edit-g-cont").length - 1)
          .attr("fill", "#fff")
          .attr("height", 24)
          .attr("width", 24)
          .attr("viewBox", "0 0 24 24")
          .attr("x", w - xAlignStart)
          .style("shape-rendering", "crispEdges");
        editGCont
          .append("rect")
          .attr("class", "edit-g-rect")
          .attr("fill", "#fff")
          .attr("height", 24)
          .attr("width", 24)
          .attr("transform", "translate(" + (w - xAlignStart) + ",0)")
        editGCont
          .append("path")
          .attr("class", "edit-g")
          .attr("d", "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z");
        editGCont
          .append("path")
          .attr("d", "M0 0h24v24H0z")
          .attr("fill", "none");

        var deleteGCont = svg
          .append("svg")
          .attr("class", "delete-g-cont")
          .attr("data-id", document.getElementsByClassName("delete-g-cont").length - 1)
          .attr("fill", "#fff")
          .attr("height", 24)
          .attr("width", 24)
          .attr("viewBox", "0 0 24 24")
          .attr("x", w - 106)
          .style("shape-rendering", "crispEdges");
        deleteGCont
          .append("rect")
          .attr("class", "delete-g-rect")
          .attr("fill", "#fff")
          .attr("height", 24)
          .attr("width", 24)
          .attr("transform", "translate(" + w - (xAlignStart - 24) + ",0)")
        deleteGCont
          .append("path")
          .attr("class", "delete-g")
          .attr("d", "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z");
        deleteGCont
          .append("path")
          .attr("d", "M0 0h24v24H0z")
          .attr("fill", "none");
      }

    }

    var colorOne;
    var colorTwo;

    for (var q = 0; q < currentClientProducts.length; q++) {

      var product = currentClientProducts[q];

      for (var qq = 0; qq < graphs[product].length; qq++) {
        if (qq === 0) {
          if (q === 0) {
            d3.selectAll(".product-charts-title").remove();
          }
          if (this.props.dBoardStatus === "display") {
              d3
                .select(".all-graphs")
                .append("div")
                .attr("class", "product-charts-title col-12")
                .style("padding-left", "5%")
                .text(labeler(product));
          }
        }

        if (graphs[product][qq].type === "bar") {

          var xValue = graphs[product][qq].x_axis;
          var yValueOne = graphs[product][qq].y_axis_one;

          colorOne = graphs[product][qq].color_one;


          var xScale = d3
            .scaleBand()
            .domain(
              statsToDisplay[product].map(dXV)
            )
            .range([pad.left, w - pad.right]);
          var xAxis = d3
            .axisBottom()
            .scale(xScale)
            .tickFormat(function(d) {
              return dateFormatted(d);
            });

          var yScaleOne = d3
            .scaleLinear()
            .domain([
              d3.min(statsToDisplay[product], dYOneV) * 0.9,
              d3.max(statsToDisplay[product], dYOneV) * 1.03
            ])
            .range([h - pad.bottom, pad.top]);

          var yAxisOne = d3
            .axisLeft()
            .scale(yScaleOne)
            .tickFormat(yOneTick);


          if (graphs[product][qq].y_axis_two) {
            var yValueTwo = graphs[product][qq].y_axis_two;
            colorTwo = graphs[product][qq].color_two;
            var yScaleTwo = d3
              .scaleLinear()
              .domain([
                d3.min(statsToDisplay[product], dYTwoV) * 0.9,
                d3.max(statsToDisplay[product], dYTwoV) * 1.03
              ])
              .range([h - pad.bottom, pad.top]);
            var yAxisTwo = d3
              .axisRight()
              .scale(yScaleTwo)
              .tickFormat(yTwoTick);
          }

          var svg = d3
            .select(".all-graphs")
            .append("div")
            .attr(
              "class",
              "svg-cont " + currentClient + " " + product + "-" + qq + "-graph"
            )
            .style("display", "inline-block")
            .style("position", "relative")
            .style("width", "100%")
            //.style("padding-bottom", h / w * 100 + "%")
            .style("vertical-align", "top")
            .style("overflow", "hidden")
            .append("svg")
            .attr("data-id", document.getElementsByTagName("svg").length - 1)
            .attr(
              "class", function() {
                if (graphs[product][qq].y_axis_two) {
                  return currentClient + " " + product + " " + xValue + " " + yValueOne + " " + yValueTwo
                } else {
                  return currentClient + " " + product + " " + xValue + " " + yValueOne
                }
              }
            )
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + w + " " + h)
            .style("display", "inline-block")
            .style("position", "absolute")
            // .style("margin-left", 20 + "px")
            // .style("margin-right", 20 + "px")
            .style("top", 0)
            .style("left", 0);

            if (graphs[product][qq].y_axis_two) {
              axesAndLabels();
            } else {
              axesAndLabels("no");
            }

          svg
            .selectAll(".bar-one")
            .data(statsToDisplay[product])
            .enter()
            .append("rect")
            .attr("class", xValue + " " + yValueOne + " bar-one")
            .attr("data-id", xValue + " " + yValueOne + " bar-one")
            .style("fill", colorOne)
            .attr("x", barOneXVals)
            .attr("width", function(d, ind) {
              if (graphs[product][qq].y_axis_two) {
                return barOneWidths();
              } else {
                return barOnlyOneWidths();
              }
            })
            .attr("y", yOneScDYOne)
            .attr("height", barOneHeights)
            .on("mouseover", barMouseover)
            .on("mousemove", mousemove)
            .on("mouseout", mouseout);

            //BELOW is end of above function that makes bar-one's heights transition on append.
              // .attr("width", function(d, ind) {
              //   if (graphs[product][qq].y_axis_two) {
              //     return barOneWidths();
              //   } else {
              //     return barOnlyOneWidths();
              //   }
              // })
              // .attr("y", getDiffs)
              // .transition()
              // .duration(800)
              // .attr("y", yOneScDYOne)
              // .attr("height", barOneHeights);


          if (graphs[product][qq].y_axis_two) {

            svg
              .selectAll(".bar-two")
              .data(statsToDisplay[product])
              .enter()
              .append("rect")
              .attr("class", xValue + " " + yValueTwo + " bar-two")
              .attr("data-id", xValue + " " + yValueTwo + " bar-two")
              .attr("x", barTwoXVals)
              .attr("y", yOneScDYTwo)
              .attr("width", barTwoWidths)
              .attr("height", barTwoHeights)
              .style("fill", colorTwo)
              .on("mouseover", barMouseover)
              .on("mousemove", mousemove)
              .on("mouseout", mouseout);

          }

            editG("bar");


        } else if (graphs[product][qq].type === "line") {


          xValue = graphs[product][qq].x_axis;
          yValueOne = graphs[product][qq].y_axis_one;
          colorOne = graphs[product][qq].color_one;

          xScale = d3
            .scaleTime()
            .domain([
              d3.min(statsToDisplay[product], dXV),
              d3.max(statsToDisplay[product], dXV)
            ])
            .range([pad.left, w - pad.right]);
          xAxis = d3
            .axisBottom()
            .scale(xScale)
            .tickFormat(function(d) {
              return dateFormatted(d);
            });

          yScaleOne = d3
            .scaleLinear()
            .domain([
              d3.min(statsToDisplay[product], dYOneV) * 0.9,
              d3.max(statsToDisplay[product], dYOneV) * 1.03
            ])
            .range([h - pad.bottom, pad.top]);

          yAxisOne = d3
            .axisLeft()
            .scale(yScaleOne)
            .tickFormat(yOneTick);

            if (graphs[product][qq].y_axis_two) {

              yValueTwo = graphs[product][qq].y_axis_two;
              colorTwo = graphs[product][qq].color_two;

              yScaleTwo = d3
                .scaleLinear()
                .domain([
                  d3.min(statsToDisplay[product], dYTwoV) * 0.9,
                  d3.max(statsToDisplay[product], dYTwoV) * 1.03
                ])
                .range([h - pad.bottom, pad.top]);
              yAxisTwo = d3
                .axisRight()
                .scale(yScaleTwo)
                .tickFormat(yTwoTick);

            }


          svg = d3
            .select(".all-graphs")
            .append("div")
            .attr(
              "class",
              "svg-cont " + currentClient + " " + product + "-" + qq + "-graph"
            )
            .style("display", "inline-block")
            .style("position", "relative")
            .style("width", "100%")
            //.style("padding-bottom", h / w * 100 + "%")
            .style("vertical-align", "top")
            .style("overflow", "hidden")
            .append("svg")
            .attr("data-id", document.getElementsByTagName("svg").length - 1)
            .attr(
              "class",
              currentClient +
                " " +
                product +
                " " +
                xValue +
                " " +
                yValueOne +
                " " +
                yValueTwo
            )
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + w + " " + h)
            // .style("margin-left", 20 + "px")
            // .style("margin-right", 20 + "px")
            .style("display", "inline-block")
            .style("position", "absolute")
            .style("top", 0)
            .style("left", 0);


            if (graphs[product][qq].y_axis_two) {
              axesAndLabels();
            } else {
              axesAndLabels("no");
            }


          var lineOne = d3
            .line()
            .x(xScDX)
            .y(yOneScDYOne);

          svg
            .append("path")
            .datum(statsToDisplay[product])
            .attr(
              "class",
              product + " " + xValue + " " + yValueOne + " line line-one"
            )
            .attr("d", lineOne)
            .style("fill", "none")
            .style("stroke", colorOne)
            .style("stroke-width", 1 + "px");

          svg
            .selectAll(".line-circ-one")
            .data(statsToDisplay[product])
            .enter()
            .append("circle")
            .attr("class", xValue + " " + yValueOne + " line-circ-one")
            .attr("data-id", xValue + " " + yValueOne + " line-circ-one " + colorOne)
            .attr("cx", xScDX)
            .attr("cy", yOneScDYOne)
            .attr("r", 4)
            .style("fill", "#fff")
            .style("stroke", colorOne)
            .style("stroke-width", 1 + "px")
            .on("mouseover", lineMouseover)
            .on("mousemove", mousemove)
            .on("mouseout", lineMouseout);


          if (graphs[product][qq].y_axis_two) {

            var lineTwo = d3
              .line()
              .x(xScDX)
              .y(yOneScDYTwo);

            svg
              .append("path")
              .datum(statsToDisplay[product])
              .attr("class", xValue + " " + yValueTwo + " line line-two")
              .attr("d", lineTwo)
              .style("fill", "none")
              .style("stroke", colorTwo)
              .style("stroke-width", 1 + "px");

            svg
              .selectAll(".line-circ-two")
              .data(statsToDisplay[product])
              .enter()
              .append("circle")
              .attr("class", xValue + " " + yValueTwo + " line-circ-two")
              .attr("data-id", xValue + " " + yValueTwo + " line-circ-two " + colorTwo)
              .attr("cx", xScDX)
              .attr("cy", yOneScDYTwo)
              .attr("r", 4)
              .style("fill", "#fff")
              .style("stroke", colorTwo)
              .style("stroke-width", 1 + "px")
              .on("mouseover", lineMouseover)
              .on("mousemove", mousemove)
              .on("mouseout", lineMouseout);

          }



            editG("line");

        } else if (graphs[product][qq].type === "pie") {
          //if (product === "SEM") {

            var singularKeys = {
              keywordStats: "keyword",
              adSizeStats: "adSize"
            };


            var singularKey = singularKeys[graphs[product][qq].key];
            var pieKey = graphs[product][qq].key;
            var pieValue = graphs[product][qq].value;
            // alert("Product: " + product); SEM/Programmatic Display
            // alert("pieKey: " + pieKey); //keywordStats/adSizeStats
            // alert("pieValue: " + pieValue); clicks

            var pieKeyAll = Object.values(
              statsToDisplay[product][0][pieKey]
            );
            var pieKeyAllObj = {};
            for (var dd = 0; dd < pieKeyAll.length; dd++) {
              pieKeyAllObj[pieKeyAll[dd][singularKey]] = 0;
            }
            var dateRange = statsToDisplay[product].length;
            for (var ddd = 0; ddd < dateRange; ddd++) {
              for (var dddd = 0; dddd < pieKeyAll.length; dddd++) {
                var theCurrentKeyAndValue = statsToDisplay[product][ddd][pieKey][dddd];
                pieKeyAllObj[theCurrentKeyAndValue[singularKey]] += theCurrentKeyAndValue[pieValue];
              }
            }
            //alert(JSON.stringify(pieKeyAllObj)); one object. for sem, keywords are keys and clicks/imps/cost for each over entire date range are vals.

            var arrayForPie = [];
            var pieColors = graphs[product][qq].pie_colors;

            for (var objSortI = 0; objSortI < Object.keys(pieKeyAllObj).length; objSortI++) {
              var objToAddToPie = {
                key: Object.keys(pieKeyAllObj)[objSortI],
                value: Object.values(pieKeyAllObj)[objSortI],
                color: pieColors[objSortI]
              };
              arrayForPie.push(objToAddToPie);
            }

            var outerRadius = w / 4;
            var innerRadius = w / 8;
            var pie = d3.pie().value(function(d) {
              return d.value;
            });
            var arc = d3
              .arc()
              .innerRadius(innerRadius)
              .outerRadius(outerRadius);

            svg = d3
              .select(".all-graphs")
              .append("div")
              .attr("class", "svg-cont " + product + "-" + qq + "-graph")
              .style("display", "inline-block")
              .style("position", "relative")
              .style("width", "100%")
              //.style("padding-bottom", "68%")
              .style("vertical-align", "top")
              .style("overflow", "hidden")
              .append("svg")
              .attr("data-id", document.getElementsByTagName("svg").length - 1)
              .attr(
                "class",
                currentClient +
                  " " +
                  product +
                  " " +
                  xValue +
                  " " +
                  yValueOne +
                  " " +
                  yValueTwo
              )
              .attr("preserveAspectRatio", "xMinYMin meet")
              .attr("viewBox", "0 0 " + w + " " + h)
              // .style("margin-left", 20 + "px")
              // .style("margin-right", 20 + "px")
              .style("display", "inline-block")
              .style("position", "absolute")
              .style("top", 0)
              .style("left", 0);

            var arcs = svg
              .selectAll(".arc")
              .data(pie(arrayForPie))
              .enter()
              .append("g")
              .attr("class", pieKey + " " + pieValue + " arc")
              .attr(
                "transform",
                "translate(" +
                  outerRadius * 2 +
                  "," +
                  outerRadius * 2 * (h / w) +
                  ")"
              );

            arcs
              .append("path")
              .attr("class", pieKey + " " + pieValue + " arc-path")
              .attr("fill", arcFill)
              .attr("d", arc)
              .on("mouseover", pieMouseover)
              .on("mousemove", mousemove)
              .on("mouseout", mouseout);

              var totalPieValue = 0;
              for (var v = 0; v < arrayForPie.length; v++) {
                totalPieValue += arrayForPie[v].value;
              }
              totalPieValue = totalPieValue.toString();

            arcs
              .append("text")
              .attr("class", "arc-text " + pieValue + " " + totalPieValue)
              .attr("transform", arcPlacement)
              .attr("text-anchor", "middle")
              .text(arcText)
              .style("font-family", "Arial")
              .style("font-size", 11 + "px")
              .style("fill", "white");
            svg
              .append("text")
              .attr("class", "pie-label")
              .text(labeler(pieValue) + " by \n" + labeler(pieKey))
              .attr("transform", "translate(" + w / 2 + "," + w / 20 + ")");

            editG("pie");

          //}
        }
      }
    }

    if (this.props.dBoardStatus === "display") {
      // $("svg").on("click", this.props.editGraph.bind(this));
      $(".edit-g-cont").on("click", this.props.editGraph.bind(this));
      $(".delete-g-cont").on("click", this.props.deleteGraph.bind(this));
    }
  }

  render() {
    return (
      <div>
        <div
          ref={elem => {
            this.svgCont = elem;
          }}
          className="all-graphs"
        />
      </div>
    );
  }
}

class Panel extends React.Component {

  render() {
    const clients = this.props.data.map((client, index) => {
      if (this.props.activeData === client.company) {
        return (
          <div className="client active py-2 px-3" data-id={index}>
            {client.company}
          </div>
        );
      } else {
        return (
          <div
            className="client py-2 px-3"
            onClick={this.props.changeClient.bind(this)}
            data-id={index}
          >
            {client.company}
          </div>
        );
      }
    });
    return <div>{clients}</div>;
  }
}

class Nav extends React.Component {

  render() {

    const clients = this.props.data.map((client, index) => {
      if (this.props.activeData === client.company) {
        return (
          <a
            className="dropdown-item client-top active"
            onClick={this.props.changeClient.bind(this)}
            data-id={index}
          >{client.company}</a>
        );
      } else {
        return (
          <a
            className="dropdown-item client-top"
            onClick={this.props.changeClient.bind(this)}
            data-id={index}
          >{client.company}</a>
        );
      }
    });

    return (
      <div>
        <nav className="top-nav navbar navbar-expand-md navbar-light top-color">
          <div className="navbar-brand top-nav-text">Client Dashboards</div>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#topNavbarSupportedContent">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="topNavbarSupportedContent">
            <div className="navbar-nav mr-auto top-nav-drop">
              <div className="nav-item dropdown top-nav-drop">
                <a className="nav-link dropdown-toggle" id="topNavbarDropdown" role="button" data-toggle="dropdown">
                  Client
                </a>
                <div className="dropdown-menu">
                  {clients}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

export default Encompasser
