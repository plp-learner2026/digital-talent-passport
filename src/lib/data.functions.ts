import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'
import { z } from 'zod'
function publicClient() {
 const url=process.env['SUPABASE_URL']; const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
 if(!url||!key) throw new Error('Service unavailable')
 return createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_')&&h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h})}}})
}
export const getImpact=createServerFn({method:'GET'}).handler(async()=>{const {data,error}=await publicClient().rpc('impact_stats');if(error)throw error;return data})
export const getDemo=createServerFn({method:'GET'}).handler(async()=>{const {data,error}=await publicClient().from('demo_talents').select('*');if(error)throw error;return data})
export const verifyPassport=createServerFn({method:'GET'}).inputValidator(z.object({id:z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9-]+$/)})).handler(async({data})=>{const result=await publicClient().rpc('public_passport',{_passport_id:data.id});if(result.error)throw result.error;return result.data})