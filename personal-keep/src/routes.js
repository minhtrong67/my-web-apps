import {BarChart3,FolderKanban,Globe,KeyRound,MessageSquareText,Tags,Users} from 'lucide-react'
// Module -> các trang con. Route có dạng 'module/trang-con' (vd 'projects/accounts'); 'settings' đứng riêng.
export const MODS={
 projects:{icon:FolderKanban,subs:[['list','nav.projects',FolderKanban],['accounts','nav.accounts',Users],['stats','nav.stats',BarChart3]]},
 websites:{icon:Globe,subs:[['list','nav.websites',Globe],['categories','nav.categories',Tags],['stats','nav.stats',BarChart3]]},
 prompts:{icon:MessageSquareText,subs:[['list','nav.prompts',MessageSquareText],['categories','nav.categories',Tags],['keys','nav.keys',KeyRound],['stats','nav.stats',BarChart3]]}}
export const MOD_KEYS=Object.keys(MODS)
export const ROUTES=[...MOD_KEYS.flatMap(m=>MODS[m].subs.map(([s])=>`${m}/${s}`)),'settings']
// tương thích giá trị cũ của cài đặt 'trang mặc định' (projects, accounts, websites, stats, settings)
const OLD={projects:'projects/list',accounts:'projects/accounts',websites:'websites/list',stats:'projects/stats'}
export const normRoute=r=>ROUTES.includes(r)?r:OLD[r]||'projects/list'
