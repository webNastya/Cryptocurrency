const lineChart = Vue.component('line-chart', {
    extends: VueChartJs.Line,
    data() {
        return {
            allDates: []
        }
    },
    mounted() {
        this.fillDate();
        for (let i = 0; i < this.allDates.length; i++) {
            axios
                .get('https://api.coingecko.com/api/v3/coins/bitcoin/history?date=' + this.allDates[i])
                .then(response => {
                    this.$root.$data.btcPriceDay[i] = Math.round(response.data.market_data.current_price.usd);
                    this.$data._chart.update()
            });
            axios
                .get('https://api.coingecko.com/api/v3/coins/ethereum/history?date=' + this.allDates[i])
                .then(response => {
                    this.$root.$data.ethPriceDay[i] = Math.round(response.data.market_data.current_price.usd);
                    this.$data._chart.update()
            });
        }
        this.renderChart(
        {
            labels: this.allDates,
            datasets: [
                {
                    label: 'Bitcoin',
                    borderColor: '#f87979', 
                    data: this.$root.$data.btcPriceDay
                },
                {
                    label: 'Ethereum',
                    borderColor: '#000',
                    data: this.$root.$data.ethPriceDay
                }
            ]
        }, 
        {
            responsive: true, 
            maintainAspectRatio: false
        });
        
    },
    methods: {
        fillDate: function () {
            for (let day = 0; day < 14; day++) {
                this.allDates.push(moment().subtract(day, 'days').format('DD-MM-YYYY'));
            }
            this.allDates.reverse();
        }
    }
});

new Vue({
    el: '#app',
    data: {
        BTC: null,
        ETH: null,
        USD: 1,
        total: null,
        value: null,
        first: "BTC",
        second: "USD",
        btcPriceDay: [],
        ethPriceDay: [],
        mainWallet: {
            "USD": 60000,
            "BTC": 1,
            "ETH": 5
        },
        tabsIsActive: {
            buy: true,
            sell: false
        },
        sum: null,
        difference: null,
        change1: "BTC",
        change2: "BTC",
        priceSum: 0,
        priceDif: 0,
        resultSum: 0,
        resultDif: 0,
        disabledSum: true,
        disabledDif: true,
        renderChart: false,
        plot: [
            {
              value: 0,
              color: 'rgba(255,87,93,.77)',
              label: 'BTC',
              id: 1
            },
            {
              value: 30,
              color: '#CECECE',
              label: 'ETH',
              id: 2
            },
            {
              value: 0,
              color: '#6D6D6D',
              label: 'USD',
              id: 3
            }
          ]
    },

    mounted() {
        axios
            .get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum&vs_currencies=usd')
            .then(response => {
                    this.BTC = response.data.bitcoin.usd;
                    this.ETH = response.data.ethereum.usd;
                    // this.pieValue();
                });
                // this.renderLineChart();

    },
    methods: {
        calculate: function (name) {
            if(name=="value")
                this.total = (this.$data[this.first] * this.value / this.$data[this.second]).toFixed(2)
            else
                this.value = (this.$data[this.second] * this.total / this.$data[this.first].toFixed(2))

            this.total = this.total == 0 ? "" : this.total
            this.value = this.value == 0 ? "" : this.value
        },
        onlyNumber ($event) {
            let keyCode = ($event.keyCode ? $event.keyCode : $event.which);
            if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) { // 46 is dot
                $event.preventDefault();
            }
        },
        tabs: function(name){
             Object.keys(this.tabsIsActive).forEach(key => {
                this.tabsIsActive[key] = key===name ? true : false
                // this.tabsIsActive[key].style.border = '1px solid #000'
                console.log(key, this.tabsIsActive[key]);
            });
        },
        changeWallet(name){
            if (name=='sum') {
                this.priceSum  = (this.sum * this.$data[this.change1]).toFixed(2)
                this.resultSum = this.sum == "" || 0 ? 0 : this.mainWallet.USD - this.priceSum
                this.disabledSum = this.resultSum <= 0 || this.sum <= 0 || this.sum == ''
                console.log(this.sum);
            } else {
                this.priceDif = (this.difference * this.$data[this.change2]).toFixed(2)
                this.resultDif = this.difference == "" ? 0 : +this.mainWallet.USD + +this.priceDif
                this.disabledDif = this.difference <= 0 || this.difference == ''
            }
        },
        fianlWalletSum(){ 
            this.mainWallet.USD = this.resultSum

            if (this.change1 == 'BTC')
                this.mainWallet.BTC += +this.sum
            else
                this.mainWallet.ETH += +this.sum
                
            document.getElementById("pie-chart").__vue__.update()
        },
        fianlWalletDif(){
            this.mainWallet.USD = this.resultDif
            if (this.change1 == 'BTC')
                this.mainWallet.BTC -= +this.difference
            else
                this.mainWallet.ETH -= +this.difference
            document.getElementById("pie-chart").__vue__.update()

        },
    }
});

const pieChart = Vue.component('pie-chartjs', {
    extends: VueChartJs.Pie,
    data() {
        return {
            plot: []
        }
    },
    mounted(){
        this.update()
    },
    methods: {
        update: function(){
            this.pieValue()
            this.renderChart(
                {
                    labels: ["BTC", "ETH", "USD"],
                    datasets: [
                        {
                            backgroundColor: ["#41B883", "#E46651", "#00D8FF"],
                            data: this.plot
                        }
                    ]
                }, 
                {
                    responsive: true, 
                    maintainAspectRatio: false
                }
            )
        },
        pieValue: function (){
            let pieBtc = this.$parent.mainWallet.BTC * this.$parent.BTC,
                pieEth = this.$parent.mainWallet.ETH * this.$parent.ETH,
                pieUsd = this.$parent.mainWallet.USD,
                allPie = pieUsd + pieBtc + pieEth

            this.plot = [
                pieBtc.toFixed(2),
                pieEth.toFixed(2),
                pieUsd.toFixed(2)
            ]
        }
    }
});