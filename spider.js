import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = 'https://www.quanben.io/';
const novelsDir = path.join(__dirname, 'docs/novels');

let categoryDir = '';
let novelDir = '';

const axiosInstance = axios.create({
    timeout: 15000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.quanben.io/'
    }
});


async function getCategories() {
    try {
        console.log('获取分类列表...');
        const response = await axiosInstance.get(baseUrl);
        const $ = cheerio.load(response.data);
        const categories = [];

        $('div.nav a').each((i, element) => {
            const $a = $(element);
            const $span = $a.find('span[itemprop="name"]');
            const name = $span.text().trim();
            const href = $a.attr('href');

            if (name && href) {
                categories.push({
                    name: name,
                    url: href,
                    fullUrl: new URL(href, baseUrl).href
                });
            }
        });

        return categories;
    } catch (error) {
        console.error('获取分类失败:', error.message);
        return [];
    }
}

async function saveChapters(currentNovel) {
    let currentUrl = new URL('1.html', currentNovel.fullUrl).href;
    console.log(`开始抓取小说章节: ${currentNovel.fullUrl}`);
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
    const filePath = path.join(novelDir, 'content.txt');
    fs.writeFileSync(filePath, contents.join('\n\n'), 'utf-8');
    console.log(`已保存至: ${filePath}`);
}

async function getAllNovelsByCategory(currentCategory) {
    try {
        console.log(`\n开始获取分类 "${currentCategory.name}" 的小说 ...`);
        await getNovelsByCategoryPage(currentCategory);
        // if (novels.length === 0) {
        //     console.log('未找到小说');
        //     return { saved: 0, novels: [] };
        // }

        // console.log(`分类 "${currentCategory.name}" 共找到 ${novels.length} 本小说。`);

        // return { saved: 1, novels };
    } catch (error) {
        console.error(`获取分类 "${currentCategory.name}" 小说失败:`, error.message);
        // return { saved: 0, novels: [] };
    }
}


async function getNovelsByCategoryPage(currentCategory) {
    try {
        let nextPageUrl = currentCategory.fullUrl;
        let pageNum = 1;
        while (nextPageUrl) {
            const response = await axiosInstance.get(nextPageUrl);
            const $ = cheerio.load(response.data);

            const bookElements = $('.list2[itemtype="http://schema.org/Book"]').toArray();
            for (const element of bookElements) {
                const $book = $(element);
                const titleElem = $book.find('h3 a span[itemprop="name"]');
                const title = titleElem.text().trim();
                const linkElem = $book.find('h3 a[itemprop="url"]');
                const href = linkElem.attr('href');
                const authorElem = $book.find('span[itemprop="author"]');
                const author = authorElem.text().trim();
                const descriptionElem = $book.find('p[itemprop="description"]');
                const description = descriptionElem.text().trim();
                const imageElem = $book.find('img[itemprop="image"]');
                let imageSrc = imageElem.attr('src');
                // 处理图片URL
                if (imageSrc) {
                    if (imageSrc.startsWith('//')) {
                        imageSrc = 'https:' + imageSrc;
                    } else if (imageSrc.startsWith('/')) {
                        imageSrc = baseUrl + imageSrc;
                    }
                }
                console.log(`发现小说: ${title} 作者: ${author}, href: ${href}`);
                if (title && href) {
                    const currentNovel = {
                        title: title,
                        href: href,
                        fullUrl: new URL(href, baseUrl).href,
                        author: author || '未知',
                        description: description || '',
                        image: imageSrc || '',
                        categoryUrl: currentCategory.fullUrl
                    }

                    // 创建小说文件夹
                    novelDir = path.join(categoryDir, title.replace(/[\\\\/:*?\"<>|]/g, '_'));
                    if (!fs.existsSync(novelDir)) {
                        fs.mkdirSync(novelDir, { recursive: true });
                        console.log(`已创建小说文件夹: ${novelDir}`);
                    }
                    // 保存 description.txt
                    const descPath = path.join(novelDir, 'description.txt');
                    const descContent = `名称: ${title}\n作者: ${author}\n简介: ${description}`;
                    fs.writeFileSync(descPath, descContent, 'utf-8');
                    // 下载图片（同步等待）
                    if (imageSrc) {
                        try {
                            const imgExt = path.extname(imageSrc.split('?')[0]) || '.jpg';
                            const imgPath = path.join(novelDir, `cover${imgExt}`);
                            const imgRes = await axiosInstance.get(imageSrc, { responseType: 'arraybuffer' });
                            fs.writeFileSync(imgPath, imgRes.data);
                            console.log(`已下载封面图片: ${imgPath}`);
                        } catch (err) {
                            console.error(`下载图片失败: ${imageSrc}`, err.message);
                        }
                    }

                    await saveChapters(currentNovel);

                }
            }

            // 查找下一页链接
            const $next = $('div.nlist_page.c p.page_next a[rel="next"]');
            if ($next.length > 0) {
                nextPageUrl = new URL($next.attr('href'), nextPageUrl).href;
                pageNum++;
                console.log(`进入第${pageNum}页: ${nextPageUrl}`);
            } else {
                nextPageUrl = null;
            }
        }
    } catch (error) {
        console.error(`获取分类页面失败 ${categoryUrl}:`, error.message);
    }
}

const categories = await getCategories();
console.log('分类列表:', categories);

for (let i = 0; i < categories.length; i++) {
    categoryDir = path.join(novelsDir, categories[i].name.replace(/[\\\\/:*?\"<>|]/g, '_'));
    if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
        console.log(`已创建分类文件夹: ${categoryDir}`);
    }

    await getAllNovelsByCategory(categories[i]);
}
