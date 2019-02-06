interface ScriptElement extends HTMLScriptElement {
    onreadystatechange?: ((ev: Event) => any) | null
}

export default function jsonPromise(url: string, params?: object, timeout?: number, callback?: string): Promise<object> {
    callback = callback || 'cb' + Math.random().toString(36).substr(2, 6);
    let queryString = makeQueryString(url, params);

    return new Promise((resolve, reject) => {
        let timer: number;

        if (timeout) {
            timer = setTimeout((): void => {
                reject(new Error('Request timed out'));
            }, timeout);
        }

        window[callback] = (response: object): void => {
            try {
                delete window[callback];
            } catch (error) {
                reject(new Error('Cant delete callback'));
            }

            window[callback] = undefined;
            clearTimeout(timer);
            resolve(response);
        };

        let errorCallback = () => reject(new Error('Script loading error'));

        loadScript(errorCallback);
    });

    function makeQueryString(url: string, params: { [key: string]: any }): string {
        let query = (url || '').indexOf('?') === -1 ? '?' : '&';

        for (let key in params) {
            if (!params.hasOwnProperty(key)) {
                continue;
            }
            query += `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}&`;
        }

        return url + query + 'callback=' + callback;
    }

    function loadScript(errorCallback: ErrorEventHandler): void {
        let script: ScriptElement,
            done: boolean;

        script = document.createElement('script');
        script.src = queryString;
        script.async = true;
        script.onerror = errorCallback;

        script.onload = script.onreadystatechange = function (): void {
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
