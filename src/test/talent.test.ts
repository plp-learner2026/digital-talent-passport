import { describe,it,expect } from 'vitest'
import { assessmentResult,canPublish,questionBanks } from '@/lib/talent'
describe('Talent safeguarding rules',()=>{
 it('requires four out of five answers to pass',()=>{expect(assessmentResult([1,0,2,1,2])).toEqual({score:4,passed:true});expect(assessmentResult([1,0,2,2,2])).toEqual({score:3,passed:false})})
 it('contains five questions per professional assessment',()=>{for(const questions of Object.values(questionBanks))expect(questions).toHaveLength(5)})
 it('requires consent before publishing a passed passport',()=>{expect(canPublish(false,[{passed:true}])).toBe(false);expect(canPublish(true,[{passed:true}])).toBe(true)})
 it('does not issue a passport for an unpassed assessment',()=>{expect(canPublish(true,[{passed:false}])).toBe(false)})
})