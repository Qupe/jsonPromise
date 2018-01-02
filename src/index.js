// @flow

export default class jsonPromise {
    url: string;
    params: Object;
    callbackName: string;
    waitTime: number;

    /**
     * Init constructor with params
     * @param url<string>
     * @param params<Object>
     * @param options<Object>
     * @return {Promise<{}>}
     */
    constructor(url: string, params: Object, options: {callbackName: string, waitTime: number}) : Promise<{}> {
        this.url = url;
        this.params = params;
        this.callbackName = options.callbackName || this._getCallbackName();
        this.waitTime = options.waitTime || 5000;

        let timer: number,
            query: string = this._getQuery(this.url, this.params),
            errorCallback: Object;

        return new Promise((resolve, reject) => {

            if (this.waitTime) {
                timer = setTimeout(() => {
                    reject(new Error('Request timed out.'));
                }, this.waitTime)
            }

            window[this.callbackName] = (data) => {
                try {
                    delete window[this.callbackName];
                } catch (error) {
                    reject(new Error('Cant delete callback'));
                }

                window[this.callbackName] = null;
                clearTimeout(timer);
                resolve(data);
            };

            errorCallback = () => reject(new Error('Script loading error.'));

            this._load(query, errorCallback);

        });

    }

    /**
     * Get unique callback name
     * @return {string}
     * @private
     */
    _getCallbackName(): string {
        return 'cb_' + Math.random().toString(36).substr(2, 6);
    }

    /**
     * Merge url with params
     * @param url<string>
     * @param params<Object>
     * @return {string}
     * @private
     */
    _getQuery(url: string, params: Object): string {

        let query = (url || '').indexOf('?') === -1 ? '?' : '&';
        params = params || {};

        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                query += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
            }
        }

        return url + query + 'callback=' + this.callbackName;
    }


    /**
     * Load script
     * @param query<string>
     * @param errorCallback<Object>
     * @private
     */
    _load(query: string, errorCallback: Object) {

        let script: Object,
            done: boolean;

        script = document.createElement('script');
        script.src = query;
        script.async = true;

        if (typeof errorCallback === 'function') {
            script.onerror = errorCallback;
        }

        script.onload = script.onreadystatechange = () => {
            if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                done = true;
                script.onload = script.onreadystatechange = null;

                if (script && script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            }
        };

        document.getElementsByTagName('head')[0].appendChild(script);
    }

}
