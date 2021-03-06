import * as url from 'url';

export function normalizeUrl(grafanaUrl: string) {
  if(!grafanaUrl) {
    return grafanaUrl;
  }
  let urlObj = url.parse(grafanaUrl);
  if(urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
    grafanaUrl = `http://${grafanaUrl}`;
    urlObj = url.parse(grafanaUrl);
    console.log('No protocol provided in GRAFANA_URL -> inserting "http://"');
  }
  if(urlObj.slashes === false) {
    urlObj = url.parse(`${urlObj.protocol}//${urlObj.pathname}`);
    console.log('No slashes were provided after the protocol -> inserting slashes');
  } 
  if(urlObj.pathname.slice(-1) === '/') {
    urlObj.pathname = urlObj.pathname.slice(0, -1);
    console.log('Removing the slash at the end of GRAFANA_URL');
  }
  let finalUrl = `${urlObj.protocol}//${urlObj.hostname}`;
  if(urlObj.port !== null) {
    finalUrl = finalUrl + ':' + urlObj.port;
  }
  if(urlObj.pathname !== '') {
    finalUrl = finalUrl + urlObj.pathname;
  }
  return finalUrl;
}
