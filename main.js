// axios.defaults.baseURL = 'http://www.ticketfly.com/api/events';
const fields = 'id,url,name,image.medium,ticketPurchaseUrl,ticketPrice,topLineInfo,eventStatus,eventStatusCode,venue.name,venue.url,venue.address1,venue.city,venue.postalCode,startDate,doorsDate,ageLimitCode';
const orgId = 1;
const TICKETFLY_LINK = "http://www.shareasale.com/r.cfm?B=234786&U=1493604&M=27601&urllink=";
const PORTAL_CITY = 'boston'.trim()
const DEBOUNCE_TIME = 700;
ELEMENT.locale(ELEMENT.lang.en)

function retryFailedRequest(err) {
    if (err.status !== 200 && err.config && !err.config.__isRetryRequest) {
        err.config.__isRetryRequest = true;
        return axios(err.config);
    }
    throw err;
}
axios.interceptors.response.use(undefined, retryFailedRequest);
Vue.prototype.$http = axios;


Vue.component('event', {
    name: 'event',
    props: ['ev'],
    data() {
        return { emptyImageurl: "http://www.ticketfly.com/wp-content/plugins/ticketfly-cms/images/no-image/no-image-medium1.png" };

    },
    computed: {
        eventImage() {
            try {
                return this.ev.image.medium.path;
            } catch (e) {
                return this.emptyImageurl;
            }
        },
        eventDate() {
            let result = {};
            if (this.ev.startDate) {
                result['day'] = moment(this.ev.startDate).format('dddd MMMM D, YYYY');
                result['show'] = moment(this.ev.startDate).format('h:mm A');
            }
            if (this.ev.doorsDate)
                result['doors'] = moment(this.ev.doorsDate).format('h:mm A');
            return result;
        },
        ticketPurchaseUrl() {
            return TICKETFLY_LINK + encodeURIComponent(this.ev.ticketPurchaseUrl.replace(/^https?:\/\//, '').replace(/^http?:\/\//, '')) + "&afftrack=" + encodeURIComponent(PORTAL_CITY)
        },
        allowedAge() {

            switch (this.ageLimitCode) {
                case 'OVER_21':
                    return '21+';
                case 'OVER_18':
                    return '18+';
                case 'ALL_AGES':
                default:
                    return 'All Ages';
            };
        },
        venueUrl() {
            if (!this.ev.venue.url)
                return "javascript:void(0);"
            return this.ev.venue.url
        }
    },

    template: `
			<li class="mDa" itemscope itemtype="http://schema.org/Event">
			   <div class="mDa-iN">
			      <div class="mDa-wPr"> <a class="bUi-tMb-wPr tMb-60 bUi-tMb-210 fLxiMgH">
			         <span class="bUi-tMb">
			         <span class="bUi-tMb-pRpL">
			         <span class="bUi-tMb-cLp">
			         <span class="bUi-tMb-cLp-iN">
			         <img class="mDa-oT"  :src="eventImage" :alt="ev.name" :title="ev.name">
			         <span class="vRtL-aLn">
			         </span>
			         </span>
			         </span>
			         </span>
			         </span>
			         </a> 
			      </div>
			      <div class="mDa-bDy" style="padding: 7px 15px;">
			         <span class="fS11 uC cLr-lTbLu hMp tXt-oVrF">
			         <span v-text="ev.topLineInfo"></span>
			         </span>
			         <h3 class="mDa-hD mR50 fS14" title="Event name" ><a target="_blank" :href="ticketPurchaseUrl" >{{ev.name}}</a></h3>
			         <div class="mDa-dTa">
			            <ul class="iCnC-lSt iCn12 iCn-gRy">
			               <li class="iCnC-lSt-iTm">
			                  <span v-if="eventDate.show">{{eventDate.day}}</span> <span v-if="eventDate.show">, Show:<time> {{eventDate.show}}</time></span> <span v-if="eventDate.doors">, Doors:<time> {{eventDate.doors}}</time></span>
			                  <span>, {{allowedAge}} </span>
			                  <span style="color: black;font-weight: 400;font-size: 1.2em;">| {{ev.ticketPrice}}</span> 
			               </li>
			               <li class="iCnC-lSt-iTm"">
			                  <i class="bUi-iCn-mP-mKr-12"></i>
			                  <a target="_blank" :href="venueUrl" :class="{disabled:!ev.venue.url}"> <span>{{ev.venue.name}} </span></a>
			                  <span>
			                  <span >{{ev.venue.address1}} ,</span>
			                  <span >{{ev.venue.city}}  </span>
			                  <span v-if="ev.venue.postalCode">- {{ev.venue.postalCode}}	 </span>
			                  </span>
			               </li>
			            </ul>
			         </div>
			      <a target="_blank" :href="ticketPurchaseUrl" class="btn btn-success" :class="{disabled:ev.eventStatusCode!='BUY'}" role="button" style="float: right;position: relative;top: -59px;right: 20px;">{{ev.eventStatus}}</a>
			   </div>
			   </div>
			</li>
 			`
})

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
};

Vue.component('datepicker', {
    props: ['value', 'startdate', 'enddate'],
    template: '#datepicker-template',
    mounted: function() {
        var vm = this;
        $(this.$el)
            .val(this.value)
            .datetimepicker({
                format: "mm/dd/yyyy",
                autoclose: true,
                minView: 2,
                daysShort: true,
                startDate: this.startdate,
                endDate: this.enddate
            })
            .on('change', function() {
                vm.$emit('input', this.value);
            });
    },
    watch: {
        value: function(value) {
            $(this.$el).val(value);
        },
        startdate: function(value) {
            $(this.$el).datetimepicker('setStartDate', value);
        },
        enddate: function(value) {
            $(this.$el).datetimepicker('setEndDate', value);
        }
    }
});

var params;
var bus = new Vue();
var app = new Vue({
    el: '#app',
    data: {
        events: [],
        pageNum: 1,
        totalPages: 0,
        q: '',
        city: PORTAL_CITY,
        searchInPortalcity: eval(docCookies.getItem('searchInPortalcity')) == null ? true : eval(docCookies.getItem('searchInPortalcity')),
        qIsDirty: false,
        isProcessing: false,
        maxResults: 5,
        initLoad: true,
        checkedVenues:[],
        requestError: false,
        corsProxy: 'https://cors-anywhere.herokuapp.com/',
        baseEventsEndPoint: 'http://www.ticketfly.com/api/events/',
        venuesEndpoint: 'http://www.ticketfly.com/api/venues/list.json',
        venues:[],
        defaultEventtype: 'upcoming',
        eventTypeRadioOptions: [
            { value: 'list', label: 'All' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'featured', label: 'Featured' },
            { value: 'justAnnounced', label: 'Just Announced' },
            { value: 'past', label: 'Past' },
            { value: 'onsale', label: 'Onsale' }
        ],
        pickerOptions2: {
            shortcuts: [{
                text: 'Today',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    picker.$emit('pick', [start, end]);
                }
            }, {
                text: 'This week',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    end.setTime(start.getTime() + 3600 * 1000 * 24 * 7);
                    picker.$emit('pick', [start, end]);
                }
            }, {
                text: 'This month',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    end.setTime(start.getTime() + 3600 * 1000 * 24 * 30);
                    picker.$emit('pick', [start, end]);
                }
            }, ]
        },

        dateRange: '',
        showTfEvents: Boolean(eval(docCookies.getItem('showTfEvents'))),

    }

    ,
    methods: {
        getEventsPromise: function() {
            params = {};
            params['maxResults'] = this.maxResults;
            params['fields'] = fields;
            params['orgId'] = orgId;
            params['country'] = 0;
            params['tflyTicketed'] = true;
            if (this.pageNum > 1)
                params['pageNum'] = this.pageNum;
            if (this.q)
                params['q'] = this.q;
            if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
                params['fromDate'] = moment(this.dateRange[0]).format('YYYY-MM-DD');
                params['thruDate'] = moment(this.dateRange[1]).add(1, 'days').format('YYYY-MM-DD');
            }
            if (this.searchInPortalcity && this.city)
                params['city'] = this.city
            if (this.checkedVenues.length)
                params['venueId'] = this.checkedVenues.join()

            return this.$http.get(this.eventsEndPoint, { params: params });
        },
        getEvents: debounce(function() {
            this.isProcessing = true;
            this.getEventsPromise().then(function(response) {
                if (response.data.status == "ok")
                    this.isProcessing = false;
                this.pageNum = response.data.pageNum;
                this.totalPages = response.data.totalPages;
                this.events = response.data.events;
            }.bind(this)).catch(function(error) {
                this.requestError = true;
                this.isProcessing = false;
            });
        }, DEBOUNCE_TIME),
        go: function(page) {
            this.pageNum = page;
        },
        addOrRemove(id) {

            console.log("clicked")
            let idx = this.checkedVenues.indexOf(id);
            if(idx!=-1)
                this.checkedVenues.splice(idx, 1)
            else
                this.checkedVenues.push(id)

        }

    },
    created() {
        this.isProcessing = true;
        
        if(this.city) {
            let venueParams = {};
            venueParams['city'] = this.city;
            let venuePromise = this.$http.get(this.corsProxy + this.venuesEndpoint, { params: venueParams });

            this.$http.all([this.getEventsPromise(),venuePromise]).then(this.$http.spread(function(eventsData, venuesData) {
                if (eventsData.data.status == "ok")
                    this.isProcessing = false;
                this.pageNum = eventsData.data.pageNum;
                this.totalPages = eventsData.data.totalPages;
                this.events = eventsData.data.events;
                this.venues = venuesData.data.venues;
                this.initLoad = false;
            }.bind(this))).catch(function(error) {
                this.requestError = true;
                this.isProcessing = false;
                this.initLoad = false;
            });
        }
        else {
            this.getEventsPromise().then(function(eventsData) {
                if (eventsData.data.status == "ok")
                    this.isProcessing = false;
                this.pageNum = eventsData.data.pageNum;
                this.totalPages = eventsData.data.totalPages;
                this.events = eventsData.data.events;
                this.initLoad = false;
            }.bind(this)).catch(function(error) {
                this.requestError = true;
                this.isProcessing = false;
                this.initLoad = false;
            });

        }
        
    },
    watch: {
        q() {
            if (!this.initLoad && !this.isProcessing) {
                this.pageNum = 1;
                this.qIsDirty = true;
                this.getEvents();
                console.log('api called from q()')
            } else {
                this.initLoad = false;
            }
        },
        checkedVenues() {
            if (!this.initLoad && !this.isProcessing) {
                this.pageNum = 1;
                this.qIsDirty = true;
                this.getEvents();
                console.log('api called from checkedVenues()')
            } else {
                this.initLoad = false;
            }
        },
        pageNum() {
            if (!this.initLoad && !this.isProcessing) {
                this.qIsDirty = true;
                this.getEvents();
                console.log('api called from pageNum()')
            } else {
                this.initLoad = false;
            }

        },
        defaultEventtype(newValue, oldValue) {
            if (oldValue == 'list')
                this.dateRange = ''
            if (!this.initLoad && !this.isProcessing) {
                this.pageNum = 1;
                this.qIsDirty = true;
                this.getEvents();
                console.log('api called  from defaultEventtype()')
            } else {
                this.initLoad = false;
            }
        },
        dateRange() {
            let localLock = false;
            if (this.dateRange && this.dateRange[0] && this.dateRange[1] && this.defaultEventtype != 'list') {
                this.defaultEventtype = 'list'
                localLock = true;
            }
            if (!this.initLoad && !this.isProcessing && !localLock && this.defaultEventtype == 'list') {
                this.pageNum = 1;
                this.qIsDirty = true;
                this.getEvents();
                console.log('api called from dateRange()')
            } else {
                this.initLoad = false;
            }
        },
        searchInPortalcity: function(newValue) {
            docCookies.setItem('searchInPortalcity', newValue);
            if (!this.initLoad) {
                this.pageNum = 1;
                this.qIsDirty = true;
                this.getEvents();
                console.log('api called from searchInPortalcity()')
            } else {
                this.initLoad = false;
            }
        },
        showTfEvents: function(newValue) {
            docCookies.setItem('showTfEvents', newValue);
        }
    },
    computed: {
        pages() {
            let getPages = (start, end) => {
                if (start <= 1 || start > end || start >= this.totalPages) {
                    start = 2
                }
                if (end >= this.totalPages || end < start || end <= 1) {
                    end = this.totalPages - 1
                }
                let arr = []
                for (let i = start; i <= end; i++) {
                    arr.push(i)
                }
                return arr
            }
            let counts = this.maxResults
            if (this.totalPages < counts + 2) {
                return getPages(2, this.totalPages)
            } else {
                if (this.pageNum <= Math.ceil(counts / 2)) {
                    return getPages(2, counts)
                } else if (this.pageNum >= this.totalPages - Math.floor(counts / 2)) {
                    return getPages(this.totalPages + 1 - counts, this.totalPages - 1)
                } else {
                    let half = Math.ceil(counts / 2) - 1
                    let end = this.pageNum + half
                    if (counts % 2 === 0) {
                        end++
                    }
                    return getPages(this.pageNum - half, end)
                }
            }
        },
        eventsEndPoint() {
            return this.corsProxy + this.baseEventsEndPoint + this.defaultEventtype + '.json'
        },
        loading_msg() {
            if (this.searchInPortalcity)
                return "Loading New Events from " + this.city + " ...";
            return "Loading New Events from United States ..."
        }
    }

})
