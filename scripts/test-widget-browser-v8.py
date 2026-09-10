"""Network-isolated Chromium integration tests of the real ZIP frontend.
Google/Supabase and affiliate navigation are stubbed; no production API calls.
Run with Python + Playwright and Chromium installed.
"""
import asyncio, json, mimetypes, re, sys, base64, os, tempfile, shutil
from bs4 import BeautifulSoup
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import urlparse, parse_qs, unquote
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('TRAVIRAE_QA_OUTPUT') or tempfile.mkdtemp(prefix='travirae-v8-qa-'))
OUT.mkdir(parents=True,exist_ok=True)
CHROMIUM=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('google-chrome')
if not CHROMIUM: raise SystemExit('Set CHROMIUM_PATH to an installed Chromium/Chrome executable.')
LOCALES={'it':('','ITA','EUR'),'en':('-en','ENG','USD'),'de':('-de','DEU','EUR'),'fr':('-fr','FRA','EUR'),'es':('-es','SPA','EUR'),'nl':('-nl','NLD','EUR'),'ru':('-ru','RUS','RUB'),'ar':('-ar','ARA','AED'),'zh':('-zh','ZHO','CNY')}
records=[]
check_count=0

def check(condition,message):
    global check_count
    assert condition, message
    check_count+=1

def fixture(place_id,name,location,address):
    return {'item':{'placeId':place_id,'name':name,'location':location,'text':name+', '+location,'types':['hotel','lodging']},'details':{'placeId':place_id,'address':address,'lat':40.63416,'lng':14.60268,'primaryType':'hotel','types':['hotel','lodging']}}
F1=fixture('TEST_LIDOMARE_AMALFI','Hotel Lidomare','Largo Duchi Piccolomini, Amalfi, SA, Italia','Largo Duchi Piccolomini, 9, 84011 Amalfi SA, Italia')
F2=fixture('TEST_XYU_AMALFI','Hotel XYZ - Xyu Resort','Amalfi, SA, Italia','Piazza Esempio, 1, 84011 Amalfi SA, Italia')
F3=fixture('TEST_OTHER_RAVENNA','Hotel Lidomare','Ravenna, RA, Italia','Via Esempio, 48121 Ravenna RA, Italia')

