/**
 * Markdown 段落行尾自动补两个空格脚本
 * 目标：在“普通文本段落”中，将单回车断行转换为“行尾两个空格 + 回车”，以符合 Markdown 的换行渲染规则。
 * 规避：代码块、标题、列表、引用、表格、HTML 起始行、缩进代码、空行、段落末行等结构性语法。
 */
import fs from 'fs' // Node.js 文件系统模块（同步部分，用于少量存在性检查等简单用法）
import { promises as fsp } from 'fs' // Node.js 文件系统模块的 Promise 版本（异步读写、遍历等）
import path from 'path' // Node.js 路径处理模块（拼接、解析、规范化路径）

const POSTS_ROOT = path.resolve(process.cwd(), 'docs', 'posts') // 使用 path.resolve 将相对路径解析为绝对路径

type LinePredicate = (line: string) => boolean

/**
 * 主流程：遍历文件并处理 Markdown 内容
 */
async function main() {
    try {
        await fsp.access(POSTS_ROOT) // fsp.access 检查目录是否存在及可访问
    } catch {
        console.warn(`【addLineBreakSpaces】跳过：未找到目录 -> ${POSTS_ROOT}`)
        return
    }

    const changedFiles: string[] = []

    // 收集处理过的文件路径
    const filesToProcess: string[] = []
    await walkDirCollect(POSTS_ROOT, filesToProcess)

    // 并发控制
    const concurrency = 8
    let nextIndex = 0

    // 单个文件的处理逻辑
    const processOne = async () => {
        while (true) {
            const i = nextIndex
            if (i >= filesToProcess.length) return
            nextIndex += 1

            const filePath = filesToProcess[i]
            try {
                const original = await fsp.readFile(filePath, 'utf8')
                const processed = processMarkdown(original)
                if (processed !== original) {
                    await fsp.writeFile(filePath, processed, 'utf8')
                    changedFiles.push(path.relative(process.cwd(), filePath))
                }
            } catch (err) {
                console.error(`【addLineBreakSpaces】处理失败：${filePath}`, err)
            }
        }
    }

    // 并发 concurrency 个
    const workers = Array.from({ length: concurrency }, () => processOne())
    await Promise.allSettled(workers)

    if (changedFiles.length > 0) {
        console.log(`【addLineBreakSpaces】已更新 ${changedFiles.length} 个文件：`)
        for (const f of changedFiles) console.log(` - ${f}`)
    } else {
        console.log('【addLineBreakSpaces】无需改动。')
    }
    console.log('【addLineBreakSpaces】处理完成。')
}

/**
 * 处理 Markdown 文本：
 * - 普通段落：单回车行尾补两个空格
 * - 引用块（> 开头）：相邻的引用行之间也补两个空格
 */
function processMarkdown(content: string): string {
    const useCrlf = content.includes('\r\n')
    const lines = content.split(/\r?\n/)

    let inFenced = false
    let inFrontMatter = false

    for (let i = 0; i < lines.length; i += 1) {
        const current = lines[i]

        // FrontMatter 内不处理；遇到结束分隔线退出 FrontMatter
        if (inFrontMatter) {
            if (/^---\s*$/.test(current.trim())) {
                inFrontMatter = false
            }
            continue
        }
        
        // FrontMatter块 起始行判断
        if (!inFrontMatter && /^---\s*$/.test(current.trim())) {
            inFrontMatter = true
            continue
        }

        // 进入/退出 围栏代码块（仅处理裸围栏；嵌套于引用内的围栏通过“紧贴代码块上一行”规则规避）
        if (isFencedDelimiter(current)) {
            inFenced = !inFenced
            continue
        }
        if (inFenced) continue

        

        const next = i + 1 < lines.length ? lines[i + 1] : ''

        // 段落条件：当前非空且下一行非空
        if (current.trim().length === 0) continue
        if (next.trim().length === 0) continue

        const currentIsQuote = isBlockquote(current)
        const nextIsQuote = isBlockquote(next)

        // 紧贴代码块上一行：若下一行是围栏（或引用中的围栏）则跳过
        if (isFencedDelimiterLoose(next)) continue

        if (currentIsQuote) {
            // 在引用块中，仅当下一行也仍在引用块中才补空格
            if (!nextIsQuote) continue
            if (hasTrailingTwoSpaces(current)) continue
            lines[i] = `${current}  `
            continue
        }

        // 普通段落：若当前或下一行属于结构性语法（除引用外）则跳过
        if (isStructuralExceptBlockquote(current)) continue
        if (isStructuralExceptBlockquote(next)) continue
        if (hasTrailingTwoSpaces(current)) continue
        lines[i] = `${current}  `
    }

    return lines.join(useCrlf ? '\r\n' : '\n')
}

/** 递归遍历目录下的所有 .md 文件 */
async function walkDirCollect(dir: string, outFiles: string[]) {
    const entries = await fsp.readdir(dir, {
        withFileTypes: true, // withFileTypes: 让返回 Dirent 对象，可直接判断 isFile/isDirectory
    }) // fsp.readdir 异步读取目录内容
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name) // path.join 拼接目录与文件/子目录名，生成平台兼容的路径
        if (entry.isDirectory()) {
            await walkDirCollect(fullPath, outFiles) // 递归收集子目录
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
            outFiles.push(fullPath) // 收集 Markdown 文件路径
        }
    }
}

/** 是否为围栏代码块分隔线（``` 或 ~~~） */
function isFencedDelimiter(line: string): boolean {
    const trimmed = line.trimStart()
    return trimmed.startsWith('```') || trimmed.startsWith('~~~')
}

/** 是否为围栏代码块分隔线（允许前置引用符号 >） */
function isFencedDelimiterLoose(line: string): boolean {
    const trimmed = line.replace(/^\s*>\s?/, '').trimStart()
    return trimmed.startsWith('```') || trimmed.startsWith('~~~')
}

/** 是否为标题行（# 开头） */
function isHeading(line: string): boolean {
    return /^\s*#{1,6}\s+/.test(line)
}

/** 是否为列表项（无序/有序） */
function isList(line: string): boolean {
    return /^(\s*)([-*+]\s+|\d+\.\s+)/.test(line)
}

/** 是否为引用行（> 开头） */
function isBlockquote(line: string): boolean {
    return /^\s*>\s?/.test(line)
}

/** 是否为表格相关行（| 行或分隔线） */
function isTable(line: string): boolean {
    const trimmed = line.trim()
    if (!trimmed) return false
    if (trimmed.startsWith('|')) return true
    if (/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed)) return true
    return false
}

/** 是否为 HTML 区块起始行（<tag ...>） */
function isHtmlBlockStart(line: string): boolean {
    return /^\s*<([a-zA-Z]+)(\s|>|$)/.test(line)
}

/** 是否为缩进代码（前导 4 空格或 Tab） */
function isCodeIndented(line: string): boolean {
    return /^(\t| {4,})/.test(line)
}

/** 当前行是否已存在两个结尾空格（避免重复添加） */
function hasTrailingTwoSpaces(line: string): boolean {
    return /  $/.test(line)
}

/** 结构性语法（排除引用）判定，用于普通段落过滤 */
function isStructuralExceptBlockquote(line: string): boolean {
    if (!line) return true
    const predicates: LinePredicate[] = [
        isHeading,
        isList,
        // 不包含 isBlockquote
        isTable,
        isHtmlBlockStart,
        isCodeIndented,
    ]
    return predicates.some((fn) => fn(line))
}

// 启动异步主流程
main().catch((err) => {
    console.error('【addLineBreakSpaces】执行失败：', err)
})
