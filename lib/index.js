export default class jsonPromise{constructor(a,b,c){this.url=a,this.params=b,this.callbackName=c.callbackName||this._getCallbackName(),this.waitTime=c.waitTime||5e3;let d,e,f=this._getQuery(this.url,this.params);return new Promise((a,b)=>{this.waitTime&&(d=setTimeout(()=>{b(new Error('Request timed out.'))},this.waitTime)),window[this.callbackName]=(c)=>{try{delete window[this.callbackName]}catch(a){b(new Error('Cant delete callback'))}window[this.callbackName]=null,clearTimeout(d),a(c)},e=()=>b(new Error('Script loading error.')),this._load(f,e)})}_getCallbackName(){return'cb_'+Math.random().toString(36).substr(2,6)}_getQuery(a,b){let c=-1===(a||'').indexOf('?')?'?':'&';for(let d in b=b||{},b)b.hasOwnProperty(d)&&(c+=encodeURIComponent(d)+'='+encodeURIComponent(b[d])+'&');return a+c+'callback='+this.callbackName}_load(a,b){let c,d;c=document.createElement('script'),c.src=a,c.async=!0,'function'==typeof b&&(c.onerror=b),c.onload=c.onreadystatechange=()=>{d||this.readyState&&'loaded'!==this.readyState&&'complete'!==this.readyState||(d=!0,c.onload=c.onreadystatechange=null,c&&c.parentNode&&c.parentNode.removeChild(c))},document.getElementsByTagName('head')[0].appendChild(c)}}