/** Bounded fixed-window counter. Multi-instance deployment requires a shared store. */
export interface RateDecision { allowed: boolean; remaining: number; retryAfterSeconds: number; }
type Entry = {count:number;expiresAt:number};
export class WindowRateCounter {
  private readonly entries = new Map<string,Entry>();
  private calls = 0;
  constructor(private readonly limit:number, private readonly windowMs:number, private readonly maxKeys=10000) {
    if (!Number.isSafeInteger(limit)||limit<1||!Number.isSafeInteger(windowMs)||windowMs<1000||!Number.isSafeInteger(maxKeys)||maxKeys<1) throw Error('Invalid rate-limit configuration');
  }
  take(key:string,now=Date.now()):RateDecision {
    if (typeof key!=='string'||!key||key.length>256||!Number.isFinite(now)) return {allowed:false,remaining:0,retryAfterSeconds:60};
    this.calls++;
    if(this.calls%200===0)this.sweep(now);
    const prev=this.entries.get(key);
    if(prev&&prev.expiresAt>now){
      if(prev.count>=this.limit)return {allowed:false,remaining:0,retryAfterSeconds:Math.max(1,Math.ceil((prev.expiresAt-now)/1000))};
      prev.count++;
      return {allowed:true,remaining:this.limit-prev.count,retryAfterSeconds:0};
    }
    if(prev)this.entries.delete(key);
    if(this.entries.size>=this.maxKeys)this.sweep(now);
    if(this.entries.size>=this.maxKeys)return {allowed:false,remaining:0,retryAfterSeconds:60};
    this.entries.set(key,{count:1,expiresAt:now+this.windowMs});
    return {allowed:true,remaining:this.limit-1,retryAfterSeconds:0};
  }
  private sweep(now:number):void {for(const [key,item] of this.entries)if(item.expiresAt<=now)this.entries.delete(key);}
}