async def make_page(browser,lang='it',width=1440,height=1000):
    suffix,code,currency=LOCALES[lang]
    print('START',lang,width,flush=True)
    ctx=await browser.new_context(viewport={'width':width,'height':height},locale=lang,device_scale_factor=1)
    await ctx.route('**/*',lambda route: route.abort())
    state={'fixtures':[F1,F3], 'details_error':False, 'wrong_id':False, 'auto_delay':0, 'details_delay':0, 'requests':[], 'external':[], 'errors':[]}
    page=await ctx.new_page()
    page.set_default_timeout(10000)
    page.on('pageerror',lambda e:state['errors'].append(str(e)))
    async def qa_fetch(url):
        p=urlparse(url)
        if p.path.endswith('/functions/v1/google-hotel-autocomplete'):
            qs=parse_qs(p.query); state['requests'].append(qs)
            if qs.get('action',[''])[0]=='autocomplete':
                fixtures=list(state['fixtures']);delay=state['auto_delay']
                if delay: await asyncio.sleep(delay)
                return {'status':200,'payload':{'status':'ok','provider':'google_places_new','items':[x['item'] for x in fixtures]}}
            if state['details_delay']: await asyncio.sleep(state['details_delay'])
            if state['details_error']: return {'status':502,'payload':{'error':'fixture_details_failure'}}
            requested=qs.get('place_id',[''])[0]
            f=next((x for x in [F1,F2,F3] if x['details']['placeId']==requested),F1)
            details=dict(f['details'])
            if state['wrong_id']: details['placeId']='WRONG_ID'
            return {'status':200,'payload':{'status':'ok','provider':'google_places_new','place':details}}
        if 'widget-autocomplete.json' in url:
            return {'status':200,'payload':{'stay22Destinations':['Parigi, Francia','Roma, Italia']}}
        return {'status':200,'payload':{}}
    async def qa_outbound(href): state['external'].append(href)
    await page.expose_function('__qaFetch',qa_fetch)
    await page.expose_function('__qaOutbound',qa_outbound)
    # No network or policy changes. Load the shipped page in memory, inline its
    # local assets, and mock only external services/navigation.
    html=(ROOT/f'index{suffix}.html').read_text()
    soup=BeautifulSoup(html,'html.parser')
    for tag in soup.find_all('script',src=True):
        src=tag.get('src','').split('?')[0]
        if src not in ['assets/js/config.js','assets/js/google-hotel-autocomplete.js','assets/js/stay22-search-widget.js']:
            tag.decompose();continue
        if src.startswith('assets/'):
            if src=='assets/js/config.js': js="window.TRAVIRAE_CONFIG={SUPABASE_URL:'https://mock-supabase.test',SUPABASE_ANON_KEY:'TEST_PUBLIC_NOT_A_SECRET'};"
            else: js=(ROOT/src).read_text()
            if src=='assets/js/main.js': js=js.replace('try { routeByLang(); } catch (e) {}','/* QA about:blank: URL language routing skipped, document locale retained. */')
            tag.attrs.pop('src',None);tag.string=js.replace('</script','<\\/script')
        else: tag.decompose()
    router=soup.find('script',id='travirae-lang-router')
    if router:router.decompose() # URL routing is irrelevant in about:blank QA.
    for tag in soup.find_all('link'):
        href=tag.get('href','').split('?')[0]
        if 'stylesheet' in tag.get('rel',[]) and href.startswith('assets/'):
            css=(ROOT/href).read_text()
            def css_data(m):
                name=m.group(1).strip("\"'")
                asset=((ROOT/href).parent/name).resolve()
                if asset.is_file() and asset.is_relative_to(ROOT):
                    return 'url(data:'+(mimetypes.guess_type(str(asset))[0] or 'image/png')+';base64,'+base64.b64encode(asset.read_bytes()).decode()+')'
                return 'url("")'
            css=re.sub(r'url\(([^)]+)\)',css_data,css)
            style=soup.new_tag('style');style.string=css;tag.replace_with(style)
        else:tag.decompose()
    for img in soup.find_all('img'):
        src=img.get('src','').split('?')[0];asset=ROOT/src
        if src.startswith('assets/') and asset.is_file():
            img['src']='data:'+(mimetypes.guess_type(str(asset))[0] or 'image/png')+';base64,'+base64.b64encode(asset.read_bytes()).decode()
        else:img['src']='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
    harness=soup.new_tag('script')
    harness.string="""
    window.__outbound=[];
    Object.defineProperty(window,'localStorage',{configurable:true,value:(()=>{const v={travirae_site_lang_manual:'1',travirae_site_lang:'CODE',travirae_site_lang_explicit:'1'};return {getItem:k=>v[k]||null,setItem:(k,x)=>{v[k]=String(x)},removeItem:k=>{delete v[k]}}})()});
    Object.defineProperty(window,'sessionStorage',{configurable:true,value:(()=>{const v={};return {getItem:k=>v[k]||null,setItem:(k,x)=>{v[k]=String(x)},removeItem:k=>{delete v[k]}}})()});
    window.fetch=async(url,opts={})=>{if(opts.signal?.aborted)throw new DOMException('Aborted','AbortError');const r=await window.__qaFetch(String(url));if(opts.signal?.aborted)throw new DOMException('Aborted','AbortError');return new Response(JSON.stringify(r.payload),{status:r.status,headers:{'Content-Type':'application/json'}})};
    const nativeOpen=window.open.bind(window);
    window.open=function(url,name){const tab=nativeOpen('about:blank',name);if(!tab)return null;return {set opener(v){tab.opener=v},location:{replace(href){window.__outbound.push(href);window.__qaOutbound(href);tab.document.title='QA - Simulated partner';const p=tab.document.createElement('p');p.textContent='SIMULATED external navigation; no real booking or affiliate call.';tab.document.body.appendChild(p)}},close:()=>tab.close()}};
    """.replace('CODE',code)
    soup.head.insert(0,harness)
    await page.set_content(str(soup),wait_until='domcontentloaded')
    await page.wait_for_function("document.getElementById('travirae-stay-search')?.dataset.initialized === '1'")
    await page.evaluate("window.__tracking=[]; window.__affiliateId='creator_v8_test'; window.traviraeAffiliate={getId:()=>window.__affiliateId,trackWidgetOutbound:(data)=>{window.__tracking.push(data);return Promise.resolve(true)}};")
    return ctx,page,state

