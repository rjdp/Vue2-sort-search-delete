const DEBOUNCE_TIME = 800;
function retryFailedRequest(err) {
    if (err.status !== 200 && err.config && !err.config.__isRetryRequest) {
        err.config.__isRetryRequest = true;
        return axios(err.config);
    }
    throw err;
}
axios.interceptors.response.use(undefined, retryFailedRequest);
Vue.prototype.$http = axios;

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

  Vue.component('my-item-en', {
    functional: true,
    render: function (h, ctx) {
      var item = ctx.props.item;
      return h('li', ctx.data, [
        h('img', { attrs: { class: 'article-img' ,src: item.title } }, []),
        h('h4', { attrs: { class: 'link' } }, [item.title])
      ]);
    },
  });


var params;

var app = new Vue({
    el: '#app',
    data: {
        items: [],
        q:'',
        results: [],
    },
    methods: {
        querySearch: debounce(function (queryString, cb) {
            params = {};
            if (queryString && queryString.length > 2) {
                params['title_like'] = queryString;
                this.$http.get('/posts', { params: params }).then(function(response) {
                    cb(response.data.filter(function(item){return this.sortedItemsIds.indexOf(item.id) == -1}.bind(this)));
                }.bind(this)).catch(function(error) {
                    console.log(error)
                });
            } else {
                cb([]);
            }
        }, DEBOUNCE_TIME),
        handleSelect: function(item) {
            this.items.push(item);
        }
    },
    computed: {
        sortedItemsIds: function() {
            return this.items.map(function (item) { return item.id });
        },
    }
})
