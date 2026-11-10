/** Conservative same-origin guard for cookie-authenticated API mutations. */
export function allowCookieRequest(method:string,origin:string|undefined,frontendUrl:string):boolean {
  if(['GET','HEAD','OPTIONS'].includes(method.toUpperCase()))return true;
  if(typeof origin!=='string'||!origin||typeof frontendUrl!=='string'||!frontendUrl)return false;
  try {
    const expected=new URL(frontendUrl).origin;
    const incoming=new URL(origin);
    if(!['https:','http:'].includes(incoming.protocol))return false;
    return incoming.origin===origin && expected===origin && expected!=='null';
  }catch{return false;}
}