async def dates(page):
    ci=(date.today()+timedelta(days=5)).isoformat();co=(date.today()+timedelta(days=8)).isoformat()
    await page.locator('#travirae-stay-checkin').click()
    for _ in range(3):
        if await page.locator(f'[data-date="{ci}"]').count():break
        await page.locator('[data-cal-nav="next"]').click()
    await page.locator(f'[data-date="{ci}"]').click()
    check(await page.locator('#travirae-stay-checkout').input_value()=='','Checkout must stay empty until selected')
    await page.locator('#travirae-stay-checkout').click()
    for _ in range(3):
        if await page.locator(f'[data-date="{co}"]').count():break
        await page.locator('[data-cal-nav="next"]').click()
    await page.locator(f'[data-date="{co}"]').click()
    return ci,co

async def select(page,query='Hotel Lidomar',index=0):
    inp=page.locator('#travirae-stay-hotel-name')
    await inp.fill(query)
    await page.locator('.travirae-stay-search__hotel-suggestion').nth(index).wait_for(state='visible')
    await page.locator('.travirae-stay-search__hotel-suggestion').nth(index).click()
    await page.wait_for_function("Boolean(document.querySelector('#travirae-stay-hotel-name').dataset.selectedPlaceId)")

async def popup_search(page,ctx):
    before=len(ctx.pages)
    async with page.expect_popup() as promise:
        await page.locator('.travirae-stay-search__submit').click()
    popup=await promise.value
    await popup.wait_for_load_state('domcontentloaded')
    check(len(ctx.pages)==before+1,'Exactly one real popup context per submit')
    check(await popup.evaluate('window.opener===null'),'Partner popup must be isolated')
    url=await page.evaluate("window.__outbound.at(-1)")
    await popup.close()
    await page.wait_for_function("!document.querySelector('.travirae-stay-search__submit').disabled")
    return url

