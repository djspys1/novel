import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const axiosInstance = axios.create({
    timeout: 15000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.quanben.io/'
    }
});

async function saveChapters() {
    let currentUrl = 'https://www.quanben.io/n/shaosong/1.html';
    let orderNum = 1;

    const contents = [];
    while (currentUrl) {
        let response = null;
        let success = false;
        for (let retry = 0; retry < 3; retry++) {
            try {
                response = await axiosInstance.get(currentUrl);
                success = true;
                break;
            } catch (err) {
                console.error(`请求失败: ${currentUrl}，重试第${retry + 1}次`);
                await new Promise(res => setTimeout(res, 1000));
            }
        }
        if (!success) {
            console.error(`章节抓取失败超过3次: ${currentUrl}，已保存已获取内容至txt`);
            break;
        }
        const $ = cheerio.load(response.data);
        let title = $('h1.headline[itemprop="headline"]').text().trim();
        if (!title) {
            title = $('title').text().trim();
        }
        const $content = $('#content').clone();
        $content.find('.ads').remove();
        // 保留段落格式，提取所有<p>标签内容并换行拼接
        let paragraphs = $content.find('p').map((i, el) => $(el).text().trim()).get();
        // 如果第一行和章节标题一致（忽略空格），则去掉第一行
        if (paragraphs.length > 0) {
            const firstLine = paragraphs[0].replace(/\s+/g, '');
            const titleNoSpace = title.replace(/\s+/g, '');
            if (firstLine === titleNoSpace) {
                paragraphs = paragraphs.slice(1);
            }
        }
        const content = paragraphs.join('\n');
        contents.push(`${title}\n${content}\n`);
        console.log(`已抓取章节: ${title}`);
        const $next = $('.list_page a[rel="next"]');
        if ($next.length > 0) {
            currentUrl = new URL($next.attr('href'), currentUrl).href;
            orderNum++;
        } else {
            currentUrl = null;
        }
    }
    // 保存到txt文件
    const filePath = path.join(__dirname, 'docs/novels/shaosong.txt');
    fs.writeFileSync(filePath, contents.join('\n\n'), 'utf-8');
    console.log(`已保存至: ${filePath}`);
}

saveChapters();
