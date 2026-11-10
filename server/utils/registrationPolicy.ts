/** Reject unsafe account input before MongoDB or bcrypt receives it. */
export type SignupInput = {name:string;email:string;password:string};
export type SignupResult = {ok:true;value:SignupInput}|{ok:false;error:string};
export function validNewPassword(value:unknown):value is string {
  return typeof value==='string' && value.length>=8 && value.length<=128 && new TextEncoder().encode(value).length<=72;
}
export function validateSignup(input:unknown):SignupResult {
  if(!input || typeof input!=='object' || Array.isArray(input))return {ok:false,error:'Please provide valid registration details.'};
  const row=input as Record<string,unknown>;
  if(typeof row.name!=='string'||row.name.trim().length<2||row.name.trim().length>100)return {ok:false,error:'Name must be between 2 and 100 characters.'};
  if(typeof row.email!=='string'||row.email.trim().length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim()))return {ok:false,error:'Please enter a valid email address.'};
  if(!validNewPassword(row.password))return {ok:false,error:'Password must contain at least 8 characters and no more than 72 UTF-8 bytes.'};
  return {ok:true,value:{name:row.name.trim(),email:row.email.trim().toLowerCase(),password:row.password}};
}