async def standard_case(browser,lang,width):
    ctx,page,state=await make_page(browser,lang,width,1000 if width>600 else 844)
    original=page.url
    try:
        before=await page.locator('#travirae-stay-search').bounding_box()
        await page.locator('[data-search-mode="hotel"]').click()
        after=await page.locator('#travirae-stay-search').bounding_box()
        check(abs(before['height']-after['height'])<1.1,f'{lang}/{width}: shared layout')
        await page.locator('#travirae-stay-hotel-name').fill('Hotel Lidomar')
        sugg=page.locator('.travirae-stay-search__hotel-suggestion').first
        await sugg.wait_for(state='visible')
        check(await sugg.locator('strong').inner_text()=='Hotel Lidomare','Suggestion must display the full returned name')
        check('Amalfi' in await sugg.locator('small').inner_text(),'Suggestion has locality')
        if lang=='it' and width==1440:
            await page.locator('#travirae-stay-search').screenshot(path=str(OUT/'desktop_autocomplete.png'))
        await sugg.click()
        await page.wait_for_function("document.querySelector('#travirae-stay-hotel-name').dataset.selectedPlaceId==='TEST_LIDOMARE_AMALFI'")
        check(await page.locator('#travirae-stay-hotel-name').input_value()=='Hotel Lidomare','Input updated to the chosen name, not typed prefix')
        ci,co=await dates(page)
        check(len(ctx.pages)==1 and len(state['external'])==0,'No popup from typing, selection or dates')
        target=await popup_search(page,ctx);outer=parse_qs(urlparse(target).query);inner=parse_qs(urlparse(outer['link'][0]).query)
        check(inner['ss']==['Hotel Lidomare Amalfi'],'Hotel Lidomar -> Hotel Lidomare Amalfi exact outgoing query')
        check(inner['ss_raw']==inner['ss'],'Original and visible Booking search agree')
        check(outer['aid']==['travirae'] and outer['campaign']==['creator_v8_test'],'Affiliate ID and creator campaign preserved')
        check(outer['roam']==['false'],'No auto provider selection for a selected hotel')
        check(inner['checkin']==[ci] and inner['checkout']==[co],'Dates survive nested URL')
        check(inner['lang']==[lang] and inner['selected_currency']==[LOCALES[lang][2]],'Language/currency intact')
        check(inner['group_adults']==['2'] and inner['no_rooms']==['1'],'Guests and rooms intact')
        check(all(k not in inner for k in ['hotelname','dest_id','dest_type','hid','lat','lng']),'No different hotel selector injected')
        check(page.url==original,'Travirae remains in original page')
        track=await page.evaluate('window.__tracking.at(-1)')
        check(track['bookingSearchQuery']=='Hotel Lidomare Amalfi' and track['hotelName']=='Hotel Lidomare','Tracking contains the selected name/query')
        check(track['hotelPlaceId']=='TEST_LIDOMARE_AMALFI','Tracking retains selection ID')
        check(track['href']==target,'Tracking href and opened href identical')
        # Typing after selection invalidates it; a submit cannot use stale data.
        await page.locator('#travirae-stay-hotel-name').fill('Unselected changed name')
        before_ext=len(state['external']);await page.locator('.travirae-stay-search__submit').click()
        check(len(state['external'])==before_ext,'Unselected edit cannot navigate')
        check(bool(await page.locator('[data-search-error]').inner_text()),'Unselected edit shows an error')
        state['fixtures']=[F2]
        await select(page,'Hotel Xy')
        target2=await popup_search(page,ctx);out2=parse_qs(urlparse(target2).query);in2=parse_qs(urlparse(out2['link'][0]).query)
        check(in2['ss']==['Hotel XYZ - Xyu Resort Amalfi'],'Full suffix must never be truncated')
        # Search by destination remains independent and uses its original endpoint.
        await page.locator('[data-search-mode="destination"]').click()
        await page.locator('#travirae-stay-destination').fill('Parigi, Francia')
        target3=await popup_search(page,ctx);out3=parse_qs(urlparse(target3).query)
        check(urlparse(target3).path=='/allez/searchbar','Destination endpoint unchanged')
        check(out3['address']==['Parigi, Francia'] and 'link' not in out3,'No selected-hotel query leaks into destination mode')
        check(out3['aid']==['travirae'] and out3['campaign']==['creator_v8_test'],'Destination tracking unchanged')
        dims=await page.evaluate('({scroll:document.documentElement.scrollWidth,width:innerWidth})')
        check(dims['scroll']<=dims['width']+1,'No horizontal overflow')
        check(not state['errors'],'No unhandled JS errors: '+str(state['errors']))
        if lang=='it' and width==1440:
            await page.locator('#travirae-stay-search').screenshot(path=str(OUT/'desktop_destination.png'))
        if lang=='it' and width==390:
            await page.locator('#travirae-stay-checkout').click()
            await page.screenshot(path=str(OUT/'mobile_calendar.png'))
        records.append({'locale':lang,'width':width,'status':'PASS','outgoing_query':inner['ss'][0]})
        print('PASS browser',lang,width,flush=True)
    finally:
        print('CLOSING',lang,width,flush=True)
        await asyncio.wait_for(ctx.close(),8)
        print('CLOSED',lang,width,flush=True)

