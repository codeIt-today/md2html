const fs = require('fs')
const path = require('path')
const MarkdownIt = require('markdown-it')
const sourceDir = path.join(__dirname, 'samples')   // source directory of .md
const outputDir = path.join(__dirname, 'output')    // output directory of .html

// recursively mkdir
const rmkdir = p => {
  p
    .split('/')
    .reduce((p, folder) => {
      p += folder + '/'
      if (!fs.existsSync(p)) {
        fs.mkdirSync(p)
      }
      return p
    }, '')
}

// get relative path for writing html
const getRelativePath = filePath => {
  const dir = path.dirname(filePath)
  return dir.substr(sourceDir.length, dir.length)
}

// read md, write html
const md2html = filename => {
  fs.readFile(filename, 'utf-8', (err, data) => {
    if (err) throw new Error(err)

    let output
    let md = new MarkdownIt({   // MarkdownIt options
      html: true,
      xhtmlOut: false,
      typographer: true,
      linkify: true
    })

    try {
      output = md.render(data)
    } catch (e) {
      throw new Error(err)
    }

    const absolutePath = path.join(outputDir, getRelativePath(filename))
    if (!fs.existsSync(absolutePath)) {
      rmkdir(absolutePath)
    }
    const basename = path.basename(filename, '.md')
    fs.writeFileSync(path.join(absolutePath, `${basename}.html`), output)
  })
}

const walk = (dir, spaces = '--') => {
  fs.readdir(dir, (err, stuff) => {
    if (err) throw new Error(err)

    stuff.forEach(e => {
      if (fs.lstatSync(path.join(dir, e)).isFile() && path.extname(e) === '.md') {
        console.log(`${spaces} ${e}`)
        md2html(path.join(dir, e))
      } else if (fs.lstatSync(path.join(dir, e)).isDirectory()) {
        console.log(`${spaces} ${e}\\`)
        walk(path.join(dir, e), spaces + '--')
      }
    })
  })
}

walk(sourceDir)
