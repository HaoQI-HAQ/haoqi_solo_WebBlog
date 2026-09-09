// Run with Playwright available (NODE_PATH can point to the bundled runtime).
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://localhost:5173/work.html');
    await page.waitForFunction(()=>document.querySelector('.work-array-canvas')?.dataset.phase==='browsing',{},{timeout:60000});
    await page.waitForTimeout(1600);
    await page.screenshot({path:'logs/work-array-desktop.png'});
    let pointerSelected = false;
    for (const point of [[400,350],[600,450],[300,450],[500,500]]) {
      const before = await page.locator('.work-array-canvas').getAttribute('data-selected');
      await page.mouse.click(...point); await page.waitForTimeout(180);
      if (before !== await page.locator('.work-array-canvas').getAttribute('data-selected')) { pointerSelected=true; break; }
    }
    assert(pointerSelected,'Clicking a cassette must change the selected work');
    await page.getByRole('button',{name:'选择 WORK-01',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('.work-array-canvas').dataset.selected==='0');
    await page.getByRole('button',{name:'下一份档案',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('.work-array-canvas').dataset.selected==='1');
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
    await page.waitForFunction(()=>document.querySelector('.work-array-canvas').dataset.selected==='0');
    await page.getByRole('button',{name:'向右切换档案列',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('.work-array-canvas').dataset.selected==='1');
    await page.waitForTimeout(1200);
    await page.screenshot({path:'logs/work-array-shift.png'});
    await page.getByRole('button',{name:/抽取档案/}).click();
    await page.waitForFunction(()=>document.querySelector('.work-array-canvas').dataset.phase==='detail');
    await page.screenshot({path:'logs/work-array-detail.png'});
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.querySelector('.work-array-canvas').dataset.phase==='browsing');
    assert.equal(await page.locator('video').count(),0,'Reference recording must not be presented as work footage');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.getByRole('button',{name:'下一份档案',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('.work-array-canvas').dataset.selected==='2');
    await page.setViewportSize({width:390,height:844});
    await page.waitForTimeout(1000);
    await page.screenshot({path:'logs/work-array-mobile.png'});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No mobile horizontal overflow');
    assert.deepEqual(errors,[]);
    console.log('PASS: WebGL load, pointer selection, row wrap, column switch, extraction, return, reference-video exclusion, reduced motion, mobile width, browser errors.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