async def advanced(browser):
    print('START advanced',flush=True)
    ctx,page,state=await make_page(browser)
    try:
        await page.locator('[data-search-mode="hotel"]').click()
        state['wrong_id']=True
        await page.locator('#travirae-stay-hotel-name').fill('Hotel Lidomar')
        await page.locator('.travirae-stay-search__hotel-suggestion').first.click()
        await page.locator('.travirae-stay-search__hotel-status.is-error').wait_for()
        check(not await page.locator('#travirae-stay-hotel-name').get_attribute('data-selected-place-id'),'Wrong details ID cannot become selected')
        state['wrong_id']=False;state['details_error']=True
        await page.locator('#travirae-stay-hotel-name').fill('Hotel again')
        await page.locator('.travirae-stay-search__hotel-suggestion').first.click()
        await page.locator('.travirae-stay-search__hotel-status.is-error').wait_for()
        check(not await page.locator('#travirae-stay-hotel-name').get_attribute('data-selected-place-id'),'Failed details cannot use partial result')
        state['details_error']=False
        await page.locator('#travirae-stay-hotel-name').fill('Hotel by keyboard')
        await page.locator('.travirae-stay-search__hotel-suggestion').first.wait_for()
        await page.locator('#travirae-stay-hotel-name').press('ArrowDown')
        await page.locator('#travirae-stay-hotel-name').press('ArrowDown')
        await page.locator('#travirae-stay-hotel-name').press('Enter')
        await page.wait_for_function("document.querySelector('#travirae-stay-hotel-name').dataset.selectedPlaceId==='TEST_OTHER_RAVENNA'")
        await dates(page)
        target=await popup_search(page,ctx);inner=parse_qs(urlparse(parse_qs(urlparse(target).query)['link'][0]).query)
        check(inner['ss']==['Hotel Lidomare Ravenna'],'Second suggestion selected by keyboard controls city, not old typed query')
        # Delayed old predictions may never overwrite the newer query.
        state['auto_delay']=0.9
        await page.locator('#travirae-stay-hotel-name').fill('Old Hotel Lidomare')
        await page.wait_for_timeout(450)
        state['auto_delay']=0;state['fixtures']=[F2]
        await page.locator('#travirae-stay-hotel-name').fill('New XYZ')
        await page.wait_for_timeout(1100)
        check(await page.locator('.travirae-stay-search__hotel-suggestion strong').first.inner_text()=='Hotel XYZ - Xyu Resort','Old response cannot overwrite new suggestions')
        await page.locator('.travirae-stay-search__hotel-suggestion').first.click()
        await page.wait_for_function("document.querySelector('#travirae-stay-hotel-name').dataset.selectedPlaceId==='TEST_XYU_AMALFI'")
        # Blocked popup: stay in current page, no fallback unaffiliated redirect.
        original=page.url
        await page.evaluate('window.__originalOpen=window.open;window.open=()=>null')
        ext_before=len(state['external'])
        await page.locator('.travirae-stay-search__submit').click()
        check(page.url==original and len(state['external'])==ext_before,'Blocked popup cannot redirect original page')
        check(not await page.locator('.travirae-stay-search__submit').is_disabled(),'Button re-enabled after popup blocked')
        await page.evaluate("window.open=window.__originalOpen;window.__affiliateId=''")
        target=await popup_search(page,ctx)
        outer=parse_qs(urlparse(target).query)
        check(outer['aid']==['travirae'] and 'campaign' not in outer,'No synthetic creator for direct visitors')
        # If details resolve after a mode switch they cannot replace the selection.
        state['details_delay']=0.5;state['fixtures']=[F1]
        await page.locator('#travirae-stay-hotel-name').fill('Hotel Lidomar')
        await page.locator('.travirae-stay-search__hotel-suggestion').first.click()
        await page.locator('[data-search-mode="destination"]').click()
        await page.wait_for_timeout(750)
        await page.locator('[data-search-mode="hotel"]').click()
        check(not await page.locator('#travirae-stay-hotel-name').get_attribute('data-selected-place-id'),'Stale detail reply after switching mode rejected')
        check(not state['errors'],'Advanced tests have no unhandled JS errors: '+str(state['errors']))
        records.append({'test':'advanced-races-errors-keyboard-popup','status':'PASS'})
        print('PASS advanced browser checks',flush=True)
    finally: await ctx.close()

async def main():
    global check_count
    version=''
    async with async_playwright() as p:
        langs=[] if '--advanced-only' in sys.argv else ([sys.argv[sys.argv.index('--locale')+1]] if '--locale' in sys.argv else ['it'])
        for lang in langs:
            browser=await p.chromium.launch(executable_path=CHROMIUM,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
            version=browser.version
            try:
                for width in ([1440] if '--smoke' in sys.argv else [1440,390]):
                    await standard_case(browser,lang,width)
            finally: await asyncio.wait_for(browser.close(),10)
        if '--advanced-only' in sys.argv:
            browser=await p.chromium.launch(executable_path=CHROMIUM,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
            version=browser.version
            try: await advanced(browser)
            finally: await asyncio.wait_for(browser.close(),10)
    print('PASS total browser assertions',check_count,flush=True)
    print('QA output:',OUT,flush=True)
    (OUT/('results_'+('_'.join(langs) or 'advanced')+'.json')).write_text(json.dumps({'assertions':check_count,'cases':records,'network':'Real local HTML/CSS/JS loaded in memory. External fetch and tab location replaced by QA fixtures; no live Google/Supabase/Stay22 calls','engine':version},ensure_ascii=False,indent=2))
if __name__=='__main__': asyncio.run(main())
